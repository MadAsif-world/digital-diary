import { Repository } from "./repository";
import type {
  UserSettings, PlannerDay, Priority, Task, Reminder, Bill,
  ShoppingList, ShoppingItem, Note, HealthLog, MealPlan,
  LoveMeterEntry, CalendarEvent,
} from "./types";

export const settingsRepo = new Repository<UserSettings>("user_settings", [
  "displayName", "themeAccent", "startOfWeek", "notificationsEnabled", "onboardedAt",
]);

export const plannerDayRepo = new Repository<PlannerDay>("planner_days", [
  "dayKey", "thoughtCapture",
]);

export const priorityRepo = new Repository<Priority>("priorities", [
  "dayKey", "text", "note", "done", "position",
]);

export const taskRepo = new Repository<Task>("tasks", [
  "title", "category", "dueDate", "level", "done", "completedAt",
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

export const noteRepo = new Repository<Note>("notes", [
  "title", "body", "pinned",
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
