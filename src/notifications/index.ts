import { Platform } from "react-native";
import Constants from "expo-constants";
import type { RepeatRule } from "../db/types";

/**
 * Reminder scheduling abstraction (native).
 *
 * Two constraints shape this file:
 *  1. `expo-notifications` registers a push-token listener as an import side
 *     effect, which throws in Expo Go on SDK 53+ (push was removed from Expo Go).
 *  2. Local notifications need a real device build to actually fire.
 *
 * So we NEVER import `expo-notifications` at module load. It's lazily required
 * only on a supported runtime (real dev/standalone build, not Expo Go, not web).
 * In Expo Go reminders still save and display — they just don't fire an OS
 * notification. Use a development build for real reminders:
 * https://docs.expo.dev/develop/development-builds/introduction/
 *
 * The interface is transport-agnostic so remote push can slot in later without
 * touching callers.
 */

const isExpoGo = Constants.executionEnvironment === "storeClient";
const SUPPORTED = Platform.OS !== "web" && !isExpoGo;

type NotificationsModule = typeof import("expo-notifications");

let _mod: NotificationsModule | null = null;
let _configured = false;

function getNotifications(): NotificationsModule | null {
  if (!SUPPORTED) return null;
  if (!_mod) {
    // Lazy require: the side-effectful import only runs on supported runtimes.
    _mod = require("expo-notifications") as NotificationsModule;
    if (!_configured) {
      _mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      _configured = true;
    }
  }
  return _mod;
}

let _channelReady = false;

export async function ensureNotificationPermissions(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;

  const current = await N.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const req = await N.requestPermissionsAsync();
    status = req.status;
  }

  if (Platform.OS === "android" && !_channelReady) {
    await N.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: N.AndroidImportance.HIGH,
      lightColor: "#D9C84E",
      vibrationPattern: [0, 250, 250, 250],
    });
    _channelReady = true;
  }
  return status === "granted";
}

function toTrigger(
  N: NotificationsModule,
  at: Date,
  repeat: RepeatRule,
): import("expo-notifications").NotificationTriggerInput {
  switch (repeat) {
    case "daily":
      return {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: at.getHours(),
        minute: at.getMinutes(),
      };
    case "weekly":
      return {
        type: N.SchedulableTriggerInputTypes.WEEKLY,
        weekday: at.getDay() + 1, // expo: 1 (Sun) .. 7 (Sat)
        hour: at.getHours(),
        minute: at.getMinutes(),
      };
    default:
      return { type: N.SchedulableTriggerInputTypes.DATE, date: at };
  }
}

/** Schedule a reminder; returns the platform notification id (store it on the row). */
export async function scheduleReminder(opts: {
  title: string;
  body?: string;
  at: Date;
  repeat?: RepeatRule;
}): Promise<string | null> {
  const N = getNotifications();
  if (!N) return null;

  const granted = await ensureNotificationPermissions();
  if (!granted) return null;
  if ((opts.repeat === "none" || !opts.repeat) && opts.at.getTime() <= Date.now()) {
    return null; // don't schedule the past
  }

  return N.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body: opts.body ?? "",
      sound: true,
      ...(Platform.OS === "android" ? { channelId: "reminders" } : {}),
    },
    trigger: toTrigger(N, opts.at, opts.repeat ?? "none"),
  });
}

export async function cancelReminder(notificationId: string | null): Promise<void> {
  const N = getNotifications();
  if (!N || !notificationId) return;
  try {
    await N.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // already fired / unknown id — safe to ignore
  }
}

export async function cancelAllReminders(): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
}
