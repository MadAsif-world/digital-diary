import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, CheckboxRow, EmptyState } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { DateField } from "../src/components/DateField";
import { useTaskStore } from "../src/store/tasks";
import { dayKey } from "../src/lib/date";
import { useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";
import type { Task, PriorityLevel } from "../src/db/types";

type Filter = "today" | "all" | "done";
const LEVELS: PriorityLevel[] = ["low", "medium", "high"];
const LEVEL_COLOR: Record<PriorityLevel, string> = {
  low: colors.inkMuted, medium: colors.gold, high: colors.love,
};

export default function TodoScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const load = useTaskStore((s) => s.load);
  const add = useTaskStore((s) => s.add);
  const update = useTaskStore((s) => s.update);
  const toggle = useTaskStore((s) => s.toggle);
  const remove = useTaskStore((s) => s.remove);

  const [filter, setFilter] = useState<Filter>("today");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<PriorityLevel>("medium");
  const accent = useAccentColor();

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const today = dayKey();
    if (filter === "done") return tasks.filter((t) => t.done);
    const live = tasks.filter((t) => !t.done);
    if (filter === "today") return live.filter((t) => t.dueDate && t.dueDate <= today);
    return live;
  }, [tasks, filter]);

  const submit = async () => {
    if (!title.trim()) return;
    await add({ title: title.trim(), level, dueDate: filter === "today" ? dayKey() : null });
    setTitle("");
    setLevel("medium");
  };

  return (
    <Screen title="To-Do" subtitle="Capture, sort, and clear your tasks" contentPadBottom={60}>
      {/* Add bar */}
      <PlannerCard elevated style={{ marginBottom: 16 }}>
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <Pressable
            onPress={() => setLevel(LEVELS[(LEVELS.indexOf(level) + 1) % LEVELS.length])}
            style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: LEVEL_COLOR[level] }}
          />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add a task…"
            placeholderTextColor={colors.inkFaint}
            style={{ flex: 1, color: colors.ink, fontSize: 15 }}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <Pressable onPress={submit} hitSlop={8}>
            <Feather name="plus-circle" size={26} color={accent} />
          </Pressable>
        </View>
      </PlannerCard>

      {/* Filter tabs */}
      <View className="flex-row" style={{ gap: 8, marginBottom: 14 }}>
        {(["today", "all", "done"] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
              backgroundColor: filter === f ? accent : colors.card,
              borderWidth: 1, borderColor: filter === f ? accent : colors.border,
            }}
          >
            <LuxeLabel size={10} color={filter === f ? colors.bg : colors.inkMuted}>
              {f === "done" ? "Completed" : f}
            </LuxeLabel>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <PlannerCard>
          <EmptyState
            icon={filter === "done" ? "archive" : "check-circle"}
            title={filter === "done" ? "No completed tasks" : "Nothing here yet"}
            hint={filter === "today" ? "Tasks due today will appear here." : "Add a task to get started."}
          />
        </PlannerCard>
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={() => toggle(t.id)} onUpdate={(p) => update(t.id, p)} onDelete={() => remove(t.id)} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function TaskItem({ task, onToggle, onUpdate, onDelete }: {
  task: Task; onToggle: () => void; onUpdate: (p: Partial<Task>) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <PlannerCard>
      <CheckboxRow
        checked={!!task.done}
        label={task.title}
        sublabel={task.category !== "General" ? task.category : undefined}
        onToggle={onToggle}
        onPressLabel={() => setExpanded((e) => !e)}
        right={
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: LEVEL_COLOR[task.level] }} />
            <Pressable onPress={onDelete} hitSlop={8}><Feather name="trash-2" size={17} color={colors.inkFaint} /></Pressable>
          </View>
        }
      />
      {expanded && (
        <View style={{ marginTop: 10, gap: 10 }}>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <LuxeLabel size={9} color={colors.inkMuted} style={{ width: 70 }}>Category</LuxeLabel>
            <TextInput
              defaultValue={task.category}
              onEndEditing={(e) => onUpdate({ category: e.nativeEvent.text || "General" })}
              placeholder="General"
              placeholderTextColor={colors.inkFaint}
              style={{ flex: 1, color: colors.ink, fontSize: 14, backgroundColor: colors.bgDeep, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}
            />
          </View>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <LuxeLabel size={9} color={colors.inkMuted} style={{ width: 70 }}>Due</LuxeLabel>
            <DateField value={task.dueDate} onChange={(d) => onUpdate({ dueDate: d })} compact />
          </View>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <LuxeLabel size={9} color={colors.inkMuted} style={{ width: 70 }}>Priority</LuxeLabel>
            <View className="flex-row" style={{ gap: 8 }}>
              {LEVELS.map((lv) => (
                <Pressable
                  key={lv}
                  onPress={() => onUpdate({ level: lv })}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                    borderWidth: 1, borderColor: task.level === lv ? LEVEL_COLOR[lv] : colors.border,
                    backgroundColor: task.level === lv ? LEVEL_COLOR[lv] : "transparent",
                  }}
                >
                  <Text style={{ color: task.level === lv ? colors.bg : colors.inkMuted, fontSize: 11, textTransform: "capitalize" }}>{lv}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </PlannerCard>
  );
}
