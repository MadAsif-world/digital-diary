import { create } from "zustand";
import { taskRepo } from "../db/repositories";
import type { Task, PriorityLevel } from "../db/types";
import { nowIso } from "../lib/id";
import { dayKey } from "../lib/date";

interface TaskState {
  tasks: Task[];
  load: () => Promise<void>;
  add: (input: { title: string; category?: string; dueDate?: string | null; level?: PriorityLevel }) => Promise<void>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  load: async () => {
    set({ tasks: await taskRepo.all("done ASC, createdAt DESC") });
  },

  add: async ({ title, category = "General", dueDate = null, level = "medium" }) => {
    await taskRepo.insert({ title, category, dueDate, level, done: 0, completedAt: null });
    await get().load();
  },

  update: async (id, patch) => {
    await taskRepo.update(id, patch);
    await get().load();
  },

  toggle: async (id) => {
    const t = get().tasks.find((x) => x.id === id);
    if (!t) return;
    const done = t.done ? 0 : 1;
    await taskRepo.update(id, { done, completedAt: done ? nowIso() : null });
    await get().load();
  },

  remove: async (id) => {
    await taskRepo.remove(id);
    await get().load();
  },
}));

/** Selector: tasks due today or overdue and not done. */
export function todaysTasks(tasks: Task[]): Task[] {
  const today = dayKey();
  return tasks.filter((t) => !t.done && t.dueDate && t.dueDate <= today);
}
