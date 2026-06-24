import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, EmptyState, EditableTextBlock } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useHabitStore, habitStreak } from "../src/store/habits";
import { useAccentColor } from "../src/hooks/useAccent";
import { dayKey, addDays, parseDayKey } from "../src/lib/date";
import { colors } from "../src/theme";
import type { Habit } from "../src/db/types";

const WD = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitsScreen() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const load = useHabitStore((s) => s.load);
  const addHabit = useHabitStore((s) => s.addHabit);
  const renameHabit = useHabitStore((s) => s.renameHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const toggle = useHabitStore((s) => s.toggle);
  const accent = useAccentColor();
  const [name, setName] = useState("");

  useEffect(() => { void load(); }, [load]);

  // The last 7 days (oldest -> today).
  const days = useMemo(() => {
    const t = dayKey();
    return Array.from({ length: 7 }, (_, i) => addDays(t, -(6 - i)));
  }, []);

  const submit = async () => {
    if (!name.trim()) return;
    await addHabit(name.trim());
    setName("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Habits" subtitle="Build your streaks" contentPadBottom={24}>
        {habits.length === 0 ? (
          <PlannerCard>
            <EmptyState icon="repeat" title="No habits yet" hint="Add a habit below to start a streak." />
          </PlannerCard>
        ) : (
          <View style={{ gap: 12 }}>
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                done={logs[h.id] ?? []}
                days={days}
                onToggle={(d) => toggle(h.id, d)}
                onRename={(n) => renameHabit(h.id, n)}
                onDelete={() => removeHabit(h.id)}
              />
            ))}
          </View>
        )}
      </Screen>

      <View style={{ backgroundColor: colors.bgDeep, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
        <PlannerCard elevated style={{ marginBottom: 0 }}>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Feather name="plus-circle" size={22} color={accent} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Add a habit…"
              placeholderTextColor={colors.inkFaint}
              style={{ flex: 1, color: colors.ink, fontSize: 15 }}
              onSubmitEditing={submit}
              returnKeyType="done"
            />
          </View>
        </PlannerCard>
      </View>
    </View>
  );
}

function HabitCard({ habit, done, days, onToggle, onRename, onDelete }: {
  habit: Habit; done: string[]; days: string[];
  onToggle: (day: string) => void; onRename: (name: string) => void; onDelete: () => void;
}) {
  const accent = useAccentColor();
  const doneSet = useMemo(() => new Set(done), [done]);
  const streak = habitStreak(done);
  const today = dayKey();

  return (
    <PlannerCard>
      <View className="flex-row items-center" style={{ gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <EditableTextBlock value={habit.name} onSave={onRename} placeholder="Habit name" />
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text style={{ color: streak > 0 ? accent : colors.inkMuted, fontWeight: "700", fontSize: 15 }}>{streak}</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={8}><Feather name="trash-2" size={17} color={colors.inkFaint} /></Pressable>
      </View>

      <View className="flex-row justify-between">
        {days.map((d) => {
          const isDone = doneSet.has(d);
          const isToday = d === today;
          const date = parseDayKey(d);
          return (
            <Pressable key={d} onPress={() => onToggle(d)} className="items-center" style={{ flex: 1 }}>
              <LuxeLabel size={8} color={colors.inkFaint} style={{ marginBottom: 6 }}>{WD[date.getDay()]}</LuxeLabel>
              <View
                className="items-center justify-center"
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: isDone ? accent : "transparent",
                  borderWidth: isDone ? 0 : 1,
                  borderColor: isToday ? accent : colors.border,
                }}
              >
                {isDone
                  ? <Feather name="check" size={16} color={colors.bg} />
                  : <Text style={{ color: isToday ? accent : colors.inkMuted, fontSize: 12 }}>{date.getDate()}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </PlannerCard>
  );
}
