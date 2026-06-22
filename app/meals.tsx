import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, SectionHeader, DateSwitcher, EditableTextBlock } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useDayScreen } from "../src/hooks/useDayScreen";
import { useDayStore } from "../src/store/day";
import { useAppStore } from "../src/store/app";
import { addDays, parseDayKey, isToday, dayKey as todayKey } from "../src/lib/date";
import { colors } from "../src/theme";

const SLOTS = [
  { key: "breakfast", label: "Breakfast", icon: "sunrise" as const },
  { key: "lunch", label: "Lunch", icon: "sun" as const },
  { key: "dinner", label: "Dinner", icon: "sunset" as const },
  { key: "snacks", label: "Snacks", icon: "coffee" as const },
];

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function MealsScreen() {
  const { dayKey, goPrev, goNext, goToday } = useDayScreen();
  const meal = useDayStore((s) => s.meal);
  const update = useDayStore((s) => s.updateMeal);
  const setDay = useAppStore((s) => s.setDay);

  // Build the Sun–Sat week containing the selected day.
  const selected = parseDayKey(dayKey);
  const weekStart = addDays(dayKey, -selected.getDay());
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (!meal) return <Screen title="Meal Plan"><View /></Screen>;

  return (
    <Screen
      title="Meal Plan"
      subtitle="Plan the week's table"
      right={<DateSwitcher dayKey={dayKey} onPrev={goPrev} onNext={goNext} onToday={goToday} />}
    >
      {/* Week strip */}
      <PlannerCard elevated style={{ marginBottom: 16 }}>
        <View className="flex-row justify-between">
          {week.map((wk, i) => {
            const d = parseDayKey(wk);
            const active = wk === dayKey;
            const today = isToday(wk);
            return (
              <Pressable key={wk} onPress={() => setDay(wk)} className="items-center" style={{ flex: 1 }}>
                <LuxeLabel size={9} color={colors.inkFaint}>{DOW[i]}</LuxeLabel>
                <View
                  className="items-center justify-center"
                  style={{
                    width: 34, height: 34, borderRadius: 17, marginTop: 6,
                    backgroundColor: active ? colors.gold : "transparent",
                    borderWidth: today && !active ? 1 : 0, borderColor: colors.gold,
                  }}
                >
                  <Text style={{ color: active ? colors.bg : colors.ink, fontSize: 14, fontWeight: active ? "700" : "400" }}>
                    {d.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </PlannerCard>

      {SLOTS.map((slot) => (
        <PlannerCard key={slot.key} style={{ marginBottom: 12 }}>
          <View className="mb-3 flex-row items-center" style={{ gap: 10 }}>
            <Feather name={slot.icon} size={16} color={colors.gold} />
            <LuxeLabel size={12} color={colors.ink}>{slot.label}</LuxeLabel>
          </View>
          <EditableTextBlock
            value={(meal as any)[slot.key] ?? ""}
            onSave={(v) => update({ [slot.key]: v } as any)}
            multiline
            placeholder={`What's for ${slot.label.toLowerCase()}?`}
            minHeight={64}
          />
        </PlannerCard>
      ))}

      <PlannerCard>
        <SectionHeader title="Notes for the day" />
        <EditableTextBlock value={meal.note} onSave={(note) => update({ note })} multiline placeholder="Prep notes, groceries to grab…" />
      </PlannerCard>
    </Screen>
  );
}
