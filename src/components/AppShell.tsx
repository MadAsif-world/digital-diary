import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { SidebarNavigation } from "./nav/SidebarNavigation";
import { BottomNavigation } from "./nav/BottomNavigation";
import { ModulePicker } from "./nav/ModulePicker";
import { useBreakpoint } from "../lib/responsive";
import { colors } from "../theme";

// iOS needs KeyboardAvoidingView to lift content above the keyboard; Android
// resizes the window itself (android.softwareKeyboardLayoutMode "resize"), so
// the flex layout pushes docked inputs up on its own. On web it's a no-op.
const kbBehavior = Platform.OS === "ios" ? "padding" : undefined;

/**
 * Responsive frame around every screen.
 *   phone  → full-width content + bottom tab bar (standard mobile nav)
 *   tablet → wider labelled sidebar + content
 * Content is wrapped in KeyboardAvoidingView so inputs (including the bottom
 * docks) ride above the keyboard instead of hiding under it.
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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={kbBehavior}>
          <SafeAreaView edges={["top", "right", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
            <Slot />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={kbBehavior}>
        <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.bg }}>
          <Slot />
        </SafeAreaView>
      </KeyboardAvoidingView>
      <BottomNavigation onAdd={() => setPickerOpen(true)} />
      <ModulePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </View>
  );
}
