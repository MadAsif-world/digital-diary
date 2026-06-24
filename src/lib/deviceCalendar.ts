import { Platform } from "react-native";
import * as Calendar from "expo-calendar";
import { dayKey } from "./date";

/**
 * Thin wrapper over expo-calendar for reading the phone's calendars (Apple
 * Calendar on iOS, Google/Exchange on Android) into the planner. No backend,
 * no OAuth — it uses whatever calendars the device already syncs. Web has no
 * device calendar, so everything no-ops there.
 */

const SUPPORTED = Platform.OS !== "web";

export type CalPermission = "granted" | "denied" | "undetermined" | "unsupported";

export interface DeviceEvent {
  id: string;
  title: string;
  dayKey: string;
  time: string | null; // HH:mm, null for all-day
}

const pad = (n: number) => String(n).padStart(2, "0");

export async function getCalendarPermission(): Promise<CalPermission> {
  if (!SUPPORTED) return "unsupported";
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status as CalPermission;
  } catch {
    return "unsupported";
  }
}

/** Prompt for calendar access; returns true if granted. */
export async function requestCalendarPermission(): Promise<boolean> {
  if (!SUPPORTED) return false;
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/** Read device events between two day-keys (inclusive). Empty unless granted. */
export async function getDeviceEvents(startKey: string, endKey: string): Promise<DeviceEvent[]> {
  if (!SUPPORTED) return [];
  try {
    if ((await getCalendarPermission()) !== "granted") return [];
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const ids = cals.map((c) => c.id);
    if (!ids.length) return [];
    const start = new Date(`${startKey}T00:00:00`);
    const end = new Date(`${endKey}T23:59:59`);
    const events = await Calendar.getEventsAsync(ids, start, end);
    return events.map((e) => {
      const d = new Date(e.startDate as string);
      return {
        id: e.id,
        title: e.title || "(untitled)",
        dayKey: dayKey(d),
        time: e.allDay ? null : `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      };
    });
  } catch {
    return [];
  }
}
