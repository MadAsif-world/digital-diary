import { create } from "zustand";
import { shoppingListRepo, shoppingItemRepo } from "../db/repositories";
import type { ShoppingList, ShoppingItem } from "../db/types";

interface ShoppingState {
  lists: ShoppingList[];
  items: Record<string, ShoppingItem[]>; // keyed by listId
  activeListId: string | null;

  load: () => Promise<void>;
  loadItems: (listId: string) => Promise<void>;
  setActiveList: (listId: string) => void;

  addList: (name: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;

  addItem: (listId: string, input: { name: string; quantity?: number; category?: string; estPrice?: number | null }) => Promise<void>;
  updateItem: (listId: string, id: string, patch: Partial<ShoppingItem>) => Promise<void>;
  toggleItem: (listId: string, id: string) => Promise<void>;
  removeItem: (listId: string, id: string) => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  lists: [],
  items: {},
  activeListId: null,

  load: async () => {
    const lists = await shoppingListRepo.all("position ASC, createdAt ASC");
    const active = get().activeListId ?? lists[0]?.id ?? null;
    set({ lists, activeListId: active });
    if (active) await get().loadItems(active);
  },

  loadItems: async (listId) => {
    const rows = await shoppingItemRepo.where("listId = ?", [listId], "checked ASC, position ASC, createdAt ASC");
    set({ items: { ...get().items, [listId]: rows } });
  },

  setActiveList: (listId) => {
    set({ activeListId: listId });
    void get().loadItems(listId);
  },

  addList: async (name) => {
    const position = get().lists.length;
    const created = await shoppingListRepo.insert({ name, position });
    await get().load();
    set({ activeListId: created.id });
  },

  renameList: async (id, name) => {
    await shoppingListRepo.update(id, { name });
    await get().load();
  },

  removeList: async (id) => {
    await shoppingListRepo.remove(id);
    set({ activeListId: null });
    await get().load();
  },

  addItem: async (listId, { name, quantity = 1, category = "General", estPrice = null }) => {
    const position = (get().items[listId]?.length ?? 0);
    await shoppingItemRepo.insert({ listId, name, quantity, category, estPrice, checked: 0, position });
    await get().loadItems(listId);
  },

  updateItem: async (listId, id, patch) => {
    await shoppingItemRepo.update(id, patch);
    await get().loadItems(listId);
  },

  toggleItem: async (listId, id) => {
    const item = get().items[listId]?.find((i) => i.id === id);
    if (!item) return;
    await shoppingItemRepo.update(id, { checked: item.checked ? 0 : 1 });
    await get().loadItems(listId);
  },

  removeItem: async (listId, id) => {
    await shoppingItemRepo.remove(id);
    await get().loadItems(listId);
  },
}));
