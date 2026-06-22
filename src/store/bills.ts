import { create } from "zustand";
import { billRepo } from "../db/repositories";
import type { Bill } from "../db/types";
import { dayKey } from "../lib/date";

interface BillState {
  bills: Bill[];
  load: () => Promise<void>;
  add: (input: { name: string; amount: number; dueDate: string; category?: string; notes?: string }) => Promise<void>;
  update: (id: string, patch: Partial<Bill>) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],

  load: async () => {
    set({ bills: await billRepo.all("paid ASC, dueDate ASC") });
  },

  add: async ({ name, amount, dueDate, category = "General", notes = "" }) => {
    await billRepo.insert({ name, amount, dueDate, category, notes, paid: 0 });
    await get().load();
  },

  update: async (id, patch) => {
    await billRepo.update(id, patch);
    await get().load();
  },

  togglePaid: async (id) => {
    const b = get().bills.find((x) => x.id === id);
    if (!b) return;
    await billRepo.update(id, { paid: b.paid ? 0 : 1 });
    await get().load();
  },

  remove: async (id) => {
    await billRepo.remove(id);
    await get().load();
  },
}));

export function billTotals(bills: Bill[]) {
  const unpaid = bills.filter((b) => !b.paid);
  const due = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const today = dayKey();
  const overdue = unpaid.filter((b) => b.dueDate < today);
  return { unpaidCount: unpaid.length, dueAmount: due, overdueCount: overdue.length };
}
