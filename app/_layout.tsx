import "../global.css";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AppShell } from "../src/components/AppShell";
import { useAppStore } from "../src/store/app";
import { colors } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const init = useAppStore((s) => s.init);
  const ready = useAppStore((s) => s.ready);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init()
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, [init]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {error ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.bg }}>
            <Text style={{ color: colors.love, fontSize: 16, fontWeight: "600" }}>Failed to start</Text>
            <Text style={{ color: colors.inkMuted, marginTop: 8, textAlign: "center" }}>{error}</Text>
          </View>
        ) : ready ? (
          <AppShell />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
            <ActivityIndicator color={colors.gold} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
