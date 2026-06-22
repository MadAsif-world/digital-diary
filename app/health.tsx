import React from "react";
import { View, Text, Pressable } from "react-native";
import { Screen, PlannerCard, SectionHeader, DateSwitcher, ProgressSlider, EditableTextBlock } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useDayScreen } from "../src/hooks/useDayScreen";
import { useDayStore } from "../src/store/day";
import { colors } from "../src/theme";

const MOODS = [
  { v: 1, e: "😔", label: "Low" },
  { v: 2, e: "😕", label: "Meh" },
  { v: 3, e: "😐", label: "Okay" },
  { v: 4, e: "🙂", label: "Good" },
  { v: 5, e: "😄", label: "Great" },
];

export default function HealthScreen() {
  const { dayKey, goPrev, goNext, goToday } = useDayScreen();
  const health = useDayStore((s) => s.health);
  const update = useDayStore((s) => s.updateHealth);

  if (!health) return <Screen title="Health & Fitness"><View /></Screen>;

  return (
    <Screen
      title="Health & Fitness"
      subtitle="Daily wellness tracker"
      right={<DateSwitcher dayKey={dayKey} onPrev={goPrev} onNext={goNext} onToday={goToday} />}
    >
      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Activity" chip />
        <ProgressSlider label="Meditation" value={health.meditationMin} max={60} step={5} unit="min" onChange={(v) => update({ meditationMin: v })} />
        <ProgressSlider label="Yoga" value={health.yogaMin} max={60} step={5} unit="min" onChange={(v) => update({ yogaMin: v })} />
        <ProgressSlider label="Workouts" value={health.workoutMin} max={120} step={5} unit="min" onChange={(v) => update({ workoutMin: v })} />
        <ProgressSlider label="Steps" value={health.steps} max={20000} step={500} unit="" onChange={(v) => update({ steps: v })} />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Body" chip />
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
                  borderWidth: 1, borderColor: active ? colors.gold : colors.border,
                }}
              >
                <Text style={{ fontSize: 24 }}>{m.e}</Text>
                <LuxeLabel size={8} color={active ? colors.gold : colors.inkFaint} style={{ marginTop: 6 }}>{m.label}</LuxeLabel>
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
