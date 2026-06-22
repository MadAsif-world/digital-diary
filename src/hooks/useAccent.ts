import { useAppStore } from "../store/app";
import { colors } from "../theme";

export type Accent = "gold" | "love";

/**
 * The user's chosen primary accent (Settings → Appearance). Components read this
 * as their default accent so toggling gold/love re-themes the app. Surfaces that
 * are semantically a specific colour (e.g. the Love Meter, an overdue bill) pass
 * an explicit accent and ignore this.
 */
export function useAccent(): Accent {
  return useAppStore((s) => (s.settings?.themeAccent === "love" ? "love" : "gold"));
}

export function useAccentColor(): string {
  return useAccent() === "love" ? colors.love : colors.gold;
}
