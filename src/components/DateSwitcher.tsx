import React from "react";
import { View, Pressable, Text } from "react-native";
import { IconButton } from "./IconButton";
import { LuxeLabel } from "./LuxeText";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";
import { formatLongDate, isToday } from "../lib/date";

interface Props {
  dayKey: string;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
  accent?: "gold" | "love";
}

/** The reference's ← (1) → page navigator, repurposed as a day switcher. */
export function DateSwitcher({ dayKey, onPrev, onNext, onToday, accent }: Props) {
  const globalAccent = useAccent();
  accent = accent ?? globalAccent;
  const today = isToday(dayKey);
  return (
    <View className="flex-row items-center justify-between">
      <IconButton icon="arrow-left" onPress={onPrev} accent={accent} size={40} />
      <Pressable onPress={onToday} className="items-center px-3">
        <LuxeLabel size={11} color={accent === "love" ? colors.love : colors.gold}>
          {today ? "Today" : "Viewing"}
        </LuxeLabel>
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600", marginTop: 2 }}>
          {formatLongDate(dayKey)}
        </Text>
      </Pressable>
      <IconButton icon="arrow-right" onPress={onNext} accent={accent} size={40} />
    </View>
  );
}
