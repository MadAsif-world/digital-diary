import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { MODULES } from "../../constants/modules";
import { AppIcon } from "../AppIcon";
import { LuxeLabel } from "../LuxeText";
import { colors } from "../../theme";
import { useAccent } from "../../hooks/useAccent";

/** Tablet/desktop left sidebar — app identity, module list, settings. */
export function SidebarNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const accentColor = useAccent() === "love" ? colors.love : colors.gold;

  return (
    <View
      style={{
        width: 248,
        backgroundColor: colors.bgDeep,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        paddingTop: 28,
        paddingHorizontal: 16,
        paddingBottom: 16,
      }}
    >
      <View className="mb-6 px-2">
        <LuxeLabel size={16} color={accentColor}>Digital Diary</LuxeLabel>
        <Text style={{ color: colors.inkMuted, fontSize: 12, marginTop: 2 }}>Personal Planner</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {MODULES.map((mod) => {
          const active = pathname === mod.route;
          const tint = mod.accent === "love" ? colors.love : accentColor;
          return (
            <Pressable
              key={mod.key}
              onPress={() => router.push(mod.route as never)}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, marginBottom: 4,
                backgroundColor: active ? colors.elevated : "transparent",
              }}
            >
              <AppIcon
                family={mod.iconFamily}
                name={mod.iconName}
                size={18}
                color={active ? tint : colors.inkMuted}
              />
              <Text
                style={{
                  marginLeft: 14, fontSize: 13, letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: active ? colors.ink : colors.inkMuted,
                  fontWeight: active ? "600" : "400",
                }}
              >
                {mod.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/settings" as never)}
        style={{
          flexDirection: "row", alignItems: "center",
          paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14,
          backgroundColor: pathname === "/settings" ? colors.elevated : "transparent",
        }}
      >
        <Feather name="settings" size={18} color={colors.inkMuted} />
        <Text style={{ marginLeft: 14, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted }}>
          Settings
        </Text>
      </Pressable>
    </View>
  );
}
