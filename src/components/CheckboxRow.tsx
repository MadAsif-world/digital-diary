import React from "react";
import { Pressable, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";

interface Props {
  checked: boolean;
  label: string;
  sublabel?: string;
  onToggle: () => void;
  onPressLabel?: () => void;
  right?: React.ReactNode;
  accent?: "gold" | "love";
}

export function CheckboxRow({
  checked, label, sublabel, onToggle, onPressLabel, right, accent,
}: Props) {
  const globalAccent = useAccent();
  const tint = (accent ?? globalAccent) === "love" ? colors.love : colors.gold;
  return (
    <View className="flex-row items-center py-2.5">
      <Pressable onPress={onToggle} hitSlop={8}>
        <View
          className="items-center justify-center"
          style={{
            width: 24, height: 24, borderRadius: 7,
            borderWidth: 1.5,
            borderColor: checked ? tint : colors.border,
            backgroundColor: checked ? tint : "transparent",
          }}
        >
          {checked ? <Feather name="check" size={15} color={colors.bg} /> : null}
        </View>
      </Pressable>
      <Pressable className="ml-3 flex-1" onPress={onPressLabel ?? onToggle}>
        <Text
          style={{
            color: checked ? colors.inkFaint : colors.ink,
            fontSize: 15,
            textDecorationLine: checked ? "line-through" : "none",
          }}
        >
          {label || "Untitled"}
        </Text>
        {sublabel ? (
          <Text style={{ color: colors.inkMuted, fontSize: 12, marginTop: 2 }}>{sublabel}</Text>
        ) : null}
      </Pressable>
      {right}
    </View>
  );
}
