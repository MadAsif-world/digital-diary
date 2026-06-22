import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { AppIcon } from "../src/components/AppIcon";
import { PLANNER_MODULES } from "../src/constants/modules";
import { colors } from "../src/theme";

/**
 * Full planner menu — every module in one place. This is the phone's gateway to
 * the modules that don't fit in the bottom bar, styled like the reference's
 * vertical module list (icon cell + uppercase label, Love Meter in red).
 */
export default function MenuScreen() {
  const router = useRouter();

  const rows = [
    ...PLANNER_MODULES,
    {
      key: "settings" as const,
      label: "Settings",
      subtitle: "Make Aura yours",
      route: "/settings",
      iconFamily: "feather" as const,
      iconName: "settings",
      accent: "gold" as const,
    },
  ];

  return (
    <Screen title="Planner" subtitle="Every module, one tap away">
      <PlannerCard padded={false}>
        {rows.map((mod, i) => {
          const tint = mod.accent === "love" ? colors.love : colors.gold;
          const last = i === rows.length - 1;
          return (
            <Pressable
              key={mod.key}
              onPress={() => router.push(mod.route as never)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderBottomWidth: last ? 0 : 1,
                borderBottomColor: colors.border,
                backgroundColor: pressed ? colors.elevated : "transparent",
              })}
            >
              <View
                className="items-center justify-center"
                style={{
                  width: 42, height: 42, borderRadius: 12,
                  backgroundColor: colors.bgDeep, borderWidth: 1, borderColor: colors.border,
                }}
              >
                <AppIcon family={mod.iconFamily} name={mod.iconName} size={19} color={tint} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <LuxeLabel size={13} color={mod.accent === "love" ? colors.love : colors.ink}>
                  {mod.label}
                </LuxeLabel>
                <Text style={{ color: colors.inkMuted, fontSize: 12, marginTop: 3 }}>{mod.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.inkFaint} />
            </Pressable>
          );
        })}
      </PlannerCard>
    </Screen>
  );
}
