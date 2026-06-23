import { create } from "zustand";
import { initDatabase } from "../db/database";
import { settingsRepo, plannerDayRepo } from "../db/repositories";
import type { UserSettings, PlannerDay } from "../db/types";
import { dayKey } from "../lib/date";

interface AppState {
  ready: boolean;
  settings: UserSettings | null;
  /** The planner "page" currently being viewed across day-scoped modules. */
  selectedDayKey: string;
  /** The device's current calendar day; refreshed on foreground / midnight. */
  todayKey: string;
  plannerDay: PlannerDay | null;

  init: () => Promise<void>;
  setDay: (key: string) => Promise<void>;
  /** Re-check the device date; advance the view if it was sitting on "today". */
  tickToday: () => Promise<void>;
  loadPlannerDay: (key: string) => Promise<void>;
  saveThought: (text: string) => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  settings: null,
  selectedDayKey: dayKey(),
  todayKey: dayKey(),
  plannerDay: null,

  init: async () => {
    await initDatabase();
    const settings = await settingsRepo.first("1 = 1");
    set({ settings, ready: true });
    await get().loadPlannerDay(get().selectedDayKey);
  },

  setDay: async (key) => {
    set({ selectedDayKey: key });
    await get().loadPlannerDay(key);
  },

  tickToday: async () => {
    const now = dayKey();
    if (now === get().todayKey) return;
    const wasOnToday = get().selectedDayKey === get().todayKey;
    set({ todayKey: now });
    if (wasOnToday) await get().setDay(now);
  },

  loadPlannerDay: async (key) => {
    const plannerDay = await plannerDayRepo.getOrCreate(
      "dayKey = ?",
      [key],
      { dayKey: key, thoughtCapture: "" },
    );
    set({ plannerDay });
  },

  saveThought: async (text) => {
    const day = get().plannerDay;
    if (!day) return;
    const updated = await plannerDayRepo.update(day.id, { thoughtCapture: text });
    set({ plannerDay: updated });
  },

  updateSettings: async (patch) => {
    const s = get().settings;
    if (!s) return;
    const updated = await settingsRepo.update(s.id, patch);
    set({ settings: updated });
  },
}));
