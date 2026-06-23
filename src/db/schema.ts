/**
 * SQLite schema. Booleans are stored as INTEGER (0/1) and timestamps as TEXT
 * (ISO 8601). Every table shares the sync envelope columns so a future Supabase
 * push/pull can treat them uniformly.
 */

const SYNC_COLUMNS = `
  id TEXT PRIMARY KEY NOT NULL,
  localId TEXT NOT NULL,
  userId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT,
  syncStatus TEXT NOT NULL DEFAULT 'local'
`;

export const SCHEMA_VERSION = 2;

export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_settings (
  ${SYNC_COLUMNS},
  displayName TEXT NOT NULL DEFAULT '',
  themeAccent TEXT NOT NULL DEFAULT 'gold',
  startOfWeek INTEGER NOT NULL DEFAULT 0,
  notificationsEnabled INTEGER NOT NULL DEFAULT 1,
  onboardedAt TEXT,
  waterGoalMl INTEGER NOT NULL DEFAULT 2000,
  stepsGoal INTEGER NOT NULL DEFAULT 8000,
  sleepGoalHours REAL NOT NULL DEFAULT 8,
  meditationGoalMin INTEGER NOT NULL DEFAULT 10,
  workoutGoalMin INTEGER NOT NULL DEFAULT 30,
  waterReminderEnabled INTEGER NOT NULL DEFAULT 0,
  waterReminderEveryMin INTEGER NOT NULL DEFAULT 120,
  breathReminderEnabled INTEGER NOT NULL DEFAULT 0,
  breathReminderTime TEXT NOT NULL DEFAULT '09:00'
);

CREATE TABLE IF NOT EXISTS planner_days (
  ${SYNC_COLUMNS},
  dayKey TEXT NOT NULL,
  thoughtCapture TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_planner_days_daykey ON planner_days(dayKey);

CREATE TABLE IF NOT EXISTS priorities (
  ${SYNC_COLUMNS},
  dayKey TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  done INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_priorities_daykey ON priorities(dayKey);

CREATE TABLE IF NOT EXISTS tasks (
  ${SYNC_COLUMNS},
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  dueDate TEXT,
  level TEXT NOT NULL DEFAULT 'medium',
  done INTEGER NOT NULL DEFAULT 0,
  completedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(dueDate);

CREATE TABLE IF NOT EXISTS reminders (
  ${SYNC_COLUMNS},
  title TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  remindAt TEXT NOT NULL,
  repeat TEXT NOT NULL DEFAULT 'none',
  done INTEGER NOT NULL DEFAULT 0,
  snoozedUntil TEXT,
  notificationId TEXT
);
CREATE INDEX IF NOT EXISTS idx_reminders_at ON reminders(remindAt);

CREATE TABLE IF NOT EXISTS bills (
  ${SYNC_COLUMNS},
  name TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL DEFAULT 0,
  dueDate TEXT NOT NULL,
  paid INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'General',
  notes TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_bills_due ON bills(dueDate);

CREATE TABLE IF NOT EXISTS shopping_lists (
  ${SYNC_COLUMNS},
  name TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shopping_items (
  ${SYNC_COLUMNS},
  listId TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'General',
  estPrice REAL,
  checked INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_shopping_items_list ON shopping_items(listId);

CREATE TABLE IF NOT EXISTS notes (
  ${SYNC_COLUMNS},
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  pinned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS health_logs (
  ${SYNC_COLUMNS},
  dayKey TEXT NOT NULL,
  waterMl INTEGER NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  workoutMin INTEGER NOT NULL DEFAULT 0,
  meditationMin INTEGER NOT NULL DEFAULT 0,
  yogaMin INTEGER NOT NULL DEFAULT 0,
  sleepHours REAL NOT NULL DEFAULT 0,
  mood INTEGER NOT NULL DEFAULT 3,
  note TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_health_daykey ON health_logs(dayKey);

CREATE TABLE IF NOT EXISTS meal_plans (
  ${SYNC_COLUMNS},
  dayKey TEXT NOT NULL,
  breakfast TEXT NOT NULL DEFAULT '',
  lunch TEXT NOT NULL DEFAULT '',
  dinner TEXT NOT NULL DEFAULT '',
  snacks TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_daykey ON meal_plans(dayKey);

CREATE TABLE IF NOT EXISTS love_entries (
  ${SYNC_COLUMNS},
  dayKey TEXT NOT NULL,
  loveRating INTEGER NOT NULL DEFAULT 3,
  meTime TEXT NOT NULL DEFAULT '',
  happyFor TEXT NOT NULL DEFAULT '',
  goalTomorrow TEXT NOT NULL DEFAULT '',
  reflection TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_love_daykey ON love_entries(dayKey);

CREATE TABLE IF NOT EXISTS calendar_events (
  ${SYNC_COLUMNS},
  dayKey TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  time TEXT,
  kind TEXT NOT NULL DEFAULT 'event',
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_events_daykey ON calendar_events(dayKey);

CREATE TABLE IF NOT EXISTS _meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
