import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { SCHEMA_SQL, SCHEMA_VERSION } from "./schema";
import { uuid, nowIso } from "../lib/id";
import { dayKey } from "../lib/date";
import { createWebDatabase } from "./webdb";

// On web there's no native SQLite module, so we use an in-memory adapter that
// implements the same async surface. Native uses real SQLite.
let _db: SQLite.SQLiteDatabase | null = null;

export function db(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db =
      Platform.OS === "web"
        ? (createWebDatabase() as unknown as SQLite.SQLiteDatabase)
        : SQLite.openDatabaseSync("aura.db");
  }
  return _db;
}

let _initPromise: Promise<void> | null = null;

/**
 * Incremental migrations for databases created on an older SCHEMA_VERSION.
 * Each step is applied in its own try/catch so a re-run (or a column that
 * already exists) is harmless. New installs skip these — CREATE TABLE in
 * SCHEMA_SQL already includes the columns.
 */
const MIGRATIONS: Record<number, string[]> = {
  2: [
    `ALTER TABLE user_settings ADD COLUMN waterGoalMl INTEGER NOT NULL DEFAULT 2000`,
    `ALTER TABLE user_settings ADD COLUMN stepsGoal INTEGER NOT NULL DEFAULT 8000`,
    `ALTER TABLE user_settings ADD COLUMN sleepGoalHours REAL NOT NULL DEFAULT 8`,
    `ALTER TABLE user_settings ADD COLUMN meditationGoalMin INTEGER NOT NULL DEFAULT 10`,
    `ALTER TABLE user_settings ADD COLUMN workoutGoalMin INTEGER NOT NULL DEFAULT 30`,
    `ALTER TABLE user_settings ADD COLUMN waterReminderEnabled INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE user_settings ADD COLUMN waterReminderEveryMin INTEGER NOT NULL DEFAULT 120`,
    `ALTER TABLE user_settings ADD COLUMN breathReminderEnabled INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE user_settings ADD COLUMN breathReminderTime TEXT NOT NULL DEFAULT '09:00'`,
  ],
  3: [
    `CREATE TABLE IF NOT EXISTS task_lists (
      id TEXT PRIMARY KEY NOT NULL, localId TEXT NOT NULL, userId TEXT,
      createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, deletedAt TEXT,
      syncStatus TEXT NOT NULL DEFAULT 'local',
      name TEXT NOT NULL DEFAULT '', position INTEGER NOT NULL DEFAULT 0
    )`,
    `ALTER TABLE tasks ADD COLUMN listId TEXT`,
  ],
};

async function storedVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const row = await database.getFirstAsync<{ value: string }>(
      `SELECT value FROM _meta WHERE key = 'schema_version'`,
    );
    return row ? Number(row.value) : 0;
  } catch {
    return 0; // _meta doesn't exist yet → brand new database
  }
}

async function runMigrations(database: SQLite.SQLiteDatabase, from: number): Promise<void> {
  for (let v = from + 1; v <= SCHEMA_VERSION; v++) {
    for (const sql of MIGRATIONS[v] ?? []) {
      try {
        await database.execAsync(sql);
      } catch {
        // Column already present (fresh DB or partial prior run) — safe to skip.
      }
    }
  }
}

/** Idempotent. Creates tables, runs migrations, sets the schema version, seeds. */
export function initDatabase(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const database = db();
    const prev = await storedVersion(database);
    await database.execAsync(SCHEMA_SQL);
    if (prev > 0 && prev < SCHEMA_VERSION) await runMigrations(database, prev);
    await database.runAsync(
      `INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)`,
      [String(SCHEMA_VERSION)],
    );
    await seedFirstRun(database);
    await ensureTaskListDefaults(database);
  })();
  return _initPromise;
}

/**
 * Guarantee at least one task list exists and that no task is orphaned. Runs on
 * every init so both fresh installs and v2→v3 upgrades (whose existing tasks
 * have a NULL listId) end up consistent. Uses per-row updates so the web
 * adapter — which only understands `WHERE id = ?` — works too.
 */
async function ensureTaskListDefaults(database: SQLite.SQLiteDatabase) {
  const existing = await database.getFirstAsync<{ id: string }>(
    `SELECT id FROM task_lists WHERE deletedAt IS NULL ORDER BY position LIMIT 1`,
  );
  let listId = existing?.id;
  if (!listId) {
    const ts = nowIso();
    const id = uuid();
    await database.runAsync(
      `INSERT INTO task_lists
        (id, localId, userId, createdAt, updatedAt, deletedAt, syncStatus, name, position)
       VALUES (?, ?, NULL, ?, ?, NULL, 'local', 'My Tasks', 0)`,
      [id, id, ts, ts],
    );
    listId = id;
  }
  const orphans = await database.getAllAsync<{ id: string }>(
    `SELECT id FROM tasks WHERE listId IS NULL`,
  );
  for (const o of orphans) {
    await database.runAsync(`UPDATE tasks SET listId = ? WHERE id = ?`, [listId, o.id]);
  }
}

async function seedFirstRun(database: SQLite.SQLiteDatabase) {
  const settings = await database.getFirstAsync<{ id: string }>(
    `SELECT id FROM user_settings LIMIT 1`,
  );
  if (settings) return;

  const ts = nowIso();
  const envelope = () => {
    const id = uuid();
    return { id, localId: id, ts };
  };

  // Default settings row (incl. v2 goal/reminder defaults so web seeds match).
  const s = envelope();
  await database.runAsync(
    `INSERT INTO user_settings
      (id, localId, userId, createdAt, updatedAt, deletedAt, syncStatus,
       displayName, themeAccent, startOfWeek, notificationsEnabled, onboardedAt,
       waterGoalMl, stepsGoal, sleepGoalHours, meditationGoalMin, workoutGoalMin,
       waterReminderEnabled, waterReminderEveryMin, breathReminderEnabled, breathReminderTime)
     VALUES (?, ?, NULL, ?, ?, NULL, 'local', '', 'gold', 0, 1, NULL,
       2000, 8000, 8, 10, 30, 0, 120, 0, '09:00')`,
    [s.id, s.localId, s.ts, s.ts],
  );

  // A starter shopping list so the module isn't empty on first open.
  const l = envelope();
  await database.runAsync(
    `INSERT INTO shopping_lists
      (id, localId, userId, createdAt, updatedAt, deletedAt, syncStatus, name, position)
     VALUES (?, ?, NULL, ?, ?, NULL, 'local', 'Groceries', 0)`,
    [l.id, l.localId, l.ts, l.ts],
  );

  // Today's planner day shell.
  const d = envelope();
  await database.runAsync(
    `INSERT INTO planner_days
      (id, localId, userId, createdAt, updatedAt, deletedAt, syncStatus, dayKey, thoughtCapture)
     VALUES (?, ?, NULL, ?, ?, NULL, 'local', ?, '')`,
    [d.id, d.localId, d.ts, d.ts, dayKey()],
  );
}

/** Test/dev helper: wipe all data and re-seed. */
export async function resetDatabase(): Promise<void> {
  const database = db();
  const tables = [
    "user_settings", "planner_days", "priorities", "tasks", "reminders",
    "bills", "shopping_lists", "shopping_items", "notes", "health_logs",
    "meal_plans", "love_entries", "calendar_events",
  ];
  for (const t of tables) await database.execAsync(`DELETE FROM ${t};`);
  await seedFirstRun(database);
}
