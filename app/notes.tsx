import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Modal, ScrollView, Share } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, EmptyState, FloatingAddButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useNoteStore, filterNotes, notesIn } from "../src/store/notes";
import { useBreakpoint } from "../src/lib/responsive";
import { useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";
import type { Note, Notebook } from "../src/db/types";

const coverColor = (nb: Notebook) =>
  nb.color === "love" ? colors.love : nb.color === "gold" ? colors.gold : nb.color || colors.gold;

export default function NotesScreen() {
  const notebooks = useNoteStore((s) => s.notebooks);
  const notes = useNoteStore((s) => s.notes);
  const query = useNoteStore((s) => s.query);
  const setQuery = useNoteStore((s) => s.setQuery);
  const load = useNoteStore((s) => s.load);
  const addNotebook = useNoteStore((s) => s.addNotebook);
  const renameNotebook = useNoteStore((s) => s.renameNotebook);
  const removeNotebook = useNoteStore((s) => s.removeNotebook);
  const add = useNoteStore((s) => s.add);
  const update = useNoteStore((s) => s.update);
  const togglePin = useNoteStore((s) => s.togglePin);
  const remove = useNoteStore((s) => s.remove);

  const { gridColumns } = useBreakpoint();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);

  useEffect(() => { void load(); }, [load]);

  const openBook = useMemo(() => notebooks.find((n) => n.id === openId) ?? null, [notebooks, openId]);

  // ---- Bookshelf view ------------------------------------------------------
  if (!openBook) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Bookshelf
          notebooks={notebooks}
          countFor={(id) => notesIn(notes, id).length}
          onOpen={setOpenId}
          onCreate={async (name) => { const id = await addNotebook(name); if (id) setOpenId(id); }}
        />
      </View>
    );
  }

  // ---- Inside a book -------------------------------------------------------
  const bookNotes = filterNotes(notesIn(notes, openBook.id), query);

  const columns: Note[][] = Array.from({ length: gridColumns }, () => []);
  bookNotes.forEach((n, i) => columns[i % gridColumns].push(n));

  const createNote = async () => {
    const note = await add(openBook.id);
    setEditing(note);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen
        title={openBook.name || "Untitled book"}
        subtitle={`${notesIn(notes, openBook.id).length} page${notesIn(notes, openBook.id).length === 1 ? "" : "s"}`}
        right={
          <Pressable onPress={() => { setQuery(""); setOpenId(null); }} hitSlop={8} className="flex-row items-center" style={{ gap: 4 }}>
            <Feather name="chevron-left" size={18} color={colors.inkMuted} />
            <LuxeLabel size={9} color={colors.inkMuted}>Shelf</LuxeLabel>
          </Pressable>
        }
        contentPadBottom={120}
      >
        <View
          className="flex-row items-center"
          style={{ gap: 10, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16 }}
        >
          <Feather name="search" size={18} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search this book…"
            placeholderTextColor={colors.inkFaint}
            style={{ flex: 1, color: colors.ink, fontSize: 15 }}
          />
          {query ? <Pressable onPress={() => setQuery("")}><Feather name="x" size={18} color={colors.inkMuted} /></Pressable> : null}
        </View>

        {bookNotes.length === 0 ? (
          <PlannerCard><EmptyState icon="book-open" title={query ? "No matches" : "Empty book"} hint={query ? "Try a different search." : "Tap + to write your first page."} /></PlannerCard>
        ) : (
          <View style={{ flexDirection: "row", gap: 12 }}>
            {columns.map((col, i) => (
              <View key={i} style={{ flex: 1, gap: 12 }}>
                {col.map((n) => (
                  <NoteCard key={n.id} note={n} onOpen={() => setEditing(n)} onPin={() => togglePin(n.id)} />
                ))}
              </View>
            ))}
          </View>
        )}
      </Screen>
      <FloatingAddButton onPress={createNote} />

      <NoteEditor
        note={editing}
        onClose={() => setEditing(null)}
        onSave={(p) => editing && update(editing.id, p)}
        onDelete={() => { if (editing) { remove(editing.id); setEditing(null); } }}
      />
    </View>
  );
}

function Bookshelf({ notebooks, countFor, onOpen, onCreate }: {
  notebooks: Notebook[]; countFor: (id: string) => number;
  onOpen: (id: string) => void; onCreate: (name: string) => void;
}) {
  const accent = useAccentColor();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    if (name.trim()) onCreate(name.trim());
    setName(""); setAdding(false);
  };

  return (
    <Screen title="Books" subtitle="Your notebooks & pages" contentPadBottom={24}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        {notebooks.map((nb) => {
          const count = countFor(nb.id);
          return (
            <Pressable key={nb.id} onPress={() => onOpen(nb.id)} style={{ width: "47%" }}>
              <View style={{ aspectRatio: 0.74, borderRadius: 14, overflow: "hidden", flexDirection: "row", backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ width: 6, backgroundColor: coverColor(nb) }} />
                <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
                  <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700", letterSpacing: 0.2 }} numberOfLines={3}>
                    {nb.name || "Untitled"}
                  </Text>
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Feather name="book" size={12} color={coverColor(nb)} />
                    <LuxeLabel size={9} color={colors.inkMuted}>{count} {count === 1 ? "page" : "pages"}</LuxeLabel>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* New book */}
        <View style={{ width: "47%" }}>
          {adding ? (
            <View style={{ aspectRatio: 0.74, borderRadius: 14, borderWidth: 1, borderColor: accent, backgroundColor: colors.card, padding: 14, justifyContent: "center" }}>
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Book name"
                placeholderTextColor={colors.inkFaint}
                onSubmitEditing={submit}
                onBlur={submit}
                style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }}
              />
            </View>
          ) : (
            <Pressable onPress={() => setAdding(true)} style={{ aspectRatio: 0.74, borderRadius: 14, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Feather name="plus" size={24} color={accent} />
              <LuxeLabel size={9} color={colors.inkMuted}>New book</LuxeLabel>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

function NoteCard({ note, onOpen, onPin }: { note: Note; onOpen: () => void; onPin: () => void }) {
  const accentC = useAccentColor();
  return (
    <PlannerCard onPress={onOpen} accent={note.pinned ? "gold" : "none"}>
      <View className="flex-row items-start justify-between">
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600", flex: 1 }} numberOfLines={1}>
          {note.title || "Untitled"}
        </Text>
        <Pressable onPress={onPin} hitSlop={8}>
          <Feather name="bookmark" size={16} color={note.pinned ? accentC : colors.inkFaint} />
        </Pressable>
      </View>
      {note.body ? (
        <Text style={{ color: colors.inkMuted, fontSize: 13, marginTop: 6, lineHeight: 19 }} numberOfLines={5}>
          {note.body}
        </Text>
      ) : null}
    </PlannerCard>
  );
}

function NoteEditor({ note, onClose, onSave, onDelete }: {
  note: Note | null; onClose: () => void; onSave: (p: Partial<Note>) => void; onDelete: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
  }, [note]);

  const close = () => {
    if (note && (title !== note.title || body !== note.body)) onSave({ title, body });
    onClose();
  };

  // Export the page to any app (Keep, Apple Notes, Mail…) via the OS share sheet.
  const shareNote = async () => {
    const text = [title.trim(), body.trim()].filter(Boolean).join("\n\n");
    if (!text) return;
    try {
      await Share.share({ title: title.trim() || "Note", message: text });
    } catch {
      /* user dismissed, or unsupported (e.g. some web browsers) */
    }
  };

  const stamp = note ? new Date(note.updatedAt) : null;
  const dateStr = stamp ? stamp.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
  const weekday = stamp ? stamp.toLocaleDateString(undefined, { weekday: "long" }) : "";

  return (
    <Modal visible={!!note} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28 }}>
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable onPress={close} hitSlop={8}><Feather name="chevron-down" size={26} color={colors.inkMuted} /></Pressable>
            <View className="flex-row items-center" style={{ gap: 20 }}>
              <Pressable onPress={shareNote} hitSlop={8}><Feather name="share" size={19} color={colors.inkMuted} /></Pressable>
              <Pressable onPress={onDelete} hitSlop={8}><Feather name="trash-2" size={20} color={colors.love} /></Pressable>
            </View>
          </View>

          {/* Page date header, like a diary page */}
          <View className="flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 14 }}>
            <LuxeLabel size={10} color={colors.inkMuted}>{dateStr}</LuxeLabel>
            <LuxeLabel size={10} color={colors.gold}>{weekday}</LuxeLabel>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={colors.inkFaint}
              style={{ color: colors.ink, fontSize: 22, fontWeight: "700", marginBottom: 12 }}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Start writing…"
              placeholderTextColor={colors.inkFaint}
              multiline
              textAlignVertical="top"
              style={{ color: colors.ink, fontSize: 16, lineHeight: 24, minHeight: 240 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
