import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { MODULES } from "../../constants/modules";
import { AppIcon } from "../AppIcon";
import { colors } from "../../theme";
import { useAccent } from "../../hooks/useAccent";

/**
 * Persistent left icon rail (phone) — the signature navigation from the
 * reference: a thin vertical strip of every module's icon, the active one
 * highlighted, Love Meter pinned in red, Settings at the bottom.
 */
export function IconRail() {
  const router = useRouter();
  const pathname = usePathname();
  const accent = useAccent() === "love" ? colors.love : colors.gold;

  const items = [
    ...MODULES,
    {
      key: "settings", route: "/settings", iconFamily: "feather" as const,
      iconName: "settings", accent: "gold" as const,
    },
  ];

  return (
    <View
      style={{
        width: 60,
        backgroundColor: colors.bgDeep,
        borderRightWidth: 1,
        borderRightColor: colors.border,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, alignItems: "center" }}
      >
        {items.map((mod) => {
          const active = pathname === mod.route;
          const isLove = mod.accent === "love";
          const tint = isLove ? colors.love : active ? accent : colors.inkMuted;
          return (
            <Pressable
              key={mod.key}
              onPress={() => router.push(mod.route as never)}
              style={{ width: 60, alignItems: "center", marginVertical: 3 }}
            >
              <View
                style={{
                  width: 44, height: 44, borderRadius: 13,
                  alignItems: "center", justifyContent: "center",
                  backgroundColor: active ? colors.elevated : "transparent",
                  borderWidth: active ? 1 : 0,
                  borderColor: isLove ? colors.love : accent,
                }}
              >
                {mod.key === "settings" ? (
                  <Feather name="settings" size={20} color={tint} />
                ) : (
                  <AppIcon family={mod.iconFamily} name={mod.iconName} size={20} color={tint} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
