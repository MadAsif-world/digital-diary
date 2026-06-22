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
    <PlannerCard elevated style={{ flex: 1, minWidth: 120 }}>
      <View className="flex-row items-center justify-between">
        <LuxeLabel size={10} color={colors.inkMuted}>{label}</LuxeLabel>
        {icon ? <Feather name={icon} size={15} color={tint} /> : null}
      </View>
      <View className="mt-2 flex-row items-baseline">
        <Text style={{ color: colors.ink, fontSize: 26, fontWeight: "700" }}>{value}</Text>
        {unit ? <Text style={{ color: colors.inkMuted, fontSize: 12, marginLeft: 4 }}>{unit}</Text> : null}
      </View>
    </PlannerCard>
  );
}
