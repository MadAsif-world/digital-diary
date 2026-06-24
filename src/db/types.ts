/**
 * Local-first data models.
 *
 * Every synced record carries the same envelope of fields so it can be created
 * offline now and reconciled with Supabase later without a migration:
 *   id          — stable UUID assigned at creation (client-authoritative)
 *   localId     — device-scoped id (kept distinct for future multi-device merge)
 *   userId      — nullable until auth lands
 *   createdAt / updatedAt — ISO timestamps for last-write-wins conflict handling
 *   deletedAt   — soft-delete tombstone (nullable)
 *   syncStatus  — local | synced | pending | conflict
 */

export type SyncStatus = "local" | "synced" | "pending" | "conflict";

export interface SyncBase {
  id: string;
  localId: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

export type PriorityLevel = "low" | "medium" | "high";
export type RepeatRule = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type EventKind = "event" | "task" | "reminder";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

export interface UserSettings extends SyncBase {
  displayName: string;
  themeAccent: "gold" | "love";
  startOfWeek: number; // 0 = Sunday
  notificationsEnabled: number; // 0 | 1
  onboardedAt: string | null;
  // Personal health goals (schema v2)
  waterGoalMl: number;
  stepsGoal: number;
  sleepGoalHours: number;
  meditationGoalMin: number;
  workoutGoalMin: number;
  // Wellness reminders (schema v2)
  waterReminderEnabled: number; // 0 | 1
  waterReminderEveryMin: number;
  breathReminderEnabled: number; // 0 | 1
  breathReminderTime: string; // HH:mm
}

/** Fallback goal values when a settings row predates schema v2 (e.g. web). */
export const DEFAULT_GOALS = {
  waterGoalMl: 2000,
  stepsGoal: 8000,
  sleepGoalHours: 8,
  meditationGoalMin: 10,
  workoutGoalMin: 30,
} as const;

export interface PlannerDay extends SyncBase {
  dayKey: string; // YYYY-MM-DD
  thoughtCapture: string;
}

export interface Priority extends SyncBase {
  dayKey: string;
  text: string;
  note: string;
  done: number; // 0 | 1
  position: number;
}

export interface TaskList extends SyncBase {
  name: string;
  position: number;
}

export interface Task extends SyncBase {
  listId: string | null;
  title: string;
  category: string;
  dueDate: string | null; // YYYY-MM-DD
  level: PriorityLevel;
  done: number; // 0 | 1
  completedAt: string | null;
}

export interface Reminder extends SyncBase {
  title: string;
  note: string;
  remindAt: string; // ISO datetime
  repeat: RepeatRule;
  done: number; // 0 | 1
  snoozedUntil: string | null;
  notificationId: string | null;
}

export interface Bill extends SyncBase {
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: number; // 0 | 1
  category: string;
  notes: string;
}

export interface ShoppingList extends SyncBase {
  name: string;
  position: number;
}

export interface ShoppingItem extends SyncBase {
  listId: string;
  name: string;
  quantity: number;
  category: string;
  estPrice: number | null;
  checked: number; // 0 | 1
  position: number;
}

export interface Note extends SyncBase {
  title: string;
  body: string;
  pinned: number; // 0 | 1
}

export interface HealthLog extends SyncBase {
  dayKey: string;
  waterMl: number;
  steps: number;
  workoutMin: number;
  meditationMin: number;
  yogaMin: number;
  sleepHours: number;
  mood: number; // 1..5
  note: string;
}

export interface MealPlan extends SyncBase {
  dayKey: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  note: string;
}

export interface LoveMeterEntry extends SyncBase {
  dayKey: string;
  loveRating: number; // 1..5
  meTime: string;
  happyFor: string;
  goalTomorrow: string;
  reflection: string;
}

export interface CalendarEvent extends SyncBase {
  dayKey: string;
  title: string;
  time: string | null; // HH:mm
  kind: EventKind;
  note: string;
}

export interface Habit extends SyncBase {
  name: string;
  color: string; // "gold" | "love" | hex — accent hint for the UI
  position: number;
}

export interface HabitLog extends SyncBase {
  habitId: string;
  dayKey: string; // a day this habit was completed
}
