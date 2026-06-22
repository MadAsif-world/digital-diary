import { useEffect } from "react";
import { useAppStore } from "../store/app";
import { useDayStore } from "../store/day";
import { addDays, dayKey } from "../lib/date";

/**
 * Wires a day-scoped screen to the globally-selected planner day. Keeps the
 * day store hydrated whenever the selected day changes, and exposes prev/next/
 * today controls for the DateSwitcher.
 */
export function useDayScreen() {
  const selectedDayKey = useAppStore((s) => s.selectedDayKey);
  const setDay = useAppStore((s) => s.setDay);
  const load = useDayStore((s) => s.load);
  const loadedKey = useDayStore((s) => s.dayKey);

  useEffect(() => {
    if (loadedKey !== selectedDayKey) void load(selectedDayKey);
  }, [selectedDayKey, loadedKey, load]);

  return {
    dayKey: selectedDayKey,
    goPrev: () => setDay(addDays(selectedDayKey, -1)),
    goNext: () => setDay(addDays(selectedDayKey, 1)),
    goToday: () => setDay(dayKey()),
  };
}
