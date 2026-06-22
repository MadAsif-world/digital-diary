import type { RepeatRule } from "../db/types";

/**
 * Web no-op implementation of the reminder scheduling abstraction.
 *
 * Metro resolves this file on web (over index.ts), so `expo-notifications` is
 * never imported in the browser — that keeps the console clean and avoids the
 * "push token listener not supported on web" warning. Local notifications are a
 * native-only feature; reminders still persist and display, they just don't fire
 * an OS notification on web.
 */

export async function ensureNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleReminder(_opts: {
  title: string;
  body?: string;
  at: Date;
  repeat?: RepeatRule;
}): Promise<string | null> {
  return null;
}

export async function cancelReminder(_notificationId: string | null): Promise<void> {
  /* no-op on web */
}

export async function cancelAllReminders(): Promise<void> {
  /* no-op on web */
}
