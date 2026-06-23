import React, { useRef, useState } from "react";
import {
  View, Text, Pressable, Animated, useWindowDimensions, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { AppIcon } from "../AppIcon";
import { LuxeLabel } from "../LuxeText";
import { PLANNER_MODULES } from "../../constants/modules";
import type { ModuleDef } from "../../constants/modules";
import { colors } from "../../theme";
import { useAccent } from "../../hooks/useAccent";

const ITEM_HEIGHT = 76;

// Settings rounds out the wheel even though it isn't a planner module.
const SETTINGS_ITEM = {
  key: "settings", title: "Settings", label: "Settings", subtitle: "",
  route: "/settings", iconFamily: "feather", iconName: "settings", accent: "gold",
} as unknown as ModuleDef;

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Full-screen module picker opened from the bottom bar "+". Modules sit on a
 * vertical arc that curves toward the right edge; the centered item swells and
 * lights up with its label. Scroll to bring a module to center, tap to open.
 */
export function ModulePicker({ visible, onClose }: Props) {
  const router = useRouter();
  const accent = useAccent() === "love" ? colors.love : colors.gold;
  const { height } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [centerIndex, setCenterIndex] = useState(0);

  const items = [...PLANNER_MODULES, SETTINGS_ITEM];
  const centerPad = Math.max(height / 2 - ITEM_HEIGHT / 2, ITEM_HEIGHT);

  if (!visible) return null;

  const go = (route: string) => {
    onClose();
    router.push(route as never);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dim backdrop — tap anywhere empty to dismiss */}
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8,8,8,0.82)" }]} onPress={onClose} />

      {/* Selection indicator: a soft band + handle at the vertical center */}
      <View style={{ position: "absolute", top: height / 2 - ITEM_HEIGHT / 2, height: ITEM_HEIGHT, left: 0, right: 0, pointerEvents: "none" }}>
        <View style={{ position: "absolute", right: 8, top: ITEM_HEIGHT / 2 - 3, width: 34, height: 6, borderRadius: 3, backgroundColor: colors.elevated }} />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: centerPad }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            // Track the centered module live so the highlight follows the
            // scroll on every platform (momentum-end is flaky on web).
            listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
              const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              setCenterIndex(Math.min(items.length - 1, Math.max(0, i)));
            },
          },
        )}
      >
        {items.map((mod, i) => {
          const inputRange = [
            (i - 2) * ITEM_HEIGHT, (i - 1) * ITEM_HEIGHT, i * ITEM_HEIGHT,
            (i + 1) * ITEM_HEIGHT, (i + 2) * ITEM_HEIGHT,
          ];
          // Center item bulges left into the screen; neighbours recede right.
          const translateX = scrollY.interpolate({ inputRange, outputRange: [56, 30, -24, 30, 56], extrapolate: "clamp" });
          const scale = scrollY.interpolate({ inputRange, outputRange: [0.66, 0.82, 1.16, 0.82, 0.66], extrapolate: "clamp" });
          const opacity = scrollY.interpolate({ inputRange, outputRange: [0.55, 0.78, 1, 0.78, 0.55], extrapolate: "clamp" });

          const isCenter = i === centerIndex;
          const tint = mod.accent === "love" ? colors.love : accent;

          return (
            <Animated.View key={mod.key} style={{ height: ITEM_HEIGHT, transform: [{ translateX }, { scale }], opacity }}>
              <Pressable
                onPress={() => go(mod.route)}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingRight: 22, gap: 14 }}
              >
                {isCenter ? (
                  <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
                    <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>{mod.label}</Text>
                  </View>
                ) : (
                  <Text style={{ color: colors.inkMuted, fontSize: 16, fontWeight: "600" }}>{mod.label}</Text>
                )}
                <View
                  style={{
                    width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center",
                    backgroundColor: isCenter ? tint + "26" : colors.elevated,
                    borderWidth: isCenter ? 1 : 0, borderColor: tint,
                  }}
                >
                  <AppIcon family={mod.iconFamily} name={mod.iconName} size={24} color={isCenter ? tint : colors.inkMuted} />
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {/* Close button where the "+" sits */}
      <Pressable
        onPress={onClose}
        style={{ position: "absolute", bottom: 28, right: 22, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }}
      >
        <Feather name="x" size={24} color={colors.ink} />
      </Pressable>

      <View style={{ position: "absolute", bottom: 44, left: 24 }}>
        <LuxeLabel size={10} color={colors.inkFaint}>Scroll · Tap to open</LuxeLabel>
      </View>
    </View>
  );
}
