import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, EmptyState, EditableTextBlock, IconButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useHabitStore, habitStreak } from "../src/store/habits";
import { useAccentColor } from "../src/hooks/useAccent";
import { dayKey, addDays, parseDayKey, monthMatrix, formatMonthYear } from "../src/lib/date";
import { colors } from "../src/theme";
import type { Habit } from "../src/db/types";

const WD = ["S", "M", "T", "W", "T", "F", "S"];
type ViewMode = "week" | "month";

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
  const [view, setView] = useState<ViewMode>("week");
  const now = parseDayKey(dayKey());
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => { void load(); }, [load]);

  const weekDays = useMemo(() => {
    const t = dayKey();
    return Array.from({ length: 7 }, (_, i) => addDays(t, -(6 - i)));
  }, []);
  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);

  const stepMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  };

  const submit = async () => {
    if (!name.trim()) return;
    await addHabit(name.trim());
    setName("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Habits" subtitle="Build your streaks" contentPadBottom={24}>
        {/* View toggle + month nav */}
        <View className="flex-row items-center justify-between" style={{ marginBottom: 14 }}>
          <View className="flex-row" style={{ gap: 8 }}>
            {(["week", "month"] as ViewMode[]).map((v) => (
              <Pressable
                key={v}
                onPress={() => setView(v)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
                  backgroundColor: view === v ? accent : colors.card,
                  borderWidth: 1, borderColor: view === v ? accent : colors.border,
                }}
              >
                <LuxeLabel size={10} color={view === v ? colors.bg : colors.inkMuted}>{v}</LuxeLabel>
              </Pressable>
            ))}
          </View>
          {view === "month" && (
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <IconButton icon="chevron-left" size={32} onPress={() => stepMonth(-1)} />
              <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "600", minWidth: 96, textAlign: "center" }}>
                {formatMonthYear(year, month)}
              </Text>
              <IconButton icon="chevron-right" size={32} onPress={() => stepMonth(1)} />
            </View>
          )}
        </View>

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
                view={view}
                weekDays={weekDays}
                weeks={weeks}
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

function HabitCard({ habit, done, view, weekDays, weeks, onToggle, onRename, onDelete }: {
  habit: Habit; done: string[]; view: ViewMode;
  weekDays: string[]; weeks: (string | null)[][];
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

      {view === "week" ? (
        <View className="flex-row justify-between">
          {weekDays.map((d) => {
            const date = parseDayKey(d);
            return (
              <DayCell key={d} label={WD[date.getDay()]} num={date.getDate()} done={doneSet.has(d)} isToday={d === today} onPress={() => onToggle(d)} />
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 4 }}>
          <View className="flex-row">
            {WD.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center" }}>
                <LuxeLabel size={8} color={colors.inkFaint}>{d}</LuxeLabel>
              </View>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row" style={{ gap: 4 }}>
              {week.map((cell, ci) => {
                if (!cell) return <View key={ci} style={{ flex: 1, aspectRatio: 1 }} />;
                const isDone = doneSet.has(cell);
                const isToday = cell === today;
                const future = cell > today;
                return (
                  <Pressable
                    key={ci}
                    disabled={future}
                    onPress={() => onToggle(cell)}
                    style={{ flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center" }}
                  >
                    <View
                      className="items-center justify-center"
                      style={{
                        width: "86%", aspectRatio: 1, borderRadius: 7,
                        backgroundColor: isDone ? accent : "transparent",
                        borderWidth: isDone ? 0 : 1,
                        borderColor: isToday ? accent : colors.border,
                        opacity: future ? 0.35 : 1,
                      }}
                    >
                      <Text style={{ color: isDone ? colors.bg : colors.inkMuted, fontSize: 10 }}>
                        {parseDayKey(cell).getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </PlannerCard>
  );
}

function DayCell({ label, num, done, isToday, onPress }: {
  label: string; num: number; done: boolean; isToday: boolean; onPress: () => void;
}) {
  const accent = useAccentColor();
  return (
    <Pressable onPress={onPress} className="items-center" style={{ flex: 1 }}>
      <LuxeLabel size={8} color={colors.inkFaint} style={{ marginBottom: 6 }}>{label}</LuxeLabel>
      <View
        className="items-center justify-center"
        style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: done ? accent : "transparent",
          borderWidth: done ? 0 : 1,
          borderColor: isToday ? accent : colors.border,
        }}
      >
        {done ? <Feather name="check" size={16} color={colors.bg} /> : <Text style={{ color: isToday ? accent : colors.inkMuted, fontSize: 12 }}>{num}</Text>}
      </View>
    </Pressable>
  );
}
