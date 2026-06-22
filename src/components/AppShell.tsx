import React, { useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
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
 *
 * Keyboard handling: Android edge-to-edge (default in SDK 54) doesn't resize the
 * window for the keyboard, so we lift the content ourselves. useAnimatedKeyboard
 * tracks the keyboard on the UI thread, so the content rides up in sync with it
 * (no snap-to-top then settle). We lift by keyboardHeight minus the tab-bar
 * height so the focused input lands right on top of the keyboard while the bar
 * tucks behind it. On web there is no soft keyboard, so height stays 0 (no-op).
 */
export function AppShell() {
  const { isTablet } = useBreakpoint();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const keyboard = useAnimatedKeyboard();

  // On tablet there is no bottom bar, so navHeight stays 0 → lift by full height.
  const contentStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboard.height.value - navHeight),
  }));

  if (isTablet) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
        <SafeAreaView edges={["top", "left", "bottom"]} style={{ backgroundColor: colors.bgDeep }}>
          <SidebarNavigation />
        </SafeAreaView>
        <SafeAreaView edges={["top", "right", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
          <Animated.View style={[{ flex: 1 }, contentStyle]}>
            <Slot />
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.View style={[{ flex: 1 }, contentStyle]}>
        <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.bg }}>
          <Slot />
        </SafeAreaView>
      </Animated.View>
      <View onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}>
        <BottomNavigation onAdd={() => setPickerOpen(true)} />
      </View>
      <ModulePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </View>
  );
}
