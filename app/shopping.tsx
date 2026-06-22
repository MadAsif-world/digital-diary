import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, CheckboxRow, EmptyState } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { useShoppingStore } from "../src/store/shopping";
import { formatCurrency } from "../src/lib/date";
import { useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";
import type { ShoppingItem } from "../src/db/types";

export default function ShoppingScreen() {
  const lists = useShoppingStore((s) => s.lists);
  const items = useShoppingStore((s) => s.items);
  const activeListId = useShoppingStore((s) => s.activeListId);
  const load = useShoppingStore((s) => s.load);
  const setActiveList = useShoppingStore((s) => s.setActiveList);
  const addList = useShoppingStore((s) => s.addList);
  const removeList = useShoppingStore((s) => s.removeList);
  const addItem = useShoppingStore((s) => s.addItem);
  const updateItem = useShoppingStore((s) => s.updateItem);
  const toggleItem = useShoppingStore((s) => s.toggleItem);
  const removeItem = useShoppingStore((s) => s.removeItem);

  const [name, setName] = useState("");
  const [newList, setNewList] = useState("");
  const [adding, setAdding] = useState(false);
  const accent = useAccentColor();

  useEffect(() => { void load(); }, [load]);

  const current = activeListId ? items[activeListId] ?? [] : [];
  const estTotal = useMemo(
    () => current.reduce((sum, i) => sum + (i.estPrice ?? 0) * i.quantity, 0),
    [current],
  );

  const submitItem = async () => {
    if (!name.trim() || !activeListId) return;
    await addItem(activeListId, { name: name.trim() });
    setName("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Shopping" subtitle="Lists, categorised" contentPadBottom={24}>
        {!activeListId ? (
          <PlannerCard><EmptyState icon="shopping-bag" title="No list selected" hint="Create a list below to start adding items." /></PlannerCard>
        ) : (
          <>
            {estTotal > 0 && (
              <View className="flex-row items-center justify-between" style={{ marginBottom: 12, paddingHorizontal: 4 }}>
                <LuxeLabel size={10} color={colors.inkMuted}>Estimated total</LuxeLabel>
                <Text style={{ color: accent, fontWeight: "700", fontSize: 15 }}>{formatCurrency(estTotal)}</Text>
              </View>
            )}

            {current.length === 0 ? (
              <PlannerCard><EmptyState icon="check-square" title="List is empty" hint="Add your first item below." /></PlannerCard>
            ) : (
              <PlannerCard>
                {current.map((it, i) => (
                  <ShoppingRow
                    key={it.id}
                    item={it}
                    last={i === current.length - 1}
                    onToggle={() => toggleItem(activeListId, it.id)}
                    onUpdate={(p) => updateItem(activeListId, it.id, p)}
                    onDelete={() => removeItem(activeListId, it.id)}
                  />
                ))}
              </PlannerCard>
            )}
          </>
        )}
      </Screen>

      {/* List selector + add-item docked at the bottom, within thumb reach */}
      <View style={{ backgroundColor: colors.bgDeep, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {lists.map((l) => {
            const active = l.id === activeListId;
            return (
              <Pressable
                key={l.id}
                onPress={() => setActiveList(l.id)}
                onLongPress={() => removeList(l.id)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999,
                  backgroundColor: active ? accent : colors.card,
                  borderWidth: 1, borderColor: active ? accent : colors.border,
                }}
              >
                <LuxeLabel size={10} color={active ? colors.bg : colors.inkMuted}>{l.name}</LuxeLabel>
              </Pressable>
            );
          })}
          {adding ? (
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <TextInput
                value={newList}
                onChangeText={setNewList}
                autoFocus
                placeholder="List name"
                placeholderTextColor={colors.inkFaint}
                onSubmitEditing={async () => { if (newList.trim()) { await addList(newList.trim()); setNewList(""); setAdding(false); } }}
                style={{ color: colors.ink, backgroundColor: colors.card, borderRadius: 999, borderWidth: 1, borderColor: accent, paddingHorizontal: 14, paddingVertical: 8, minWidth: 120 }}
              />
            </View>
          ) : (
            <Pressable onPress={() => setAdding(true)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}>
              <Feather name="plus" size={16} color={accent} />
            </Pressable>
          )}
        </ScrollView>

        {activeListId && (
          <PlannerCard elevated style={{ marginBottom: 0 }}>
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <Feather name="plus-circle" size={22} color={accent} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Add an item…"
                placeholderTextColor={colors.inkFaint}
                style={{ flex: 1, color: colors.ink, fontSize: 15 }}
                onSubmitEditing={submitItem}
                returnKeyType="done"
              />
            </View>
          </PlannerCard>
        )}
      </View>
    </View>
  );
}

function ShoppingRow({ item, last, onToggle, onUpdate, onDelete }: {
  item: ShoppingItem; last: boolean; onToggle: () => void; onUpdate: (p: Partial<ShoppingItem>) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.border }}>
      <CheckboxRow
        checked={!!item.checked}
        label={item.name}
        sublabel={item.quantity > 1 ? `×${item.quantity}${item.category !== "General" ? ` · ${item.category}` : ""}` : (item.category !== "General" ? item.category : undefined)}
        onToggle={onToggle}
        onPressLabel={() => setExpanded((e) => !e)}
        right={
          <View className="flex-row items-center" style={{ gap: 10 }}>
            {item.estPrice ? <Text style={{ color: colors.inkMuted, fontSize: 12 }}>{formatCurrency(item.estPrice)}</Text> : null}
            <Pressable onPress={onDelete} hitSlop={6}><Feather name="x" size={16} color={colors.inkFaint} /></Pressable>
          </View>
        }
      />
      {expanded && (
        <View className="flex-row" style={{ gap: 10, paddingBottom: 12, paddingLeft: 36 }}>
          <Stepper label="Qty" value={item.quantity} onChange={(q) => onUpdate({ quantity: Math.max(1, q) })} />
          <TextInput
            defaultValue={item.category === "General" ? "" : item.category}
            placeholder="Category"
            placeholderTextColor={colors.inkFaint}
            onEndEditing={(e) => onUpdate({ category: e.nativeEvent.text || "General" })}
            style={{ flex: 1, color: colors.ink, fontSize: 13, backgroundColor: colors.bgDeep, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 7 }}
          />
          <TextInput
            defaultValue={item.estPrice ? String(item.estPrice) : ""}
            placeholder="Price"
            placeholderTextColor={colors.inkFaint}
            keyboardType="decimal-pad"
            onEndEditing={(e) => onUpdate({ estPrice: parseFloat(e.nativeEvent.text) || null })}
            style={{ width: 70, color: colors.ink, fontSize: 13, backgroundColor: colors.bgDeep, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 7 }}
          />
        </View>
      )}
    </View>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const accent = useAccentColor();
  return (
    <View className="flex-row items-center" style={{ gap: 8, backgroundColor: colors.bgDeep, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Pressable onPress={() => onChange(value - 1)} hitSlop={6}><Feather name="minus" size={14} color={colors.inkMuted} /></Pressable>
      <Text style={{ color: colors.ink, fontSize: 13, minWidth: 16, textAlign: "center" }}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} hitSlop={6}><Feather name="plus" size={14} color={accent} /></Pressable>
    </View>
  );
}
