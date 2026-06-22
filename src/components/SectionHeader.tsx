import React from "react";
import { View } from "react-native";
import { LuxeLabel } from "./LuxeText";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";

interface Props {
  title: string;
  accent?: "gold" | "love" | "ink";
  right?: React.ReactNode;
  /** Render the title on a filled accent chip (like the WAKE UP / CALORIES tags). */
  chip?: boolean;
}

const accentColor = { gold: colors.gold, love: colors.love, ink: colors.ink } as const;

export function SectionHeader({ title, accent, right, chip }: Props) {
  const globalAccent = useAccent();
  const tint = accentColor[accent ?? globalAccent];
  return (
    <View className="mb-3 flex-row items-center justify-between">
      {chip ? (
        <View
          style={{ backgroundColor: tint, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}
        >
          <LuxeLabel color={colors.bg} size={11}>{title}</LuxeLabel>
        </View>
      ) : (
        <View className="flex-row items-center">
          <View style={{ width: 3, height: 16, backgroundColor: tint, borderRadius: 2, marginRight: 10 }} />
          <LuxeLabel color={colors.ink} size={13}>{title}</LuxeLabel>
        </View>
      )}
      {right}
    </View>
  );
}
