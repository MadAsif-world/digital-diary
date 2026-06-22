import React from "react";
import { View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, DateSwitcher, EditableTextBlock, EmptyState, FloatingAddButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useDayScreen } from "../src/hooks/useDayScreen";
import { useDayStore } from "../src/store/day";
import { useAccent, useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";
import type { Priority } from "../src/db/types";

export default function PrioritiesScreen() {
  const { dayKey, goPrev, goNext, goToday } = useDayScreen();
  const priorities = useDayStore((s) => s.priorities);
  const add = useDayStore((s) => s.addPriority);
  const update = useDayStore((s) => s.updatePriority);
  const toggle = useDayStore((s) => s.togglePriority);
  const remove = useDayStore((s) => s.removePriority);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen
        title="Priorities"
        subtitle="Your top focus for the day"
        right={<DateSwitcher dayKey={dayKey} onPrev={goPrev} onNext={goNext} onToday={goToday} />}
        contentPadBottom={120}
      >
        {priorities.length === 0 ? (
          <PlannerCard>
            <EmptyState icon="target" title="No priorities set" hint="Tap + to add your top three priorities." />
          </PlannerCard>
        ) : (
          <View style={{ gap: 12 }}>
            {priorities.map((p, i) => (
              <PriorityItem
                key={p.id}
                index={i}
                item={p}
                onToggle={() => toggle(p.id)}
                onText={(text) => update(p.id, { text })}
                onNote={(note) => update(p.id, { note })}
                onDelete={() => remove(p.id)}
              />
            ))}
          </View>
        )}
      </Screen>
      <FloatingAddButton onPress={() => add("")} />
    </View>
  );
}

function PriorityItem({
  index, item, onToggle, onText, onNote, onDelete,
}: {
  index: number; item: Priority;
  onToggle: () => void; onText: (t: string) => void; onNote: (t: string) => void; onDelete: () => void;
}) {
  const accent = useAccent();
  const accentC = useAccentColor();
  return (
    <PlannerCard accent={item.done ? "none" : index < 3 ? accent : "none"}>
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <Pressable onPress={onToggle} hitSlop={8}>
          <View
            className="items-center justify-center"
            style={{
              width: 28, height: 28, borderRadius: 8,
              borderWidth: 1.5, borderColor: item.done ? accentC : colors.border,
              backgroundColor: item.done ? accentC : "transparent",
            }}
          >
            {item.done ? <Feather name="check" size={17} color={colors.bg} /> : (
              <LuxeLabel size={11} color={colors.inkMuted}>{index + 1}</LuxeLabel>
            )}
          </View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <EditableTextBlock value={item.text} onSave={onText} placeholder={`Priority ${index + 1}`} />
        </View>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Feather name="trash-2" size={18} color={colors.inkFaint} />
        </Pressable>
      </View>
      <View style={{ marginTop: 10, marginLeft: 40 }}>
        <EditableTextBlock value={item.note} onSave={onNote} placeholder="Add a note…" />
      </View>
    </PlannerCard>
  );
}
