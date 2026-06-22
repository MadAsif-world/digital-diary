import React, { useState } from "react";
import { Platform, Pressable, Text, View, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { colors } from "../theme";
import { dayKey, parseDayKey, formatLongDate } from "../lib/date";

interface Props {
  value: string | null; // dayKey
  onChange: (dayKey: string) => void;
  placeholder?: string;
  accent?: "gold" | "love";
  compact?: boolean;
}

/** Date-only chooser that emits a YYYY-MM-DD day key. */
export function DateField({ value, onChange, placeholder = "Set date", accent = "gold", compact }: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const tint = accent === "love" ? colors.love : colors.gold;
  const current = value ? parseDayKey(value) : new Date();

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current, mode: "date",
        onChange: (_e, d) => d && onChange(dayKey(d)),
      });
    } else setIosOpen(true);
  };

  const label = value ? (compact ? `${parseDayKey(value).getMonth() + 1}/${parseDayKey(value).getDate()}` : formatLongDate(value)) : placeholder;

  return (
    <View>
      <Pressable
        onPress={open}
        style={{
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: colors.bgDeep, borderRadius: compact ? 10 : 14,
          borderWidth: 1, borderColor: colors.border,
          paddingHorizontal: compact ? 10 : 14, paddingVertical: compact ? 7 : 13,
        }}
      >
        <Feather name="calendar" size={compact ? 13 : 16} color={value ? tint : colors.inkFaint} />
        <Text style={{ color: value ? colors.ink : colors.inkFaint, fontSize: compact ? 12 : 14 }}>{label}</Text>
      </Pressable>

      {Platform.OS === "ios" && (
        <Modal visible={iosOpen} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
            <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 }}>
              <Pressable onPress={() => setIosOpen(false)} style={{ alignSelf: "flex-end" }}>
                <Text style={{ color: tint, fontWeight: "700" }}>Done</Text>
              </Pressable>
              <DateTimePicker
                value={current}
                mode="date"
                display="spinner"
                themeVariant="dark"
                onChange={(_e, d) => d && onChange(dayKey(d))}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
