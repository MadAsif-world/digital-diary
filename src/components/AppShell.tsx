import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { SidebarNavigation } from "./nav/SidebarNavigation";
import { IconRail } from "./nav/IconRail";
import { useBreakpoint } from "../lib/responsive";
import { colors } from "../theme";

/**
 * Responsive frame around every screen.
 *   phone  → thin left icon rail + content (the reference's signature layout)
 *   tablet → wider labelled sidebar + content
 */
export function AppShell() {
  const { isTablet } = useBreakpoint();

  if (isTablet) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
        <SafeAreaView edges={["top", "left", "bottom"]} style={{ backgroundColor: colors.bgDeep }}>
          <SidebarNavigation />
        </SafeAreaView>
        <SafeAreaView edges={["top", "right", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
          <Slot />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
      <SafeAreaView edges={["top", "left", "bottom"]} style={{ backgroundColor: colors.bgDeep }}>
        <IconRail />
      </SafeAreaView>
      <SafeAreaView edges={["top", "right"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <Slot />
      </SafeAreaView>
    </View>
  );
}
