import { create } from "zustand";
import { reminderRepo } from "../db/repositories";
import type { Reminder, RepeatRule } from "../db/types";
import { scheduleReminder, cancelReminder } from "../notifications";
import { nowIso } from "../lib/id";

interface ReminderState {
  reminders: Reminder[];
  load: () => Promise<void>;
  add: (input: { title: string; note?: string; at: Date; repeat?: RepeatRule }) => Promise<void>;
  update: (id: string, patch: Partial<Reminder>) => Promise<void>;
  edit: (id: string, input: { title?: string; note?: string; at?: Date; repeat?: RepeatRule }) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  snooze: (id: string, minutes: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],

  load: async () => {
    set({ reminders: await reminderRepo.all("done ASC, remindAt ASC") });
  },

  add: async ({ title, note = "", at, repeat = "none" }) => {
    const notificationId = await scheduleReminder({ title, body: note, at, repeat });
    await reminderRepo.insert({
      title, note, remindAt: at.toISOString(), repeat,
      done: 0, snoozedUntil: null, notificationId,
    });
    await get().load();
  },

  update: async (id, patch) => {
    await reminderRepo.update(id, patch);
    await get().load();
  },

  edit: async (id, input) => {
    const r = get().reminders.find((x) => x.id === id);
    if (!r) return;
    const title = input.title ?? r.title;
    const note = input.note ?? r.note;
    const at = input.at ?? new Date(r.remindAt);
    const repeat = input.repeat ?? r.repeat;
    // Reschedule so the OS notification matches the edited content/time.
    await cancelReminder(r.notificationId);
    const notificationId = r.done ? null : await scheduleReminder({ title, body: note, at, repeat });
    await reminderRepo.update(id, {
      title, note, remindAt: at.toISOString(), repeat, notificationId,
    });
    await get().load();
  },

  toggleDone: async (id) => {
    const r = get().reminders.find((x) => x.id === id);
    if (!r) return;
    const done = r.done ? 0 : 1;
    if (done) await cancelReminder(r.notificationId);
    await reminderRepo.update(id, { done, notificationId: done ? null : r.notificationId });
    await get().load();
  },

  snooze: async (id, minutes) => {
    const r = get().reminders.find((x) => x.id === id);
    if (!r) return;
    await cancelReminder(r.notificationId);
    const at = new Date(Date.now() + minutes * 60_000);
    const notificationId = await scheduleReminder({ title: r.title, body: r.note, at, repeat: "none" });
    await reminderRepo.update(id, {
      snoozedUntil: at.toISOString(), remindAt: at.toISOString(), notificationId, done: 0,
    });
    await get().load();
  },

  remove: async (id) => {
    const r = get().reminders.find((x) => x.id === id);
    if (r) await cancelReminder(r.notificationId);
    await reminderRepo.remove(id);
    await get().load();
  },
}));

export function upcomingReminders(reminders: Reminder[], limit = 5): Reminder[] {
  const now = nowIso();
  return reminders.filter((r) => !r.done && r.remindAt >= now).slice(0, limit);
}
