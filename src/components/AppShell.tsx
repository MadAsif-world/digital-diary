import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { SidebarNavigation } from "./nav/SidebarNavigation";
import { BottomNavigation } from "./nav/BottomNavigation";
import { ModulePicker } from "./nav/ModulePicker";
import { useBreakpoint } from "../lib/responsive";
import { colors } from "../theme";

/**
 * Responsive frame around every screen.
 *   phone  → full-width content + bottom tab bar (standard mobile nav)
 *   tablet → wider labelled sidebar + content
 */
export function AppShell() {
  const { isTablet } = useBreakpoint();
  const [pickerOpen, setPickerOpen] = useState(false);

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
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <Slot />
      </SafeAreaView>
      <BottomNavigation onAdd={() => setPickerOpen(true)} />
      <ModulePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </View>
  );
}
