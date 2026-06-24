import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Screen, PlannerCard, SectionHeader, EmptyState, IconButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useEventStore } from "../src/store/events";
import { useAppStore } from "../src/store/app";
import { useTaskStore } from "../src/store/tasks";
import { useReminderStore } from "../src/store/reminders";
import { useAccentColor } from "../src/hooks/useAccent";
import { monthMatrix, parseDayKey, dayKey, dayKey as todayKey, formatLongDate, formatMonthYear, formatTime } from "../src/lib/date";
import { colors } from "../src/theme";
import type { EventKind, Task, Reminder } from "../src/db/types";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const KINDS: { k: EventKind; label: string; color: string }[] = [
  { k: "event", label: "Event", color: colors.gold },
  { k: "task", label: "Task", color: colors.success },
  { k: "reminder", label: "Reminder", color: colors.loveSoft },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const byDay = useEventStore((s) => s.byDay);
  const loadMonth = useEventStore((s) => s.loadMonth);
  const add = useEventStore((s) => s.add);
  const remove = useEventStore((s) => s.remove);

  // The calendar drives the app-wide selected day, so picking a date here also
  // moves Priorities / Health / Meals / Dashboard to that day.
  const selected = useAppStore((s) => s.selectedDayKey);
  const setDay = useAppStore((s) => s.setDay);

  const tasks = useTaskStore((s) => s.tasks);
  const loadTasks = useTaskStore((s) => s.load);
  const toggleTask = useTaskStore((s) => s.toggle);
  const reminders = useReminderStore((s) => s.reminders);
  const loadReminders = useReminderStore((s) => s.load);

  const accent = useAccentColor();

  const sel = parseDayKey(selected);
  const [year, setYear] = useState(sel.getFullYear());
  const [month, setMonth] = useState(sel.getMonth());

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<EventKind>("event");

  useEffect(() => { void loadMonth(year, month); }, [year, month, loadMonth]);
  useEffect(() => { void loadTasks(); void loadReminders(); }, [loadTasks, loadReminders]);

  // Follow the selected day's month when it changes elsewhere (e.g. dashboard).
  useEffect(() => {
    const d = parseDayKey(selected);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }, [selected]);

  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);

  const taskByDay = useMemo(() => {
    const m: Record<string, Task[]> = {};
    for (const t of tasks) if (!t.done && t.dueDate) (m[t.dueDate] ??= []).push(t);
    return m;
  }, [tasks]);

  const reminderByDay = useMemo(() => {
    const m: Record<string, Reminder[]> = {};
    for (const r of reminders) {
      if (r.done) continue;
      const k = dayKey(new Date(r.remindAt));
      (m[k] ??= []).push(r);
    }
    return m;
  }, [reminders]);

  const hasItems = (k: string) =>
    (byDay[k]?.length ?? 0) > 0 || (taskByDay[k]?.length ?? 0) > 0 || (reminderByDay[k]?.length ?? 0) > 0;

  const selectedEvents = byDay[selected] ?? [];
  const selectedTasks = taskByDay[selected] ?? [];
  const selectedReminders = reminderByDay[selected] ?? [];
  const empty = !selectedEvents.length && !selectedTasks.length && !selectedReminders.length;

  const stepMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  };

  const submit = async () => {
    if (!title.trim()) return;
    await add({ dayKey: selected, title: title.trim(), kind });
    setTitle("");
  };

  return (
    <Screen title="Monthly Schedule" subtitle="The month, mapped">
      <PlannerCard style={{ marginBottom: 16 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <IconButton icon="chevron-left" size={36} onPress={() => stepMonth(-1)} />
          <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700" }}>{formatMonthYear(year, month)}</Text>
          <IconButton icon="chevron-right" size={36} onPress={() => stepMonth(1)} />
        </View>

        <View className="flex-row" style={{ marginBottom: 8 }}>
          {DOW.map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              <LuxeLabel size={9} color={colors.inkFaint}>{d}</LuxeLabel>
            </View>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row">
            {week.map((cell, ci) => {
              if (!cell) return <View key={ci} style={{ flex: 1, aspectRatio: 1 }} />;
              const d = parseDayKey(cell);
              const isSel = cell === selected;
              const isToday = cell === todayKey();
              const has = hasItems(cell);
              return (
                <Pressable key={ci} onPress={() => void setDay(cell)} style={{ flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center" }}>
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: isSel ? accent : "transparent",
                      borderWidth: isToday && !isSel ? 1 : 0, borderColor: accent,
                    }}
                  >
                    <Text style={{ color: isSel ? colors.bg : colors.ink, fontSize: 14, fontWeight: isSel ? "700" : "400" }}>
                      {d.getDate()}
                    </Text>
                  </View>
                  {has ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isSel ? accent : colors.inkMuted, marginTop: 2 }} /> : <View style={{ height: 7 }} />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </PlannerCard>

      <PlannerCard>
        <SectionHeader title={formatLongDate(selected)} />

        {/* Add an event to this day */}
        <View className="flex-row items-center" style={{ gap: 10, marginBottom: 8 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add an event to this day…"
            placeholderTextColor={colors.inkFaint}
            style={{ flex: 1, color: colors.ink, fontSize: 15, backgroundColor: colors.bgDeep, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10 }}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <Pressable onPress={submit} hitSlop={8}><Feather name="plus-circle" size={26} color={accent} /></Pressable>
        </View>
        <View className="flex-row" style={{ gap: 8, marginBottom: 14 }}>
          {KINDS.map((kd) => (
            <Pressable
              key={kd.k}
              onPress={() => setKind(kd.k)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                borderWidth: 1, borderColor: kind === kd.k ? kd.color : colors.border,
                backgroundColor: kind === kd.k ? colors.elevated : "transparent",
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: kd.color }} />
              <Text style={{ color: kind === kd.k ? colors.ink : colors.inkMuted, fontSize: 11 }}>{kd.label}</Text>
            </Pressable>
          ))}
        </View>

        {empty ? (
          <EmptyState icon="calendar" title="Nothing on this day" hint="Add an event above, or a task/reminder from their tabs." />
        ) : (
          <View>
            {/* Tasks due this day (from To-Do) */}
            {selectedTasks.map((t) => (
              <View key={t.id} className="flex-row items-center py-2.5" style={{ gap: 10 }}>
                <Pressable onPress={() => void toggleTask(t.id)} hitSlop={8}>
                  <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: colors.success }} />
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => router.push("/todo")}>
                  <Text style={{ color: colors.ink, fontSize: 14 }}>{t.title}</Text>
                </Pressable>
                <Feather name="check-square" size={14} color={colors.success} />
              </View>
            ))}

            {/* Reminders this day */}
            {selectedReminders.map((r) => (
              <Pressable key={r.id} className="flex-row items-center py-2.5" style={{ gap: 10 }} onPress={() => router.push("/reminders")}>
                <Feather name="bell" size={15} color={colors.loveSoft} />
                <Text style={{ color: colors.ink, fontSize: 14, flex: 1 }}>{r.title}</Text>
                <Text style={{ color: colors.inkMuted, fontSize: 12 }}>{formatTime(new Date(r.remindAt))}</Text>
              </Pressable>
            ))}

            {/* Calendar events on this day */}
            {selectedEvents.map((ev) => {
              const dot = KINDS.find((k) => k.k === ev.kind)?.color ?? colors.gold;
              return (
                <View key={ev.id} className="flex-row items-center py-2.5" style={{ gap: 10 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
                  <Text style={{ color: colors.ink, fontSize: 14, flex: 1 }}>{ev.title}</Text>
                  {ev.time ? <Text style={{ color: colors.inkMuted, fontSize: 12 }}>{ev.time}</Text> : null}
                  <Pressable onPress={() => remove(ev.id, selected)} hitSlop={6}><Feather name="trash-2" size={16} color={colors.inkFaint} /></Pressable>
                </View>
              );
            })}
          </View>
        )}
      </PlannerCard>
    </Screen>
  );
}
