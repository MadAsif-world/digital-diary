import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { PlannerCard } from "./PlannerCard";
import { AppIcon } from "./AppIcon";
import { LuxeLabel } from "./LuxeText";
import { colors } from "../theme";
import type { ModuleDef } from "../constants/modules";

/** A tappable tile for a planner module — used in the dashboard quick links. */
export function ModuleTile({ module }: { module: ModuleDef }) {
  const router = useRouter();
  const tint = module.accent === "love" ? colors.love : colors.gold;
  return (
    <PlannerCard
      onPress={() => router.push(module.route as never)}
      style={{ flex: 1, minWidth: 150 }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: colors.bgDeep, borderWidth: 1, borderColor: colors.border,
        }}
      >
        <AppIcon family={module.iconFamily} name={module.iconName} size={20} color={tint} />
      </View>
      <LuxeLabel size={12} color={colors.ink} style={{ marginTop: 12 }}>
        {module.label}
      </LuxeLabel>
      <Text style={{ color: colors.inkMuted, fontSize: 12, marginTop: 4 }} numberOfLines={1}>
        {module.subtitle}
      </Text>
    </PlannerCard>
  );
}
