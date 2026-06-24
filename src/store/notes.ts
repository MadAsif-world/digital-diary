import { create } from "zustand";
import { noteRepo, notebookRepo } from "../db/repositories";
import type { Note, Notebook } from "../db/types";

interface NoteState {
  notebooks: Notebook[];
  notes: Note[]; // all notes; screens filter by the open notebook
  query: string;

  load: () => Promise<void>;
  setQuery: (q: string) => void;

  addNotebook: (name: string) => Promise<string | null>;
  renameNotebook: (id: string, name: string) => Promise<void>;
  removeNotebook: (id: string) => Promise<void>;

  add: (notebookId: string, input?: { title?: string; body?: string }) => Promise<Note>;
  update: (id: string, patch: Partial<Note>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notebooks: [],
  notes: [],
  query: "",

  load: async () => {
    const [notebooks, notes] = await Promise.all([
      notebookRepo.all("position ASC, createdAt ASC"),
      noteRepo.all("pinned DESC, updatedAt DESC"),
    ]);
    set({ notebooks, notes });
  },

  setQuery: (q) => set({ query: q }),

  addNotebook: async (name) => {
    const position = get().notebooks.length;
    const created = await notebookRepo.insert({ name, color: "gold", position });
    await get().load();
    return created?.id ?? get().notebooks.find((n) => n.name === name)?.id ?? null;
  },

  renameNotebook: async (id, name) => {
    await notebookRepo.update(id, { name });
    await get().load();
  },

  removeNotebook: async (id) => {
    for (const n of get().notes.filter((x) => x.notebookId === id)) {
      await noteRepo.remove(n.id);
    }
    await notebookRepo.remove(id);
    await get().load();
  },

  add: async (notebookId, { title = "", body = "" } = {}) => {
    const note = await noteRepo.insert({ notebookId, title, body, pinned: 0 });
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

export function notesIn(notes: Note[], notebookId: string): Note[] {
  return notes.filter((n) => n.notebookId === notebookId);
}
