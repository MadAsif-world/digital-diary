import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { Screen, PlannerCard, EmptyState, FloatingAddButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { ReminderTimePicker } from "../src/components/ReminderTimePicker";
import { useReminderStore } from "../src/store/reminders";
import { formatTime } from "../src/lib/date";
import { colors } from "../src/theme";
import type { Reminder, RepeatRule } from "../src/db/types";

const REPEATS: RepeatRule[] = ["none", "daily", "weekly", "monthly"];

interface FormValues { title: string; note: string; at: Date; repeat: RepeatRule }

export default function RemindersScreen() {
  const reminders = useReminderStore((s) => s.reminders);
  const load = useReminderStore((s) => s.load);
  const add = useReminderStore((s) => s.add);
  const toggleDone = useReminderStore((s) => s.toggleDone);
  const snooze = useReminderStore((s) => s.snooze);
  const remove = useReminderStore((s) => s.remove);

  const [composing, setComposing] = useState(false);

  useEffect(() => { void load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Reminders" subtitle="Never miss a beat" contentPadBottom={120}>
        {composing && (
          <ComposeReminder
            onCancel={() => setComposing(false)}
            onSubmit={async (v) => { await add(v); setComposing(false); }}
          />
        )}

        {reminders.length === 0 && !composing ? (
          <PlannerCard>
            <EmptyState icon="bell" title="No reminders yet" hint="Tap + to schedule your first reminder." />
          </PlannerCard>
        ) : (
          <View style={{ gap: 10 }}>
            {reminders.map((r) => (
              <ReminderItem
                key={r.id}
                item={r}
                onToggle={() => toggleDone(r.id)}
                onSnooze={() => snooze(r.id, 10)}
                onDelete={() => remove(r.id)}
              />
            ))}
          </View>
        )}
      </Screen>
      {!composing && <FloatingAddButton onPress={() => setComposing(true)} />}
    </View>
  );
}

function ComposeReminder({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (v: FormValues) => void }) {
  const initial = new Date(Date.now() + 60 * 60 * 1000);
  initial.setSeconds(0, 0);
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { title: "", note: "", at: initial, repeat: "none" },
  });

  return (
    <PlannerCard elevated accent="gold" style={{ marginBottom: 16 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <LuxeLabel size={12} color={colors.gold}>New Reminder</LuxeLabel>
        <Pressable onPress={onCancel} hitSlop={8}><Feather name="x" size={20} color={colors.inkMuted} /></Pressable>
      </View>

      <Controller
        control={control}
        name="title"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="What should we remind you about?"
            placeholderTextColor={colors.inkFaint}
            style={{
              color: colors.ink, fontSize: 15, backgroundColor: colors.bgDeep,
              borderRadius: 14, borderWidth: 1, borderColor: errors.title ? colors.love : colors.border,
              paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
            }}
          />
        )}
      />

      <View style={{ marginBottom: 12 }}>
        <Controller control={control} name="at" render={({ field: { value, onChange } }) => (
          <ReminderTimePicker label="When" value={value} onChange={onChange} />
        )} />
      </View>

      <LuxeLabel size={11} color={colors.inkMuted} style={{ marginBottom: 8 }}>Repeat</LuxeLabel>
      <Controller control={control} name="repeat" render={({ field: { value, onChange } }) => (
        <View className="flex-row" style={{ gap: 8, marginBottom: 16 }}>
          {REPEATS.map((rp) => (
            <Pressable
              key={rp}
              onPress={() => onChange(rp)}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                backgroundColor: value === rp ? colors.gold : "transparent",
                borderWidth: 1, borderColor: value === rp ? colors.gold : colors.border,
              }}
            >
              <Text style={{ color: value === rp ? colors.bg : colors.inkMuted, fontSize: 11, textTransform: "capitalize" }}>{rp}</Text>
            </Pressable>
          ))}
        </View>
      )} />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={{ backgroundColor: colors.gold, borderRadius: 14, paddingVertical: 14, alignItems: "center" }}
      >
        <LuxeLabel size={12} color={colors.bg}>Schedule Reminder</LuxeLabel>
      </Pressable>
    </PlannerCard>
  );
}

function ReminderItem({ item, onToggle, onSnooze, onDelete }: {
  item: Reminder; onToggle: () => void; onSnooze: () => void; onDelete: () => void;
}) {
  const at = new Date(item.remindAt);
  return (
    <PlannerCard>
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <Pressable onPress={onToggle} hitSlop={8}>
          <View
            className="items-center justify-center"
            style={{
              width: 26, height: 26, borderRadius: 13,
              borderWidth: 1.5, borderColor: item.done ? colors.gold : colors.border,
              backgroundColor: item.done ? colors.gold : "transparent",
            }}
          >
            {item.done ? <Feather name="check" size={15} color={colors.bg} /> : null}
          </View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: item.done ? colors.inkFaint : colors.ink, fontSize: 15, textDecorationLine: item.done ? "line-through" : "none" }}>
            {item.title}
          </Text>
          <View className="flex-row items-center" style={{ gap: 8, marginTop: 3 }}>
            <Feather name="clock" size={12} color={colors.inkMuted} />
            <Text style={{ color: colors.inkMuted, fontSize: 12 }}>
              {at.toLocaleDateString()} · {formatTime(at)}
            </Text>
            {item.repeat !== "none" && (
              <View style={{ backgroundColor: colors.elevated, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: colors.gold, fontSize: 9, textTransform: "uppercase" }}>{item.repeat}</Text>
              </View>
            )}
          </View>
        </View>
        {!item.done && (
          <Pressable onPress={onSnooze} hitSlop={6} style={{ marginRight: 6 }}>
            <Feather name="rotate-ccw" size={17} color={colors.inkMuted} />
          </Pressable>
        )}
        <Pressable onPress={onDelete} hitSlop={6}>
          <Feather name="trash-2" size={17} color={colors.inkFaint} />
        </Pressable>
      </View>
    </PlannerCard>
  );
}
