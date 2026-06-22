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

/** Idempotent. Creates tables, sets the schema version, and seeds first-run data. */
export function initDatabase(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const database = db();
    await database.execAsync(SCHEMA_SQL);
    await database.runAsync(
      `INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)`,
      [String(SCHEMA_VERSION)],
    );
    await seedFirstRun(database);
  })();
  return _initPromise;
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

  // Default settings row.
  const s = envelope();
  await database.runAsync(
    `INSERT INTO user_settings
      (id, localId, userId, createdAt, updatedAt, deletedAt, syncStatus,
       displayName, themeAccent, startOfWeek, notificationsEnabled, onboardedAt)
     VALUES (?, ?, NULL, ?, ?, NULL, 'local', '', 'gold', 0, 1, NULL)`,
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
