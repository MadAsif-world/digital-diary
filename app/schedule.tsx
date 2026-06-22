import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, SectionHeader, EmptyState, IconButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useEventStore } from "../src/store/events";
import { useAppStore } from "../src/store/app";
import { monthMatrix, parseDayKey, dayKey as todayKey, formatLongDate, formatMonthYear } from "../src/lib/date";
import { colors } from "../src/theme";
import type { EventKind } from "../src/db/types";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const KINDS: { k: EventKind; label: string; color: string }[] = [
  { k: "event", label: "Event", color: colors.gold },
  { k: "task", label: "Task", color: colors.success },
  { k: "reminder", label: "Reminder", color: colors.loveSoft },
];

export default function ScheduleScreen() {
  const byDay = useEventStore((s) => s.byDay);
  const loadMonth = useEventStore((s) => s.loadMonth);
  const add = useEventStore((s) => s.add);
  const remove = useEventStore((s) => s.remove);
  const setDay = useAppStore((s) => s.setDay);

  const today = parseDayKey(todayKey());
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(todayKey());

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<EventKind>("event");

  useEffect(() => { void loadMonth(year, month); }, [year, month, loadMonth]);

  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);
  const selectedEvents = byDay[selected] ?? [];

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
              const has = (byDay[cell]?.length ?? 0) > 0;
              return (
                <Pressable key={ci} onPress={() => setSelected(cell)} style={{ flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center" }}>
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: isSel ? colors.gold : "transparent",
                      borderWidth: isToday && !isSel ? 1 : 0, borderColor: colors.gold,
                    }}
                  >
                    <Text style={{ color: isSel ? colors.bg : colors.ink, fontSize: 14, fontWeight: isSel ? "700" : "400" }}>
                      {d.getDate()}
                    </Text>
                  </View>
                  {has ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isSel ? colors.gold : colors.gold, marginTop: 2 }} /> : <View style={{ height: 7 }} />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </PlannerCard>

      <PlannerCard>
        <SectionHeader
          title={formatLongDate(selected)}
          right={
            <Pressable onPress={() => setDay(selected)} hitSlop={8} className="flex-row items-center" style={{ gap: 4 }}>
              <LuxeLabel size={9} color={colors.gold}>Open day</LuxeLabel>
              <Feather name="arrow-up-right" size={14} color={colors.gold} />
            </Pressable>
          }
        />

        {/* Add bar */}
        <View className="flex-row items-center" style={{ gap: 10, marginBottom: 8 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add to this day…"
            placeholderTextColor={colors.inkFaint}
            style={{ flex: 1, color: colors.ink, fontSize: 15, backgroundColor: colors.bgDeep, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10 }}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <Pressable onPress={submit} hitSlop={8}><Feather name="plus-circle" size={26} color={colors.gold} /></Pressable>
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

        {selectedEvents.length === 0 ? (
          <EmptyState icon="calendar" title="Nothing planned" hint="Add an event, task, or reminder above." />
        ) : (
          selectedEvents.map((ev) => {
            const dot = KINDS.find((k) => k.k === ev.kind)?.color ?? colors.gold;
            return (
              <View key={ev.id} className="flex-row items-center py-2.5" style={{ gap: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
                <Text style={{ color: colors.ink, fontSize: 14, flex: 1 }}>{ev.title}</Text>
                {ev.time ? <Text style={{ color: colors.inkMuted, fontSize: 12 }}>{ev.time}</Text> : null}
                <Pressable onPress={() => remove(ev.id, selected)} hitSlop={6}><Feather name="trash-2" size={16} color={colors.inkFaint} /></Pressable>
              </View>
            );
          })
        )}
      </PlannerCard>
    </Screen>
  );
}
