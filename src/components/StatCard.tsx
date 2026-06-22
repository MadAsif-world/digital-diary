import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PlannerCard } from "./PlannerCard";
import { LuxeLabel } from "./LuxeText";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  accent?: "gold" | "love";
}

export function StatCard({ label, value, unit, icon, accent }: Props) {
  const globalAccent = useAccent();
  const tint = (accent ?? globalAccent) === "love" ? colors.love : colors.gold;
  return (
    // minWidth:0 lets a row of cards shrink to share the width instead of
    // overflowing (3 stat cards must fit a phone). Label truncates if tight.
    <PlannerCard elevated style={{ flex: 1, minWidth: 0 }}>
      <View className="flex-row items-center justify-between" style={{ gap: 4 }}>
        <LuxeLabel size={9} color={colors.inkMuted} style={{ flex: 1 }} numberOfLines={1}>{label}</LuxeLabel>
        {icon ? <Feather name={icon} size={14} color={tint} /> : null}
      </View>
      <View className="mt-2 flex-row items-baseline">
        <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 24, fontWeight: "700" }}>{value}</Text>
        {unit ? <Text style={{ color: colors.inkMuted, fontSize: 12, marginLeft: 4 }}>{unit}</Text> : null}
      </View>
    </PlannerCard>
  );
}
