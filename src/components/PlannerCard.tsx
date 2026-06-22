import React from "react";
import { View, ViewProps, Pressable } from "react-native";
import { colors, shadow } from "../theme";

interface Props extends ViewProps {
  elevated?: boolean;
  accent?: "none" | "gold" | "love";
  onPress?: () => void;
  padded?: boolean;
}

/** The base surface for every planner block: rounded, dark, soft-shadowed. */
export function PlannerCard({
  children, elevated, accent = "none", onPress, padded = true, style, ...rest
}: Props) {
  const accentBorder =
    accent === "gold" ? colors.gold : accent === "love" ? colors.love : colors.border;

  const content = (
    <View
      {...rest}
      style={[
        {
          backgroundColor: elevated ? colors.elevated : colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: accent === "none" ? colors.border : accentBorder,
          padding: padded ? 18 : 0,
        },
        shadow.soft,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}
