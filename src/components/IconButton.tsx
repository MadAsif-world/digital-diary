import React from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";

type Variant = "ghost" | "outline" | "filled";

interface Props {
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  size?: number;
  variant?: Variant;
  accent?: "gold" | "love" | "ink";
  disabled?: boolean;
}

const accentColor = { gold: colors.gold, love: colors.love, ink: colors.ink } as const;

/** Circular icon button — the gold-outline circles in the reference nav. */
export function IconButton({
  icon, onPress, size = 44, variant = "outline", accent, disabled,
}: Props) {
  const globalAccent = useAccent();
  const tint = accentColor[accent ?? globalAccent];
  const isFilled = variant === "filled";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: disabled ? 0.4 : pressed ? 0.7 : 1 })}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: isFilled ? tint : variant === "outline" ? colors.elevated : "transparent",
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: tint,
        }}
      >
        <Feather
          name={icon}
          size={size * 0.42}
          color={isFilled ? colors.bg : tint}
        />
      </View>
    </Pressable>
  );
}
