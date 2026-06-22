import { create } from "zustand";
import {
  priorityRepo, healthRepo, mealRepo, loveRepo,
} from "../db/repositories";
import type { Priority, HealthLog, MealPlan, LoveMeterEntry } from "../db/types";

/**
 * Day-scoped planner data: Priorities, Health log, Meal plan, and Love Meter
 * all hang off a single calendar day. `load(dayKey)` hydrates them together so
 * the dashboard and individual modules read from one source of truth.
 */
interface DayState {
  dayKey: string | null;
  priorities: Priority[];
  health: HealthLog | null;
  meal: MealPlan | null;
  love: LoveMeterEntry | null;

  load: (dayKey: string) => Promise<void>;

  // Priorities
  addPriority: (text: string) => Promise<void>;
  updatePriority: (id: string, patch: Partial<Priority>) => Promise<void>;
  togglePriority: (id: string) => Promise<void>;
  removePriority: (id: string) => Promise<void>;

  // Health
  updateHealth: (patch: Partial<HealthLog>) => Promise<void>;

  // Meals
  updateMeal: (patch: Partial<MealPlan>) => Promise<void>;

  // Love Meter
  updateLove: (patch: Partial<LoveMeterEntry>) => Promise<void>;
}

export const useDayStore = create<DayState>((set, get) => ({
  dayKey: null,
  priorities: [],
  health: null,
  meal: null,
  love: null,

  load: async (key) => {
    const [priorities, health, meal, love] = await Promise.all([
      priorityRepo.where("dayKey = ?", [key], "position ASC, createdAt ASC"),
      healthRepo.getOrCreate("dayKey = ?", [key], {
        dayKey: key, waterMl: 0, steps: 0, workoutMin: 0, meditationMin: 0,
        yogaMin: 0, sleepHours: 0, mood: 3, note: "",
      }),
      mealRepo.getOrCreate("dayKey = ?", [key], {
        dayKey: key, breakfast: "", lunch: "", dinner: "", snacks: "", note: "",
      }),
      loveRepo.getOrCreate("dayKey = ?", [key], {
        dayKey: key, loveRating: 3, meTime: "", happyFor: "",
        goalTomorrow: "", reflection: "",
      }),
    ]);
    set({ dayKey: key, priorities, health, meal, love });
  },

  addPriority: async (text) => {
    const key = get().dayKey;
    if (!key) return;
    const position = get().priorities.length;
    await priorityRepo.insert({ dayKey: key, text, note: "", done: 0, position });
    set({ priorities: await priorityRepo.where("dayKey = ?", [key], "position ASC, createdAt ASC") });
  },

  updatePriority: async (id, patch) => {
    await priorityRepo.update(id, patch);
    const key = get().dayKey!;
    set({ priorities: await priorityRepo.where("dayKey = ?", [key], "position ASC, createdAt ASC") });
  },

  togglePriority: async (id) => {
    const p = get().priorities.find((x) => x.id === id);
    if (!p) return;
    await get().updatePriority(id, { done: p.done ? 0 : 1 });
  },

  removePriority: async (id) => {
    await priorityRepo.remove(id);
    const key = get().dayKey!;
    set({ priorities: await priorityRepo.where("dayKey = ?", [key], "position ASC, createdAt ASC") });
  },

  updateHealth: async (patch) => {
    const h = get().health;
    if (!h) return;
    const health = await healthRepo.update(h.id, patch);
    set({ health });
  },

  updateMeal: async (patch) => {
    const m = get().meal;
    if (!m) return;
    const meal = await mealRepo.update(m.id, patch);
    set({ meal });
  },

  updateLove: async (patch) => {
    const l = get().love;
    if (!l) return;
    const love = await loveRepo.update(l.id, patch);
    set({ love });
  },
}));
