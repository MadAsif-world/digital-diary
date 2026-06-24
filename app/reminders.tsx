import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { Screen, PlannerCard, EmptyState, FloatingAddButton, EditableTextBlock } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { ReminderTimePicker } from "../src/components/ReminderTimePicker";
import { useReminderStore } from "../src/store/reminders";
import {
  getPermissionStatus, sendTestNotification, ensureNotificationPermissions, type PermissionState,
} from "../src/notifications";
import { formatTime } from "../src/lib/date";
import { useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";
import type { Reminder, RepeatRule } from "../src/db/types";

const REPEATS: RepeatRule[] = ["none", "daily", "weekly", "monthly"];

interface FormValues { title: string; note: string; at: Date; repeat: RepeatRule }
type EditInput = { title?: string; note?: string; at?: Date; repeat?: RepeatRule };

export default function RemindersScreen() {
  const reminders = useReminderStore((s) => s.reminders);
  const load = useReminderStore((s) => s.load);
  const add = useReminderStore((s) => s.add);
  const edit = useReminderStore((s) => s.edit);
  const toggleDone = useReminderStore((s) => s.toggleDone);
  const snooze = useReminderStore((s) => s.snooze);
  const remove = useReminderStore((s) => s.remove);

  const [composing, setComposing] = useState(false);
  const [perm, setPerm] = useState<PermissionState>("granted");

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void getPermissionStatus().then(setPerm); }, []);

  const enableNotifications = async () => {
    await ensureNotificationPermissions();
    setPerm(await getPermissionStatus());
  };

  const test = async () => {
    const ok = await sendTestNotification();
    setPerm(await getPermissionStatus());
    Alert.alert(
      ok ? "Test sent" : "Couldn't send",
      ok
        ? "A test notification will arrive in about 5 seconds."
        : "Enable notifications first. (Notifications only fire in the installed app, not the web preview.)",
    );
  };

  const showBanner = perm === "denied" || perm === "undetermined";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Reminders" subtitle="Never miss a beat" contentPadBottom={120}>
        {showBanner && (
          <PlannerCard accent="gold" style={{ marginBottom: 14 }}>
            <View className="flex-row items-center" style={{ gap: 10, marginBottom: 12 }}>
              <Feather name="bell-off" size={18} color={colors.gold} />
              <Text style={{ color: colors.ink, fontSize: 14, flex: 1 }}>
                Turn on notifications so your reminders can actually alert you.
              </Text>
            </View>
            <Pressable onPress={enableNotifications} style={{ backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 12, alignItems: "center" }}>
              <LuxeLabel size={11} color={colors.bg}>Enable notifications</LuxeLabel>
            </Pressable>
          </PlannerCard>
        )}

        {composing && (
          <ComposeReminder
            onCancel={() => setComposing(false)}
            onSubmit={async (v) => { await add(v); setComposing(false); setPerm(await getPermissionStatus()); }}
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
                onEdit={(input) => edit(r.id, input)}
              />
            ))}
          </View>
        )}

        {perm !== "unsupported" && (
          <Pressable onPress={test} style={{ alignSelf: "center", marginTop: 18 }} hitSlop={8}>
            <Text style={{ color: colors.inkMuted, fontSize: 12, textDecorationLine: "underline" }}>
              Send a test notification
            </Text>
          </Pressable>
        )}
      </Screen>
      {!composing && <FloatingAddButton onPress={() => setComposing(true)} />}
    </View>
  );
}

function RepeatChips({ value, onChange }: { value: RepeatRule; onChange: (r: RepeatRule) => void }) {
  const accent = useAccentColor();
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {REPEATS.map((rp) => (
        <Pressable
          key={rp}
          onPress={() => onChange(rp)}
          style={{
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
            backgroundColor: value === rp ? accent : "transparent",
            borderWidth: 1, borderColor: value === rp ? accent : colors.border,
          }}
        >
          <Text style={{ color: value === rp ? colors.bg : colors.inkMuted, fontSize: 11, textTransform: "capitalize" }}>{rp}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ComposeReminder({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (v: FormValues) => void }) {
  const accent = useAccentColor();
  const initial = new Date(Date.now() + 60 * 60 * 1000);
  initial.setSeconds(0, 0);
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { title: "", note: "", at: initial, repeat: "none" },
  });

  return (
    <PlannerCard elevated accent="gold" style={{ marginBottom: 16 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <LuxeLabel size={12} color={accent}>New Reminder</LuxeLabel>
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
      <View style={{ marginBottom: 16 }}>
        <Controller control={control} name="repeat" render={({ field: { value, onChange } }) => (
          <RepeatChips value={value} onChange={onChange} />
        )} />
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={{ backgroundColor: accent, borderRadius: 14, paddingVertical: 14, alignItems: "center" }}
      >
        <LuxeLabel size={12} color={colors.bg}>Schedule Reminder</LuxeLabel>
      </Pressable>
    </PlannerCard>
  );
}

function ReminderItem({ item, onToggle, onSnooze, onDelete, onEdit }: {
  item: Reminder; onToggle: () => void; onSnooze: () => void; onDelete: () => void; onEdit: (input: EditInput) => void;
}) {
  const accent = useAccentColor();
  const [expanded, setExpanded] = useState(false);
  const at = new Date(item.remindAt);
  return (
    <PlannerCard>
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <Pressable onPress={onToggle} hitSlop={8}>
          <View
            className="items-center justify-center"
            style={{
              width: 26, height: 26, borderRadius: 13,
              borderWidth: 1.5, borderColor: item.done ? accent : colors.border,
              backgroundColor: item.done ? accent : "transparent",
            }}
          >
            {item.done ? <Feather name="check" size={15} color={colors.bg} /> : null}
          </View>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => setExpanded((e) => !e)}>
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
                <Text style={{ color: accent, fontSize: 9, textTransform: "uppercase" }}>{item.repeat}</Text>
              </View>
            )}
          </View>
        </Pressable>
        {!item.done && (
          <Pressable onPress={onSnooze} hitSlop={6} style={{ marginRight: 6 }}>
            <Feather name="rotate-ccw" size={17} color={colors.inkMuted} />
          </Pressable>
        )}
        <Pressable onPress={onDelete} hitSlop={6}>
          <Feather name="trash-2" size={17} color={colors.inkFaint} />
        </Pressable>
      </View>

      {expanded && (
        <View style={{ marginTop: 12, gap: 10 }}>
          <EditableTextBlock value={item.title} onSave={(t) => onEdit({ title: t })} placeholder="Reminder title" />
          <ReminderTimePicker label="When" value={at} onChange={(d) => onEdit({ at: d })} />
          <LuxeLabel size={11} color={colors.inkMuted}>Repeat</LuxeLabel>
          <RepeatChips value={item.repeat} onChange={(rp) => onEdit({ repeat: rp })} />
        </View>
      )}
    </PlannerCard>
  );
}
