import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { SidebarNavigation } from "./nav/SidebarNavigation";
import { BottomNavigation } from "./nav/BottomNavigation";
import { useBreakpoint } from "../lib/responsive";
import { colors } from "../theme";

/**
 * Responsive frame around every screen.
 *   phone  → content above a bottom tab bar
 *   tablet → persistent left sidebar beside the content
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <Slot />
      </SafeAreaView>
      <BottomNavigation />
    </View>
  );
}
