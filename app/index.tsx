import React, { useEffect, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  Screen, PlannerCard, SectionHeader, DateSwitcher, CheckboxRow,
  EditableTextBlock, EmptyState,
} from "../src/components";
import { LuxeLabel } from "../src/components/LuxeText";
import { AppIcon } from "../src/components/AppIcon";
import { useDayScreen } from "../src/hooks/useDayScreen";
import { useAppStore } from "../src/store/app";
import { useDayStore } from "../src/store/day";
import { useTaskStore, todaysTasks } from "../src/store/tasks";
import { useReminderStore, upcomingReminders } from "../src/store/reminders";
import { useBreakpoint } from "../src/lib/responsive";
import { formatLongDate, formatTime, parseDayKey } from "../src/lib/date";
import { PLANNER_MODULES } from "../src/constants/modules";
import { useAccentColor } from "../src/hooks/useAccent";
import { colors } from "../src/theme";

export default function Dashboard() {
  const { dayKey, goPrev, goNext, goToday } = useDayScreen();
  const { gridColumns } = useBreakpoint();
  const router = useRouter();

  const plannerDay = useAppStore((s) => s.plannerDay);
  const saveThought = useAppStore((s) => s.saveThought);

  const priorities = useDayStore((s) => s.priorities);
  const togglePriority = useDayStore((s) => s.togglePriority);
  const health = useDayStore((s) => s.health);
  const meal = useDayStore((s) => s.meal);

  const tasks = useTaskStore((s) => s.tasks);
  const loadTasks = useTaskStore((s) => s.load);
  const toggleTask = useTaskStore((s) => s.toggle);

  const reminders = useReminderStore((s) => s.reminders);
  const loadReminders = useReminderStore((s) => s.load);

  useEffect(() => {
    void loadTasks();
    void loadReminders();
  }, [loadTasks, loadReminders]);

  const dueTasks = useMemo(() => todaysTasks(tasks).slice(0, 4), [tasks]);
  const nextReminders = useMemo(() => upcomingReminders(reminders, 3), [reminders]);
  const topPriorities = priorities.slice(0, 3);

  // Masonry: round-robin the cards into N columns so heights stay balanced.
  const cards: React.ReactNode[] = [
    <DateCard key="date" dayKey={dayKey} />,
    <PriorityCard key="prio" items={topPriorities} onToggle={togglePriority} onOpen={() => router.push("/priorities")} />,
    <ReminderCard key="rem" items={nextReminders} onOpen={() => router.push("/reminders")} />,
    <TodoCard key="todo" items={dueTasks} onToggle={toggleTask} onOpen={() => router.push("/todo")} />,
    <ThoughtCard key="thought" value={plannerDay?.thoughtCapture ?? ""} onSave={saveThought} />,
    <HealthCard key="health" water={health?.waterMl ?? 0} steps={health?.steps ?? 0} sleep={health?.sleepHours ?? 0} mood={health?.mood ?? 3} onOpen={() => router.push("/health")} />,
    <MealCard key="meal" breakfast={meal?.breakfast ?? ""} lunch={meal?.lunch ?? ""} dinner={meal?.dinner ?? ""} onOpen={() => router.push("/meals")} />,
    <ScheduleCard key="sched" dayKey={dayKey} onOpen={() => router.push("/schedule")} />,
    <QuickLinksCard key="links" />,
  ];

  const columns: React.ReactNode[][] = Array.from({ length: gridColumns }, () => []);
  cards.forEach((card, i) => columns[i % gridColumns].push(card));

  return (
    <Screen
      title="Personal Hub"
      subtitle={formatLongDate(dayKey)}
      right={<DateSwitcher dayKey={dayKey} onPrev={goPrev} onNext={goNext} onToday={goToday} />}
    >
      <View style={{ flexDirection: "row", gap: 14 }}>
        {columns.map((col, i) => (
          <View key={i} style={{ flex: 1, gap: 14 }}>
            {col.map((card, j) => (
              <View key={j}>{card}</View>
            ))}
          </View>
        ))}
      </View>
    </Screen>
  );
}

function CardLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Feather name="arrow-up-right" size={16} color={colors.inkMuted} />
    </Pressable>
  );
}

function DateCard({ dayKey }: { dayKey: string }) {
  const d = parseDayKey(dayKey);
  const accent = useAccentColor();
  return (
    <PlannerCard accent="gold">
      <LuxeLabel size={11} color={accent}>Today</LuxeLabel>
      <Text style={{ color: colors.ink, fontSize: 44, fontWeight: "800", marginTop: 6 }}>
        {String(d.getDate()).padStart(2, "0")}
      </Text>
      <Text style={{ color: colors.inkMuted, fontSize: 15 }}>{formatLongDate(dayKey)}</Text>
    </PlannerCard>
  );
}

function PriorityCard({ items, onToggle, onOpen }: { items: any[]; onToggle: (id: string) => void; onOpen: () => void }) {
  return (
    <PlannerCard>
      <SectionHeader title="Today's Priorities" right={<CardLink onPress={onOpen} />} />
      {items.length === 0 ? (
        <EmptyState icon="target" title="No priorities yet" hint="Set your top 3 for the day." />
      ) : (
        items.map((p) => (
          <CheckboxRow key={p.id} checked={!!p.done} label={p.text} onToggle={() => onToggle(p.id)} />
        ))
      )}
    </PlannerCard>
  );
}

function ReminderCard({ items, onOpen }: { items: any[]; onOpen: () => void }) {
  const accent = useAccentColor();
  return (
    <PlannerCard>
      <SectionHeader title="Today's Reminders" right={<CardLink onPress={onOpen} />} />
      {items.length === 0 ? (
        <EmptyState icon="bell" title="Nothing scheduled" hint="Add a reminder to stay on track." />
      ) : (
        items.map((r) => (
          <View key={r.id} className="flex-row items-center py-2">
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: accent, marginRight: 10 }} />
            <Text style={{ color: colors.ink, fontSize: 14, flex: 1 }} numberOfLines={1}>{r.title}</Text>
            <Text style={{ color: colors.inkMuted, fontSize: 12 }}>{formatTime(new Date(r.remindAt))}</Text>
          </View>
        ))
      )}
    </PlannerCard>
  );
}

function TodoCard({ items, onToggle, onOpen }: { items: any[]; onToggle: (id: string) => void; onOpen: () => void }) {
  return (
    <PlannerCard>
      <SectionHeader title="To Do Today" right={<CardLink onPress={onOpen} />} />
      {items.length === 0 ? (
        <EmptyState icon="check-circle" title="All clear" hint="No tasks due today." />
      ) : (
        items.map((t) => (
          <CheckboxRow key={t.id} checked={!!t.done} label={t.title} sublabel={t.category} onToggle={() => onToggle(t.id)} />
        ))
      )}
    </PlannerCard>
  );
}

function ThoughtCard({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  return (
    <PlannerCard>
      <SectionHeader title="Thought Capture" />
      <EditableTextBlock value={value} onSave={onSave} multiline placeholder="A thought, an idea, a reminder to self…" />
    </PlannerCard>
  );
}

function HealthCard({ water, steps, sleep, mood, onOpen }: { water: number; steps: number; sleep: number; mood: number; onOpen: () => void }) {
  const moods = ["😔", "😕", "😐", "🙂", "😄"];
  return (
    <PlannerCard>
      <SectionHeader title="Health & Wellness" right={<CardLink onPress={onOpen} />} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Metric label="Water" value={`${(water / 1000).toFixed(1)}L`} icon="droplet" />
        <Metric label="Steps" value={steps.toLocaleString()} icon="activity" />
        <Metric label="Sleep" value={`${sleep}h`} icon="moon" />
        <Metric label="Mood" value={moods[Math.min(4, Math.max(0, mood - 1))]} icon="smile" isEmoji />
      </View>
    </PlannerCard>
  );
}

function Metric({ label, value, icon, isEmoji }: { label: string; value: string; icon: any; isEmoji?: boolean }) {
  const accent = useAccentColor();
  return (
    // Equal-width columns keep all four metrics on one row at any card width;
    // a fixed lineHeight stops the taller emoji glyph from shoving the row.
    <View style={{ flex: 1, minWidth: 0 }}>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Feather name={icon} size={13} color={accent} />
        <LuxeLabel size={9} color={colors.inkMuted}>{label}</LuxeLabel>
      </View>
      <Text
        numberOfLines={1}
        style={{ color: colors.ink, fontSize: isEmoji ? 20 : 18, fontWeight: "700", marginTop: 4, lineHeight: 24 }}
      >
        {value}
      </Text>
    </View>
  );
}

function MealCard({ breakfast, lunch, dinner, onOpen }: { breakfast: string; lunch: string; dinner: string; onOpen: () => void }) {
  const rows = [
    { label: "Breakfast", value: breakfast },
    { label: "Lunch", value: lunch },
    { label: "Dinner", value: dinner },
  ];
  const empty = !breakfast && !lunch && !dinner;
  return (
    <PlannerCard>
      <SectionHeader title="Meal Plan" right={<CardLink onPress={onOpen} />} />
      {empty ? (
        <EmptyState icon="coffee" title="No meals planned" hint="Plan today's table." />
      ) : (
        rows.map((r) => (
          <View key={r.label} className="flex-row py-1.5">
            <LuxeLabel size={9} color={colors.inkMuted} style={{ width: 78 }}>{r.label}</LuxeLabel>
            <Text style={{ color: colors.ink, fontSize: 13, flex: 1 }} numberOfLines={1}>{r.value || "—"}</Text>
          </View>
        ))
      )}
    </PlannerCard>
  );
}

function ScheduleCard({ dayKey, onOpen }: { dayKey: string; onOpen: () => void }) {
  const d = parseDayKey(dayKey);
  const accent = useAccentColor();
  return (
    <PlannerCard onPress={onOpen}>
      <SectionHeader title="Monthly Schedule" right={<CardLink onPress={onOpen} />} />
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.bgDeep, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
          <Feather name="calendar" size={20} color={accent} />
        </View>
        <View>
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>
            {d.toLocaleString("default", { month: "long" })} {d.getFullYear()}
          </Text>
          <Text style={{ color: colors.inkMuted, fontSize: 12, marginTop: 2 }}>Tap to open the calendar</Text>
        </View>
      </View>
    </PlannerCard>
  );
}

function QuickLinksCard() {
  const router = useRouter();
  const accent = useAccentColor();
  return (
    <PlannerCard>
      <SectionHeader title="Quick Links" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {PLANNER_MODULES.map((mod) => {
          const tint = mod.accent === "love" ? colors.love : accent;
          return (
            <Pressable
              key={mod.key}
              onPress={() => router.push(mod.route as never)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: colors.bgDeep, borderWidth: 1, borderColor: colors.border,
                borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12,
              }}
            >
              <AppIcon family={mod.iconFamily} name={mod.iconName} size={15} color={tint} />
              <LuxeLabel size={10} color={colors.ink}>{mod.label}</LuxeLabel>
            </Pressable>
          );
        })}
      </View>
    </PlannerCard>
  );
}
