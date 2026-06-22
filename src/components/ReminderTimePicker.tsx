import React, { useState } from "react";
import { Platform, Pressable, View, Text, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";
import { LuxeLabel } from "./LuxeText";
import { formatTime } from "../lib/date";

interface Props {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  accent?: "gold" | "love";
}

/**
 * Cross-platform date + time chooser for reminders. Android uses the imperative
 * dialogs (date then time); iOS presents an inline spinner in a sheet.
 */
export function ReminderTimePicker({ label, value, onChange, accent }: Props) {
  const globalAccent = useAccent();
  const [iosOpen, setIosOpen] = useState(false);
  const [iosMode, setIosMode] = useState<"date" | "time">("date");
  const tint = (accent ?? globalAccent) === "love" ? colors.love : colors.gold;

  const openAndroid = () => {
    DateTimePickerAndroid.open({
      value,
      mode: "date",
      onChange: (_e, date) => {
        if (!date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: "time",
          is24Hour: false,
          onChange: (_e2, time) => {
            if (!time) return;
            const merged = new Date(date);
            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
            onChange(merged);
          },
        });
      },
    });
  };

  const open = () => {
    if (Platform.OS === "android") openAndroid();
    else { setIosMode("date"); setIosOpen(true); }
  };

  const dateLabel = `${value.toLocaleDateString()} · ${formatTime(value)}`;

  return (
    <View>
      {label ? <LuxeLabel size={11} color={colors.inkMuted} style={{ marginBottom: 6 }}>{label}</LuxeLabel> : null}
      <Pressable
        onPress={open}
        style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: colors.bgDeep, borderRadius: 14,
          borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13,
        }}
      >
        <Text style={{ color: colors.ink, fontSize: 15 }}>{dateLabel}</Text>
        <Feather name="clock" size={18} color={tint} />
      </Pressable>

      {Platform.OS === "ios" && (
        <Modal visible={iosOpen} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
            <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 }}>
              <View className="mb-2 flex-row items-center justify-between">
                <LuxeLabel size={12} color={colors.inkMuted}>{iosMode === "date" ? "Pick date" : "Pick time"}</LuxeLabel>
                <Pressable onPress={() => (iosMode === "date" ? setIosMode("time") : setIosOpen(false))}>
                  <Text style={{ color: tint, fontWeight: "700" }}>{iosMode === "date" ? "Next" : "Done"}</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={value}
                mode={iosMode}
                display="spinner"
                themeVariant="dark"
                onChange={(_e, d) => d && onChange(d)}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
