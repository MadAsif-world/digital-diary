import React, { useRef, useState } from "react";
import { View, Text, PanResponder, LayoutChangeEvent } from "react-native";
import { LuxeLabel } from "./LuxeText";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";

interface Props {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  unit?: string;
  accent?: "gold" | "love";
  onChange: (value: number) => void;
}

/**
 * Ruler-style slider matching the Health & Fitness page: a tick track with a
 * draggable fill, min/max captions, and a live value chip.
 */
export function ProgressSlider({
  label, value, min = 0, max, step = 1, unit, accent, onChange,
}: Props) {
  const [width, setWidth] = useState(0);
  const globalAccent = useAccent();
  const tint = (accent ?? globalAccent) === "love" ? colors.love : colors.gold;
  const ratio = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;

  const valueFromX = (x: number) => {
    if (width <= 0) return value;
    const r = Math.min(1, Math.max(0, x / width));
    const raw = min + r * (max - min);
    const snapped = Math.round(raw / step) * step;
    return Math.min(max, Math.max(min, snapped));
  };

  // Keep the latest valueFromX in a ref so the (once-created) PanResponder
  // always reads the current track width.
  const valueFromXRef = useRef(valueFromX);
  valueFromXRef.current = valueFromX;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      // Don't let a parent ScrollView steal the gesture mid-drag.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e) => onChange(valueFromXRef.current(e.nativeEvent.locationX)),
      onPanResponderMove: (e) => onChange(valueFromXRef.current(e.nativeEvent.locationX)),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const ticks = Math.min(12, Math.max(4, Math.round((max - min) / step)));

  return (
    <View style={{ marginBottom: 18 }}>
      <View className="mb-2 flex-row items-center justify-between">
        <LuxeLabel size={11} color={colors.inkMuted}>{label}</LuxeLabel>
        <Text style={{ color: tint, fontSize: 13, fontWeight: "700" }}>
          {value}
          {unit ? <Text style={{ color: colors.inkMuted, fontSize: 11 }}> {unit}</Text> : null}
        </Text>
      </View>

      <View {...pan.panHandlers} onLayout={onLayout} style={{ paddingVertical: 10 }}>
        {/* tick marks */}
        <View className="flex-row justify-between" style={{ marginBottom: 6 }}>
          {Array.from({ length: ticks + 1 }).map((_, i) => (
            <View key={i} style={{ width: 1, height: i % 2 === 0 ? 10 : 6, backgroundColor: colors.border }} />
          ))}
        </View>
        {/* track */}
        <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.elevated }}>
          <View style={{ width: `${ratio * 100}%`, height: 4, borderRadius: 2, backgroundColor: tint }} />
          <View
            style={{
              position: "absolute", top: -7, left: `${ratio * 100}%`,
              width: 18, height: 18, borderRadius: 9, marginLeft: -9,
              backgroundColor: colors.bg, borderWidth: 2, borderColor: tint,
            }}
          />
        </View>
        <View className="mt-1.5 flex-row justify-between">
          <Text style={{ color: colors.inkFaint, fontSize: 10 }}>{min}</Text>
          <Text style={{ color: colors.inkFaint, fontSize: 10 }}>{max}{unit ? ` ${unit}` : ""}</Text>
        </View>
      </View>
    </View>
  );
}
