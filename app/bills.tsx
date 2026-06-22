import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen, PlannerCard, StatCard, EmptyState, FloatingAddButton } from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { DateField } from "../src/components/DateField";
import { useBillStore, billTotals } from "../src/store/bills";
import { dayKey, parseDayKey, formatCurrency } from "../src/lib/date";
import { useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";
import type { Bill } from "../src/db/types";

export default function BillsScreen() {
  const bills = useBillStore((s) => s.bills);
  const load = useBillStore((s) => s.load);
  const add = useBillStore((s) => s.add);
  const update = useBillStore((s) => s.update);
  const togglePaid = useBillStore((s) => s.togglePaid);
  const remove = useBillStore((s) => s.remove);

  const [composing, setComposing] = useState(false);
  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => billTotals(bills), [bills]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen title="Bills & Payments" subtitle="Due dates and balances" contentPadBottom={120}>
        <View className="flex-row" style={{ gap: 12, marginBottom: 16 }}>
          <StatCard label="Due" value={formatCurrency(totals.dueAmount)} icon="dollar-sign" />
          <StatCard label="Unpaid" value={totals.unpaidCount} icon="file-text" />
          <StatCard label="Overdue" value={totals.overdueCount} icon="alert-circle" accent={totals.overdueCount > 0 ? "love" : "gold"} />
        </View>

        {composing && (
          <ComposeBill onCancel={() => setComposing(false)} onSubmit={async (v) => { await add(v); setComposing(false); }} />
        )}

        {bills.length === 0 && !composing ? (
          <PlannerCard>
            <EmptyState icon="credit-card" title="No bills tracked" hint="Tap + to add a bill and never miss a due date." />
          </PlannerCard>
        ) : (
          <View style={{ gap: 10 }}>
            {bills.map((b) => (
              <BillItem key={b.id} bill={b} onTogglePaid={() => togglePaid(b.id)} onUpdate={(p) => update(b.id, p)} onDelete={() => remove(b.id)} />
            ))}
          </View>
        )}
      </Screen>
      {!composing && <FloatingAddButton onPress={() => setComposing(true)} />}
    </View>
  );
}

function ComposeBill({ onCancel, onSubmit }: {
  onCancel: () => void;
  onSubmit: (v: { name: string; amount: number; dueDate: string; category: string; notes: string }) => void;
}) {
  const accent = useAccentColor();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState(dayKey());
  const [category, setCategory] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), amount: parseFloat(amount) || 0, dueDate: due, category: category.trim() || "General", notes: "" });
  };

  return (
    <PlannerCard elevated accent="gold" style={{ marginBottom: 16 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <LuxeLabel size={12} color={accent}>New Bill</LuxeLabel>
        <Pressable onPress={onCancel} hitSlop={8}><Feather name="x" size={20} color={colors.inkMuted} /></Pressable>
      </View>
      <Field placeholder="Bill name" value={name} onChangeText={setName} />
      <View className="flex-row" style={{ gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field placeholder="Category" value={category} onChangeText={setCategory} />
        </View>
      </View>
      <View style={{ marginBottom: 14 }}>
        <DateField value={due} onChange={setDue} />
      </View>
      <Pressable onPress={submit} style={{ backgroundColor: accent, borderRadius: 14, paddingVertical: 14, alignItems: "center" }}>
        <LuxeLabel size={12} color={colors.bg}>Add Bill</LuxeLabel>
      </Pressable>
    </PlannerCard>
  );
}

function Field(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.inkFaint}
      style={{
        color: colors.ink, fontSize: 15, backgroundColor: colors.bgDeep,
        borderRadius: 14, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
      }}
    />
  );
}

function BillItem({ bill, onTogglePaid, onUpdate, onDelete }: {
  bill: Bill; onTogglePaid: () => void; onUpdate: (p: Partial<Bill>) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const accent = useAccentColor();
  const overdue = !bill.paid && bill.dueDate < dayKey();
  const due = parseDayKey(bill.dueDate);
  return (
    <PlannerCard accent={overdue ? "love" : "none"}>
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <Pressable onPress={onTogglePaid} hitSlop={8}>
          <View
            className="items-center justify-center"
            style={{
              width: 26, height: 26, borderRadius: 8,
              borderWidth: 1.5, borderColor: bill.paid ? colors.success : colors.border,
              backgroundColor: bill.paid ? colors.success : "transparent",
            }}
          >
            {bill.paid ? <Feather name="check" size={15} color={colors.bg} /> : null}
          </View>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => setExpanded((e) => !e)}>
          <Text style={{ color: bill.paid ? colors.inkFaint : colors.ink, fontSize: 15, fontWeight: "600" }}>{bill.name}</Text>
          <Text style={{ color: overdue ? colors.love : colors.inkMuted, fontSize: 12, marginTop: 2 }}>
            {bill.category} · due {due.getMonth() + 1}/{due.getDate()}{overdue ? " · overdue" : ""}
          </Text>
        </Pressable>
        <Text style={{ color: accent, fontSize: 16, fontWeight: "700" }}>{formatCurrency(bill.amount)}</Text>
        <Pressable onPress={onDelete} hitSlop={6} style={{ marginLeft: 8 }}>
          <Feather name="trash-2" size={17} color={colors.inkFaint} />
        </Pressable>
      </View>
      {expanded && (
        <View style={{ marginTop: 12, gap: 10 }}>
          <DateField value={bill.dueDate} onChange={(d) => onUpdate({ dueDate: d })} />
          <TextInput
            defaultValue={bill.notes}
            onEndEditing={(e) => onUpdate({ notes: e.nativeEvent.text })}
            placeholder="Notes…"
            placeholderTextColor={colors.inkFaint}
            multiline
            style={{ color: colors.ink, fontSize: 14, backgroundColor: colors.bgDeep, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, minHeight: 60, textAlignVertical: "top" }}
          />
        </View>
      )}
    </PlannerCard>
  );
}
