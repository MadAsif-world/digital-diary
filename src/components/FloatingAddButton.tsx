import React from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, shadow } from "../theme";
import { useAccent } from "../hooks/useAccent";

interface Props {
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  accent?: "gold" | "love";
  /** Extra bottom offset so it clears the mobile bottom nav. */
  bottomOffset?: number;
}

export function FloatingAddButton({ onPress, icon = "plus", accent, bottomOffset = 24 }: Props) {
  const globalAccent = useAccent();
  const tint = (accent ?? globalAccent) === "love" ? colors.love : colors.gold;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        right: 20,
        bottom: bottomOffset,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View
        className="items-center justify-center rounded-full"
        style={[{ width: 58, height: 58, backgroundColor: tint }, shadow.card]}
      >
        <Feather name={icon} size={26} color={colors.bg} />
      </View>
    </Pressable>
  );
}
