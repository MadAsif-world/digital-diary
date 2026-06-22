import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Switch, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, SectionHeader } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useAppStore } from "../src/store/app";
import { useDayStore } from "../src/store/day";
import { useTaskStore } from "../src/store/tasks";
import { useReminderStore } from "../src/store/reminders";
import { useBillStore } from "../src/store/bills";
import { useShoppingStore } from "../src/store/shopping";
import { useNoteStore } from "../src/store/notes";
import { useEventStore } from "../src/store/events";
import { resetDatabase } from "../src/db/database";
import { ensureNotificationPermissions } from "../src/notifications";
import { colors } from "../src/theme";

export default function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const init = useAppStore((s) => s.init);
  const [name, setName] = useState(settings?.displayName ?? "");

  const doReset = async () => {
    await resetDatabase();
    await init(); // reloads settings + the planner day
    const day = useAppStore.getState().selectedDayKey;
    // The DB is wiped but the in-memory stores still hold old rows — refresh them all.
    useShoppingStore.setState({ activeListId: null, items: {} });
    useEventStore.setState({ byDay: {} });
    await Promise.all([
      useDayStore.getState().load(day),
      useTaskStore.getState().load(),
      useReminderStore.getState().load(),
      useBillStore.getState().load(),
      useShoppingStore.getState().load(),
      useNoteStore.getState().load(),
    ]);
    setName("");
  };

  const onReset = () => {
    // Alert is native-only; fall back to confirm() on web.
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      if (typeof confirm === "function" && confirm("Reset all data? This permanently clears every planner entry.")) {
        void doReset();
      }
      return;
    }
    Alert.alert("Reset all data?", "This permanently clears every planner entry on this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => void doReset() },
    ]);
  };

  return (
    <Screen title="Settings" subtitle="Make Aura yours">
      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Profile" />
        <LuxeLabel size={10} color={colors.inkMuted} style={{ marginBottom: 6 }}>Display name</LuxeLabel>
        <TextInput
          value={name}
          onChangeText={setName}
          onEndEditing={() => updateSettings({ displayName: name })}
          placeholder="Your name"
          placeholderTextColor={colors.inkFaint}
          style={{ color: colors.ink, fontSize: 15, backgroundColor: colors.bgDeep, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 }}
        />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Appearance" />
        <LuxeLabel size={10} color={colors.inkMuted} style={{ marginBottom: 10 }}>Primary accent</LuxeLabel>
        <View className="flex-row" style={{ gap: 12 }}>
          {(["gold", "love"] as const).map((accent) => {
            const active = settings?.themeAccent === accent;
            const c = accent === "gold" ? colors.gold : colors.love;
            return (
              <Pressable
                key={accent}
                onPress={() => updateSettings({ themeAccent: accent })}
                className="flex-row items-center"
                style={{ gap: 10, flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: active ? c : colors.border, backgroundColor: active ? colors.elevated : "transparent" }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c }} />
                <Text style={{ color: colors.ink, fontSize: 14, textTransform: "capitalize" }}>{accent}</Text>
                {active ? <Feather name="check" size={16} color={c} style={{ marginLeft: "auto" }} /> : null}
              </Pressable>
            );
          })}
        </View>
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Notifications" />
        <Row
          label="Reminder notifications"
          right={
            <Switch
              value={!!settings?.notificationsEnabled}
              onValueChange={async (v) => {
                if (v) await ensureNotificationPermissions();
                updateSettings({ notificationsEnabled: v ? 1 : 0 });
              }}
              trackColor={{ true: colors.gold, false: colors.border }}
              thumbColor={colors.ink}
            />
          }
        />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Sync" />
        <Row label="Account" right={<Text style={{ color: colors.inkMuted, fontSize: 13 }}>Offline only</Text>} />
        <Text style={{ color: colors.inkFaint, fontSize: 12, marginTop: 6 }}>
          Your data lives on this device. Cloud sync & sign-in arrive in a later update — every record is already stamped for a clean merge.
        </Text>
      </PlannerCard>

      <PlannerCard>
        <SectionHeader title="Data" accent="love" />
        <Pressable onPress={onReset} className="flex-row items-center" style={{ gap: 10, paddingVertical: 6 }}>
          <Feather name="trash-2" size={18} color={colors.love} />
          <Text style={{ color: colors.love, fontSize: 15 }}>Reset all data</Text>
        </Pressable>
      </PlannerCard>

      <Text style={{ color: colors.inkFaint, fontSize: 12, textAlign: "center", marginTop: 20 }}>
        Aura Planner · v0.1.0
      </Text>
    </Screen>
  );
}

function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between" style={{ paddingVertical: 4 }}>
      <Text style={{ color: colors.ink, fontSize: 15 }}>{label}</Text>
      {right}
    </View>
  );
}
