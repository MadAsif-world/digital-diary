import React, { useEffect, useState } from "react";
import { View, Keyboard, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { SidebarNavigation } from "./nav/SidebarNavigation";
import { BottomNavigation } from "./nav/BottomNavigation";
import { ModulePicker } from "./nav/ModulePicker";
import { useBreakpoint } from "../lib/responsive";
import { colors } from "../theme";

/**
 * Current keyboard height (0 when hidden). We handle this in JS because Android
 * edge-to-edge (default in SDK 54) no longer auto-resizes the window for the
 * keyboard, so KeyboardAvoidingView / softwareKeyboardLayoutMode don't lift
 * content. On web there is no soft keyboard, so this stays 0 (no-op).
 */
function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvt, (e) => setHeight(e.endCoordinates?.height ?? 0));
    const hide = Keyboard.addListener(hideEvt, () => setHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return height;
}

/**
 * Responsive frame around every screen.
 *   phone  → full-width content + bottom tab bar (standard mobile nav)
 *   tablet → wider labelled sidebar + content
 * When the keyboard is open we pad the content up by its height (and hide the
 * phone tab bar) so inputs — including the bottom docks — sit above it.
 */
export function AppShell() {
  const { isTablet } = useBreakpoint();
  const [pickerOpen, setPickerOpen] = useState(false);
  const keyboard = useKeyboardHeight();

  if (isTablet) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
        <SafeAreaView edges={["top", "left", "bottom"]} style={{ backgroundColor: colors.bgDeep }}>
          <SidebarNavigation />
        </SafeAreaView>
        <SafeAreaView edges={["top", "right", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ flex: 1, paddingBottom: keyboard }}>
            <Slot />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingBottom: keyboard }}>
        <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.bg }}>
          <Slot />
        </SafeAreaView>
      </View>
      {keyboard === 0 && <BottomNavigation onAdd={() => setPickerOpen(true)} />}
      <ModulePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </View>
  );
}
