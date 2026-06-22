import type { ComponentProps } from "react";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export type IconFamily = "feather" | "mci";

export type ModuleKey =
  | "dashboard"
  | "priorities"
  | "todo"
  | "reminders"
  | "bills"
  | "shopping"
  | "notes"
  | "health"
  | "meals"
  | "love"
  | "schedule";

export type Accent = "gold" | "love" | "ink";

export interface ModuleDef {
  key: ModuleKey;
  title: string;
  /** Short uppercase label used in the luxe nav rail / menu. */
  label: string;
  subtitle: string;
  route: string;
  iconFamily: IconFamily;
  iconName: string;
  accent: Accent;
}

type FeatherName = ComponentProps<typeof Feather>["name"];
type MciName = ComponentProps<typeof MaterialCommunityIcons>["name"];

// Compile-time sanity check that icon names exist in their families.
const f = (n: FeatherName) => n;
const m = (n: MciName) => n;

export const MODULES: ModuleDef[] = [
  {
    key: "dashboard",
    title: "Personal Hub",
    label: "Dashboard",
    subtitle: "Your day at a glance",
    route: "/",
    iconFamily: "feather",
    iconName: f("grid"),
    accent: "gold",
  },
  {
    key: "priorities",
    title: "Priorities",
    label: "Priorities",
    subtitle: "What matters most today",
    route: "/priorities",
    iconFamily: "feather",
    iconName: f("check-square"),
    accent: "gold",
  },
  {
    key: "todo",
    title: "To-Do",
    label: "To-Do",
    subtitle: "Tasks, sorted and done",
    route: "/todo",
    iconFamily: "mci",
    iconName: m("format-list-checks"),
    accent: "gold",
  },
  {
    key: "reminders",
    title: "Reminders",
    label: "Reminders",
    subtitle: "Never miss a beat",
    route: "/reminders",
    iconFamily: "feather",
    iconName: f("bell"),
    accent: "gold",
  },
  {
    key: "bills",
    title: "Bills & Payments",
    label: "Bills",
    subtitle: "Due dates and balances",
    route: "/bills",
    iconFamily: "feather",
    iconName: f("credit-card"),
    accent: "gold",
  },
  {
    key: "shopping",
    title: "Shopping",
    label: "Shopping",
    subtitle: "Lists, categorised",
    route: "/shopping",
    iconFamily: "feather",
    iconName: f("shopping-bag"),
    accent: "gold",
  },
  {
    key: "notes",
    title: "Notes",
    label: "Notes",
    subtitle: "Capture every thought",
    route: "/notes",
    iconFamily: "feather",
    iconName: f("file-text"),
    accent: "gold",
  },
  {
    key: "health",
    title: "Health & Fitness",
    label: "Health",
    subtitle: "Daily wellness tracker",
    route: "/health",
    iconFamily: "feather",
    iconName: f("watch"),
    accent: "gold",
  },
  {
    key: "meals",
    title: "Meal Plan",
    label: "Meals",
    subtitle: "Plan the week's table",
    route: "/meals",
    iconFamily: "mci",
    iconName: m("silverware-fork-knife"),
    accent: "gold",
  },
  {
    key: "love",
    title: "Love Meter",
    label: "Love Meter",
    subtitle: "Reflect and recharge",
    route: "/love",
    iconFamily: "feather",
    iconName: f("heart"),
    accent: "love",
  },
  {
    key: "schedule",
    title: "Monthly Schedule",
    label: "Schedule",
    subtitle: "The month, mapped",
    route: "/schedule",
    iconFamily: "feather",
    iconName: f("calendar"),
    accent: "gold",
  },
];

/** Modules shown in the planner menu / nav rail (everything except dashboard). */
export const PLANNER_MODULES = MODULES.filter((mod) => mod.key !== "dashboard");

export function moduleByKey(key: ModuleKey): ModuleDef {
  return MODULES.find((mod) => mod.key === key)!;
}
