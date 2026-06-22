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
  iconFamily: "feather" | "mci";
  iconName: string;
  accent: "gold" | "love";
}

function tabFromModule(key: ModuleKey): Tab {
  const m = moduleByKey(key);
  return { key, label: m.label, route: m.route, iconFamily: m.iconFamily, iconName: m.iconName, accent: m.accent === "love" ? "love" : "gold" };
}

const TABS: Tab[] = [
  tabFromModule("dashboard"),
  tabFromModule("todo"),
  tabFromModule("reminders"),
  tabFromModule("schedule"),
];

/**
 * Phone tab bar: four primary destinations plus a trailing "+" that opens the
 * module picker wheel (every other module is reachable from there).
 */
export function BottomNavigation({ onAdd }: { onAdd: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const accentColor = useAccent() === "love" ? colors.love : colors.gold;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.bgDeep,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 10,
        paddingHorizontal: 8,
      }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.route;
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.push(tab.route as never)}
            className="flex-1 items-center"
            style={{ paddingVertical: 4 }}
          >
            <AppIcon family={tab.iconFamily} name={tab.iconName} size={22} color={active ? accentColor : colors.inkFaint} />
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

      {/* Trailing add button — opens the module picker wheel */}
      <View style={{ width: 64, alignItems: "center" }}>
        <Pressable
          onPress={onAdd}
          hitSlop={8}
          style={{
            width: 46, height: 46, borderRadius: 23,
            alignItems: "center", justifyContent: "center",
            backgroundColor: accentColor,
          }}
        >
          <Feather name="plus" size={24} color={colors.bgDeep} />
        </Pressable>
      </View>
    </View>
  );
}
