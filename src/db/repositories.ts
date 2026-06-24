import { Repository } from "./repository";
import type {
  UserSettings, PlannerDay, Priority, Task, TaskList, Reminder, Bill,
  ShoppingList, ShoppingItem, Note, Notebook, HealthLog, MealPlan,
  LoveMeterEntry, CalendarEvent, Habit, HabitLog,
} from "./types";

export const settingsRepo = new Repository<UserSettings>("user_settings", [
  "displayName", "themeAccent", "startOfWeek", "notificationsEnabled", "onboardedAt",
  "waterGoalMl", "stepsGoal", "sleepGoalHours", "meditationGoalMin", "workoutGoalMin",
  "waterReminderEnabled", "waterReminderEveryMin", "breathReminderEnabled", "breathReminderTime",
]);

export const plannerDayRepo = new Repository<PlannerDay>("planner_days", [
  "dayKey", "thoughtCapture",
]);

export const priorityRepo = new Repository<Priority>("priorities", [
  "dayKey", "text", "note", "done", "position",
]);

export const taskListRepo = new Repository<TaskList>("task_lists", [
  "name", "position",
]);

export const taskRepo = new Repository<Task>("tasks", [
  "listId", "title", "category", "dueDate", "level", "done", "completedAt",
]);

export const reminderRepo = new Repository<Reminder>("reminders", [
  "title", "note", "remindAt", "repeat", "done", "snoozedUntil", "notificationId",
]);

export const billRepo = new Repository<Bill>("bills", [
  "name", "amount", "dueDate", "paid", "category", "notes",
]);

export const shoppingListRepo = new Repository<ShoppingList>("shopping_lists", [
  "name", "position",
]);

export const shoppingItemRepo = new Repository<ShoppingItem>("shopping_items", [
  "listId", "name", "quantity", "category", "estPrice", "checked", "position",
]);

export const notebookRepo = new Repository<Notebook>("notebooks", [
  "name", "color", "position",
]);

export const noteRepo = new Repository<Note>("notes", [
  "notebookId", "title", "body", "pinned",
]);

export const healthRepo = new Repository<HealthLog>("health_logs", [
  "dayKey", "waterMl", "steps", "workoutMin", "meditationMin", "yogaMin",
  "sleepHours", "mood", "note",
]);

export const mealRepo = new Repository<MealPlan>("meal_plans", [
  "dayKey", "breakfast", "lunch", "dinner", "snacks", "note",
]);

export const loveRepo = new Repository<LoveMeterEntry>("love_entries", [
  "dayKey", "loveRating", "meTime", "happyFor", "goalTomorrow", "reflection",
]);

export const eventRepo = new Repository<CalendarEvent>("calendar_events", [
  "dayKey", "title", "time", "kind", "note",
]);

export const habitRepo = new Repository<Habit>("habits", [
  "name", "color", "position",
]);

export const habitLogRepo = new Repository<HabitLog>("habit_logs", [
  "habitId", "dayKey",
]);
