import { create } from "zustand";
import { eventRepo } from "../db/repositories";
import type { CalendarEvent, EventKind } from "../db/types";

interface EventState {
  /** Events for the visible month, keyed by dayKey. */
  byDay: Record<string, CalendarEvent[]>;
  loadMonth: (year: number, monthIndex: number) => Promise<void>;
  loadDay: (dayKey: string) => Promise<void>;
  add: (input: { dayKey: string; title: string; time?: string | null; kind?: EventKind; note?: string }) => Promise<void>;
  update: (id: string, dayKey: string, patch: Partial<CalendarEvent>) => Promise<void>;
  remove: (id: string, dayKey: string) => Promise<void>;
}

function group(rows: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const r of rows) (map[r.dayKey] ??= []).push(r);
  return map;
}

export const useEventStore = create<EventState>((set, get) => ({
  byDay: {},

  loadMonth: async (year, monthIndex) => {
    const start = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(monthIndex + 1).padStart(2, "0")}-31`;
    const rows = await eventRepo.where(
      "dayKey >= ? AND dayKey <= ?", [start, end], "time ASC, createdAt ASC",
    );
    set({ byDay: group(rows) });
  },

  loadDay: async (dayKey) => {
    const rows = await eventRepo.where("dayKey = ?", [dayKey], "time ASC, createdAt ASC");
    set({ byDay: { ...get().byDay, [dayKey]: rows } });
  },

  add: async ({ dayKey, title, time = null, kind = "event", note = "" }) => {
    await eventRepo.insert({ dayKey, title, time, kind, note });
    await get().loadDay(dayKey);
  },

  update: async (id, dayKey, patch) => {
    await eventRepo.update(id, patch);
    await get().loadDay(dayKey);
  },

  remove: async (id, dayKey) => {
    await eventRepo.remove(id);
    await get().loadDay(dayKey);
  },
}));
