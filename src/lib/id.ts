import * as Crypto from "expo-crypto";

/**
 * Generate a UUID for local-first records. Each record carries a stable id from
 * the moment of creation so it can later be reconciled with a remote row.
 */
export function uuid(): string {
  return Crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
