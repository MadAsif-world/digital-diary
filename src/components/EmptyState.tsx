import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme";

interface Props {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  hint?: string;
}

export function EmptyState({ icon = "feather", title, hint }: Props) {
  return (
    <View className="items-center justify-center px-6 py-10">
      <View
        className="items-center justify-center"
        style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: colors.bgDeep, borderWidth: 1, borderColor: colors.border,
        }}
      >
        <Feather name={icon} size={22} color={colors.inkFaint} />
      </View>
      <Text style={{ color: colors.inkMuted, fontSize: 15, fontWeight: "600", marginTop: 14 }}>
        {title}
      </Text>
      {hint ? (
        <Text style={{ color: colors.inkFaint, fontSize: 13, marginTop: 6, textAlign: "center" }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
