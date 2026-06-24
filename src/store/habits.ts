import { create } from "zustand";
import { habitRepo, habitLogRepo } from "../db/repositories";
import type { Habit } from "../db/types";
import { dayKey, addDays } from "../lib/date";

interface HabitState {
  habits: Habit[];
  /** habitId -> completed dayKeys within the recent window. */
  logs: Record<string, string[]>;

  load: () => Promise<void>;
  addHabit: (name: string) => Promise<void>;
  renameHabit: (id: string, name: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggle: (habitId: string, day: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: {},

  load: async () => {
    const habits = await habitRepo.all("position ASC, createdAt ASC");
    const rows = await habitLogRepo.all("dayKey ASC");
    const logs: Record<string, string[]> = {};
    for (const r of rows) (logs[r.habitId] ??= []).push(r.dayKey);
    set({ habits, logs });
  },

  addHabit: async (name) => {
    const position = get().habits.length;
    await habitRepo.insert({ name, color: "gold", position });
    await get().load();
  },

  renameHabit: async (id, name) => {
    await habitRepo.update(id, { name });
    await get().load();
  },

  removeHabit: async (id) => {
    for (const l of await habitLogRepo.where("habitId = ?", [id])) {
      await habitLogRepo.remove(l.id);
    }
    await habitRepo.remove(id);
    await get().load();
  },

  toggle: async (habitId, day) => {
    const existing = await habitLogRepo.first("habitId = ? AND dayKey = ?", [habitId, day]);
    if (existing) await habitLogRepo.remove(existing.id);
    else await habitLogRepo.insert({ habitId, dayKey: day });
    await get().load();
  },
}));

/** Consecutive completed days ending today (today is allowed to still be pending). */
export function habitStreak(days: string[]): number {
  const done = new Set(days);
  let k = dayKey();
  if (!done.has(k)) k = addDays(k, -1);
  let s = 0;
  while (done.has(k)) { s++; k = addDays(k, -1); }
  return s;
}
