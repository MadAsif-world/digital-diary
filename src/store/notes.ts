import { create } from "zustand";
import { noteRepo } from "../db/repositories";
import type { Note } from "../db/types";

interface NoteState {
  notes: Note[];
  query: string;
  load: () => Promise<void>;
  setQuery: (q: string) => void;
  add: (input?: { title?: string; body?: string }) => Promise<Note>;
  update: (id: string, patch: Partial<Note>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  query: "",

  load: async () => {
    set({ notes: await noteRepo.all("pinned DESC, updatedAt DESC") });
  },

  setQuery: (q) => set({ query: q }),

  add: async ({ title = "", body = "" } = {}) => {
    const note = await noteRepo.insert({ title, body, pinned: 0 });
    await get().load();
    return note;
  },

  update: async (id, patch) => {
    await noteRepo.update(id, patch);
    await get().load();
  },

  togglePin: async (id) => {
    const n = get().notes.find((x) => x.id === id);
    if (!n) return;
    await noteRepo.update(id, { pinned: n.pinned ? 0 : 1 });
    await get().load();
  },

  remove: async (id) => {
    await noteRepo.remove(id);
    await get().load();
  },
}));

export function filterNotes(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
  );
}
