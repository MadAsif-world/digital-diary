import React from "react";
import { View, Pressable, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AppIcon } from "../AppIcon";
import { moduleByKey, type ModuleKey } from "../../constants/modules";
import { colors } from "../../theme";
import { useAccent } from "../../hooks/useAccent";

interface Tab {
  key: string;
  label: string;
  route: string;
  iconFamily?: "feather" | "mci";
  iconName: string;
  accent: "gold" | "love";
}

/**
 * Phone tab bar. Four primary destinations plus a Menu tab that opens the full
 * module list, so every part of the app is reachable in at most two taps.
 */
function tabFromModule(key: ModuleKey): Tab {
  const m = moduleByKey(key);
  return { key, label: m.label, route: m.route, iconFamily: m.iconFamily, iconName: m.iconName, accent: m.accent === "love" ? "love" : "gold" };
}

const TABS: Tab[] = [
  tabFromModule("dashboard"),
  tabFromModule("todo"),
  tabFromModule("reminders"),
  tabFromModule("schedule"),
  { key: "menu", label: "Menu", route: "/menu", iconFamily: "feather", iconName: "menu", accent: "gold" },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const accentColor = useAccent() === "love" ? colors.love : colors.gold;

  // Routes that live "inside" the Menu tab so it stays highlighted on them.
  const menuRoutes = ["/menu", "/priorities", "/bills", "/shopping", "/notes", "/health", "/meals", "/love", "/settings"];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.bgDeep,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 10,
        paddingHorizontal: 8,
      }}
    >
      {TABS.map((tab) => {
        const active = tab.key === "menu" ? menuRoutes.includes(pathname) : pathname === tab.route;
        const tint = accentColor;
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.push(tab.route as never)}
            className="flex-1 items-center"
            style={{ paddingVertical: 4 }}
          >
            {tab.iconFamily ? (
              <AppIcon family={tab.iconFamily} name={tab.iconName} size={22} color={active ? tint : colors.inkFaint} />
            ) : (
              <Feather name={tab.iconName as never} size={22} color={active ? tint : colors.inkFaint} />
            )}
            <Text
              style={{
                fontSize: 9, marginTop: 4, letterSpacing: 1,
                textTransform: "uppercase",
                color: active ? colors.ink : colors.inkFaint,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
