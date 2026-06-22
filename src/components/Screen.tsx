import React from "react";
import { View, ScrollView, Text } from "react-native";
import { Title } from "./LuxeText";
import { useBreakpoint } from "../lib/responsive";
import { colors } from "../theme";

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Disable the scrollview (for screens that manage their own list). */
  scroll?: boolean;
  contentPadBottom?: number;
}

/** Consistent screen chrome: padded header + centered, max-width content. */
export function Screen({ title, subtitle, right, children, scroll = true, contentPadBottom = 40 }: Props) {
  const { isTablet } = useBreakpoint();
  const maxWidth = isTablet ? 1100 : undefined;

  // Phone: stack the title above the controls so the title never gets crushed
  // into a narrow column and wraps. Tablet: keep them side by side.
  const header = (
    <View
      className={isTablet ? "flex-row items-end justify-between" : undefined}
      style={{ marginBottom: 20 }}
    >
      <View style={isTablet ? { flex: 1 } : undefined}>
        <Title numberOfLines={1}>{title}</Title>
        {subtitle ? (
          <Text style={{ color: colors.inkMuted, fontSize: 14, marginTop: 4 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={isTablet ? undefined : { marginTop: 14 }}>{right}</View> : null}
    </View>
  );

  const Body = (
    <View style={{ width: "100%", maxWidth, alignSelf: "center", paddingHorizontal: 18, paddingTop: 16 }}>
      {header}
      {children}
    </View>
  );

  if (!scroll) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }}>{Body}</View>;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: contentPadBottom }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {Body}
    </ScrollView>
  );
}
