import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, DateSwitcher, EditableTextBlock } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useDayScreen } from "../src/hooks/useDayScreen";
import { useDayStore } from "../src/store/day";
import { colors } from "../src/theme";

const RATING_LABELS = ["Drained", "Low", "Steady", "Warm", "Radiant"];

export default function LoveScreen() {
  const { dayKey, goPrev, goNext, goToday } = useDayScreen();
  const love = useDayStore((s) => s.love);
  const update = useDayStore((s) => s.updateLove);

  if (!love) return <Screen title="Love Meter"><View /></Screen>;

  return (
    <Screen
      title="Love Meter"
      subtitle="Reflect and recharge"
      right={<DateSwitcher dayKey={dayKey} onPrev={goPrev} onNext={goNext} onToday={goToday} accent="love" />}
    >
      {/* The meter */}
      <PlannerCard accent="love" style={{ marginBottom: 16 }}>
        <View className="items-center">
          <LuxeLabel size={11} color={colors.love}>Emotional Energy</LuxeLabel>
          <View className="flex-row" style={{ gap: 12, marginVertical: 16 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= love.loveRating;
              return (
                <Pressable key={n} onPress={() => update({ loveRating: n })} hitSlop={6}>
                  <Feather name="heart" size={30} color={filled ? colors.love : colors.border} />
                </Pressable>
              );
            })}
          </View>
          <Text style={{ color: colors.loveSoft, fontSize: 14, fontWeight: "600" }}>
            {RATING_LABELS[love.loveRating - 1]}
          </Text>
        </View>
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 12 }}>
        <EditableTextBlock label="Me Time" accent="love" value={love.meTime} onSave={(v) => update({ meTime: v })} multiline placeholder="How did you care for yourself today?" minHeight={64} />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 12 }}>
        <EditableTextBlock label="Happy For" accent="love" value={love.happyFor} onSave={(v) => update({ happyFor: v })} multiline placeholder="Something you're grateful for…" minHeight={64} />
      </PlannerCard>

      <PlannerCard style={{ marginBottom: 12 }}>
        <EditableTextBlock label="Goal for Tomorrow" accent="love" value={love.goalTomorrow} onSave={(v) => update({ goalTomorrow: v })} multiline placeholder="One thing to look forward to…" minHeight={64} />
      </PlannerCard>

      <PlannerCard>
        <EditableTextBlock label="Daily Reflection" accent="love" value={love.reflection} onSave={(v) => update({ reflection: v })} multiline placeholder="Write freely about your day…" minHeight={120} />
      </PlannerCard>
    </Screen>
  );
}
