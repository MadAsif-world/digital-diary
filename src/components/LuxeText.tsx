import React from "react";
import { Text, TextProps } from "react-native";
import { colors, tracking } from "../theme";

/**
 * The planner's signature label: uppercase, wide letter-spacing. Used for
 * section headers, nav labels, and field captions.
 */
export function LuxeLabel({
  children, color = colors.ink, size = 12, style, ...rest
}: TextProps & { color?: string; size?: number }) {
  return (
    <Text
      {...rest}
      style={[
        {
          color,
          fontSize: size,
          letterSpacing: tracking.luxe,
          fontWeight: "600",
          textTransform: "uppercase",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Title({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[{ color: colors.ink, fontSize: 26, fontWeight: "700" }, style]}>
      {children}
    </Text>
  );
}

export function Muted({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[{ color: colors.inkMuted, fontSize: 14 }, style]}>
      {children}
    </Text>
  );
}
