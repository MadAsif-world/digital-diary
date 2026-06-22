import React, { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { LuxeLabel } from "./LuxeText";
import { colors } from "../theme";
import { useAccent } from "../hooks/useAccent";

interface Props {
  label?: string;
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  accent?: "gold" | "love";
  minHeight?: number;
}

/**
 * Inline-editable block that feels like writing directly onto the planner page.
 * Commits on blur and after a short idle debounce so typing always persists.
 */
export function EditableTextBlock({
  label, value, onSave, placeholder, multiline, accent, minHeight,
}: Props) {
  const globalAccent = useAccent();
  accent = accent ?? globalAccent;
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);

  const commit = (next: string) => {
    if (next !== value) onSave(next);
  };

  const onChange = (next: string) => {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), 600);
  };

  const tint = accent === "love" ? colors.love : colors.gold;

  return (
    <View>
      {label ? <LuxeLabel size={11} color={colors.inkMuted} style={{ marginBottom: 6 }}>{label}</LuxeLabel> : null}
      <TextInput
        value={text}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); commit(text); }}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          color: colors.ink,
          fontSize: 15,
          lineHeight: 22,
          backgroundColor: colors.bgDeep,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: focused ? tint : colors.border,
          paddingHorizontal: 14,
          paddingVertical: 12,
          minHeight: minHeight ?? (multiline ? 96 : 48),
        }}
      />
    </View>
  );
}
