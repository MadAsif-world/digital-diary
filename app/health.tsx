import React from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, SectionHeader, DateSwitcher, ProgressSlider, EditableTextBlock } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useDayScreen } from "../src/hooks/useDayScreen";
import { useDayStore } from "../src/store/day";
import { useAppStore } from "../src/store/app";
import { useAccentColor } from "../src/hooks/useAccent";
import { scheduleWaterReminder, scheduleBreathReminder, cancelWellnessReminder } from "../src/notifications";
import { DEFAULT_GOALS } from "../src/db/types";
import { colors } from "../src/theme";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pad2 = (n: number) => String(n).padStart(2, "0");

const MOODS = [
  { v: 1, e: "😔", label: "Low" },
  { v: 2, e: "😕", label: "Meh" },
  { v: 3, e: "😐", label: "Okay" },
  { v: 4, e: "🙂", label: "Good" },
  { v: 5, e: "😄", label: "Great" },
];

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default function HealthScreen() {
  const { dayKey, goPrev, goNext, goToday } = useDayScreen();
  const health = useDayStore((s) => s.health);
  const update = useDayStore((s) => s.updateHealth);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const accent = useAccentColor();

  if (!health) return <Screen title="Health & Fitness"><View /></Screen>;

  // Goals live on user_settings; fall back to defaults for pre-v2 rows (e.g. web).
  const g = {
    water: settings?.waterGoalMl ?? DEFAULT_GOALS.waterGoalMl,
    steps: settings?.stepsGoal ?? DEFAULT_GOALS.stepsGoal,
    sleep: settings?.sleepGoalHours ?? DEFAULT_GOALS.sleepGoalHours,
    meditation: settings?.meditationGoalMin ?? DEFAULT_GOALS.meditationGoalMin,
    workout: settings?.workoutGoalMin ?? DEFAULT_GOALS.workoutGoalMin,
  };
  const bumpGoal = (field: keyof typeof DEFAULT_GOALS, next: number) =>
    void updateSettings({ [field]: Math.max(0, Math.round(next * 100) / 100) });

  // Wellness reminders (water / breath) — persisted on settings, scheduled as
  // OS notifications (no-op on web / Expo Go; fires in a real build).
  const waterEnabled = !!settings?.waterReminderEnabled;
  const waterEveryMin = settings?.waterReminderEveryMin ?? 120;
  const breathEnabled = !!settings?.breathReminderEnabled;
  const breathTime = settings?.breathReminderTime ?? "09:00";

  const toggleWater = async (on: boolean) => {
    await updateSettings({ waterReminderEnabled: on ? 1 : 0 });
    if (on) await scheduleWaterReminder(waterEveryMin);
    else await cancelWellnessReminder("water");
  };
  const stepWater = async (delta: number) => {
    const v = clamp(waterEveryMin + delta, 30, 480);
    await updateSettings({ waterReminderEveryMin: v });
    if (waterEnabled) await scheduleWaterReminder(v);
  };
  const toggleBreath = async (on: boolean) => {
    await updateSettings({ breathReminderEnabled: on ? 1 : 0 });
    if (on) await scheduleBreathReminder(breathTime);
    else await cancelWellnessReminder("breath");
  };
  const stepBreathHour = async (delta: number) => {
    const [h, m] = breathTime.split(":").map(Number);
    const t = `${pad2((h + delta + 24) % 24)}:${pad2(m || 0)}`;
    await updateSettings({ breathReminderTime: t });
    if (breathEnabled) await scheduleBreathReminder(t);
  };

  return (
    <Screen
      title="Health & Fitness"
      subtitle="Daily wellness tracker"
      right={<DateSwitcher dayKey={dayKey} onPrev={goPrev} onNext={goNext} onToday={goToday} />}
    >
      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Today's Goals" chip />
        <GoalRow icon="droplet" label="Water" value={health.waterMl} goal={g.water} unit="ml" step={250} onGoal={(d) => bumpGoal("waterGoalMl", g.water + d)} />
        <GoalRow icon="activity" label="Steps" value={health.steps} goal={g.steps} unit="" step={1000} onGoal={(d) => bumpGoal("stepsGoal", g.steps + d)} />
        <GoalRow icon="moon" label="Sleep" value={health.sleepHours} goal={g.sleep} unit="h" step={0.5} onGoal={(d) => bumpGoal("sleepGoalHours", g.sleep + d)} />
        <GoalRow icon="wind" label="Meditation" value={health.meditationMin} goal={g.meditation} unit="min" step={5} onGoal={(d) => bumpGoal("meditationGoalMin", g.meditation + d)} />
        <GoalRow icon="zap" label="Workout" value={health.workoutMin} goal={g.workout} unit="min" step={5} onGoal={(d) => bumpGoal("workoutGoalMin", g.workout + d)} last />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Wellness Reminders" chip />
        <WellnessRow
          icon="droplet"
          label="Drink water"
          enabled={waterEnabled}
          detail={waterEveryMin % 60 === 0 ? `Every ${waterEveryMin / 60}h` : `Every ${waterEveryMin} min`}
          onToggle={(v) => void toggleWater(v)}
          onDown={() => void stepWater(-30)}
          onUp={() => void stepWater(30)}
        />
        <WellnessRow
          icon="wind"
          label="Breathe"
          enabled={breathEnabled}
          detail={`Daily at ${breathTime}`}
          onToggle={(v) => void toggleBreath(v)}
          onDown={() => void stepBreathHour(-1)}
          onUp={() => void stepBreathHour(1)}
          last
        />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Log Activity" chip />
        <ProgressSlider label="Meditation" value={health.meditationMin} max={60} step={5} unit="min" onChange={(v) => update({ meditationMin: v })} />
        <ProgressSlider label="Yoga" value={health.yogaMin} max={60} step={5} unit="min" onChange={(v) => update({ yogaMin: v })} />
        <ProgressSlider label="Workouts" value={health.workoutMin} max={120} step={5} unit="min" onChange={(v) => update({ workoutMin: v })} />
        <ProgressSlider label="Steps" value={health.steps} max={20000} step={500} unit="" onChange={(v) => update({ steps: v })} />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Log Body" chip />
        <ProgressSlider label="Water" value={health.waterMl} max={4000} step={250} unit="ml" onChange={(v) => update({ waterMl: v })} />
        <ProgressSlider label="Sleep" value={health.sleepHours} min={0} max={12} step={0.5} unit="hrs" onChange={(v) => update({ sleepHours: v })} />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Mood & Energy" chip />
        <View className="flex-row justify-between" style={{ marginTop: 4 }}>
          {MOODS.map((m) => {
            const active = health.mood === m.v;
            return (
              <Pressable
                key={m.v}
                onPress={() => update({ mood: m.v })}
                className="items-center"
                style={{
                  paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, flex: 1, marginHorizontal: 3,
                  backgroundColor: active ? colors.elevated : "transparent",
                  borderWidth: 1, borderColor: active ? accent : colors.border,
                }}
              >
                <Text style={{ fontSize: 24 }}>{m.e}</Text>
                <LuxeLabel size={8} color={active ? accent : colors.inkFaint} style={{ marginTop: 6 }}>{m.label}</LuxeLabel>
              </Pressable>
            );
          })}
        </View>
      </PlannerCard>

      <PlannerCard>
        <SectionHeader title="Daily Health Note" chip />
        <EditableTextBlock value={health.note} onSave={(note) => update({ note })} multiline placeholder="How did your body feel today?" />
      </PlannerCard>
    </Screen>
  );
}

function WellnessRow({
  icon, label, enabled, detail, onToggle, onDown, onUp, last,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string; enabled: boolean; detail: string;
  onToggle: (v: boolean) => void; onDown: () => void; onUp: () => void; last?: boolean;
}) {
  const accent = useAccentColor();
  return (
    <View style={{ marginBottom: last ? 0 : 14 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Feather name={icon} size={15} color={enabled ? accent : colors.inkMuted} />
          <LuxeLabel size={11} color={colors.ink}>{label}</LuxeLabel>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: accent, false: colors.border }}
          thumbColor={colors.ink}
        />
      </View>
      {enabled && (
        <View className="flex-row items-center" style={{ gap: 12, marginTop: 8, marginLeft: 23 }}>
          <Pressable onPress={onDown} hitSlop={8}><Feather name="minus-circle" size={18} color={colors.inkMuted} /></Pressable>
          <Text style={{ color: colors.inkMuted, fontSize: 12, minWidth: 92, textAlign: "center" }}>{detail}</Text>
          <Pressable onPress={onUp} hitSlop={8}><Feather name="plus-circle" size={18} color={accent} /></Pressable>
        </View>
      )}
    </View>
  );
}

function GoalRow({
  icon, label, value, goal, unit, step, onGoal, last,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string; value: number; goal: number; unit: string; step: number;
  onGoal: (delta: number) => void; last?: boolean;
}) {
  const accent = useAccentColor();
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const reached = goal > 0 && value >= goal;
  const barColor = reached ? colors.success : accent;
  return (
    <View style={{ marginBottom: last ? 0 : 16 }}>
      <View className="flex-row items-center justify-between" style={{ marginBottom: 8 }}>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Feather name={icon} size={15} color={barColor} />
          <LuxeLabel size={11} color={colors.ink}>{label}</LuxeLabel>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <Pressable onPress={() => onGoal(-step)} hitSlop={8}><Feather name="minus-circle" size={18} color={colors.inkMuted} /></Pressable>
          <Text style={{ color: colors.inkMuted, fontSize: 12, minWidth: 78, textAlign: "center" }}>Goal {fmt(goal)}{unit}</Text>
          <Pressable onPress={() => onGoal(step)} hitSlop={8}><Feather name="plus-circle" size={18} color={accent} /></Pressable>
        </View>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgDeep, overflow: "hidden" }}>
        <View style={{ width: `${pct * 100}%`, height: 8, borderRadius: 4, backgroundColor: barColor }} />
      </View>
      <Text style={{ color: reached ? colors.success : colors.inkMuted, fontSize: 11, marginTop: 5 }}>
        {fmt(value)} / {fmt(goal)}{unit} · {Math.round(pct * 100)}%{reached ? "  ✓ reached" : ""}
      </Text>
    </View>
  );
}
