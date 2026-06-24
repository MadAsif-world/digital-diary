import { create } from "zustand";
import { taskRepo, taskListRepo } from "../db/repositories";
import type { Task, TaskList, PriorityLevel } from "../db/types";
import { nowIso } from "../lib/id";
import { dayKey } from "../lib/date";

interface TaskState {
  /** All tasks across every list — the dashboard and schedule read this. */
  tasks: Task[];
  lists: TaskList[];
  activeListId: string | null;

  load: () => Promise<void>;
  setActiveList: (id: string) => void;
  addList: (name: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;

  add: (input: { title: string; category?: string; dueDate?: string | null; level?: PriorityLevel; listId?: string | null }) => Promise<void>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  lists: [],
  activeListId: null,

  load: async () => {
    const [tasks, lists] = await Promise.all([
      taskRepo.all("done ASC, createdAt DESC"),
      taskListRepo.all("position ASC, createdAt ASC"),
    ]);
    const current = get().activeListId;
    const active = current && lists.some((l) => l.id === current) ? current : (lists[0]?.id ?? null);
    set({ tasks, lists, activeListId: active });
  },

  setActiveList: (id) => set({ activeListId: id }),

  addList: async (name) => {
    const position = get().lists.length;
    const created = await taskListRepo.insert({ name, position });
    await get().load();
    const id = created?.id ?? get().lists.find((l) => l.name === name)?.id;
    if (id) set({ activeListId: id });
  },

  renameList: async (id, name) => {
    await taskListRepo.update(id, { name });
    await get().load();
  },

  removeList: async (id) => {
    // Remove the list and the tasks that belong to it.
    for (const t of get().tasks.filter((x) => x.listId === id)) {
      await taskRepo.remove(t.id);
    }
    await taskListRepo.remove(id);
    if (get().activeListId === id) set({ activeListId: null });
    await get().load();
  },

  add: async ({ title, category = "General", dueDate = null, level = "medium", listId }) => {
    const lid = listId ?? get().activeListId;
    await taskRepo.insert({ listId: lid, title, category, dueDate, level, done: 0, completedAt: null });
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
