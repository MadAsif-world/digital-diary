import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, EmptyState, FloatingAddButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useNoteStore, filterNotes } from "../src/store/notes";
import { useBreakpoint } from "../src/lib/responsive";
import { colors } from "../src/theme";
import type { Note } from "../src/db/types";

export default function NotesScreen() {
  const notes = useNoteStore((s) => s.notes);
  const query = useNoteStore((s) => s.query);
  const setQuery = useNoteStore((s) => s.setQuery);
  const load = useNoteStore((s) => s.load);
  const add = useNoteStore((s) => s.add);
  const update = useNoteStore((s) => s.update);
  const togglePin = useNoteStore((s) => s.togglePin);
  const remove = useNoteStore((s) => s.remove);

  const { gridColumns } = useBreakpoint();
  const [editing, setEditing] = useState<Note | null>(null);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => filterNotes(notes, query), [notes, query]);

  const columns: Note[][] = Array.from({ length: gridColumns }, () => []);
  visible.forEach((n, i) => columns[i % gridColumns].push(n));

  const createNote = async () => {
    const note = await add();
    setEditing(note);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Notes" subtitle="Capture every thought" contentPadBottom={120}>
        <View
          className="flex-row items-center"
          style={{ gap: 10, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16 }}
        >
          <Feather name="search" size={18} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search notes…"
            placeholderTextColor={colors.inkFaint}
            style={{ flex: 1, color: colors.ink, fontSize: 15 }}
          />
          {query ? <Pressable onPress={() => setQuery("")}><Feather name="x" size={18} color={colors.inkMuted} /></Pressable> : null}
        </View>

        {visible.length === 0 ? (
          <PlannerCard><EmptyState icon="file-text" title={query ? "No matches" : "No notes yet"} hint={query ? "Try a different search." : "Tap + to capture your first thought."} /></PlannerCard>
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

function NoteCard({ note, onOpen, onPin }: { note: Note; onOpen: () => void; onPin: () => void }) {
  return (
    <PlannerCard onPress={onOpen} accent={note.pinned ? "gold" : "none"}>
      <View className="flex-row items-start justify-between">
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600", flex: 1 }} numberOfLines={1}>
          {note.title || "Untitled"}
        </Text>
        <Pressable onPress={onPin} hitSlop={8}>
          <Feather name="bookmark" size={16} color={note.pinned ? colors.gold : colors.inkFaint} />
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

  return (
    <Modal visible={!!note} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28 }}>
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable onPress={close} hitSlop={8}><Feather name="chevron-down" size={26} color={colors.inkMuted} /></Pressable>
            <Pressable onPress={onDelete} hitSlop={8}><Feather name="trash-2" size={20} color={colors.love} /></Pressable>
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
