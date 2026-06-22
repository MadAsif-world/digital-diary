/**
 * Sync architecture (scaffold).
 *
 * The MVP is fully offline. This module defines the seam where a Supabase
 * push/pull will plug in later without touching feature code:
 *
 *   1. Each table already carries (id, localId, userId, createdAt, updatedAt,
 *      deletedAt, syncStatus). Writes mark rows 'local' or 'pending'.
 *   2. pushPending() will batch all rows where syncStatus IN ('local','pending')
 *      and upsert them to Supabase keyed by `id`, then mark them 'synced'.
 *   3. pullSince(lastPulledAt) will fetch remote rows with updatedAt > cursor and
 *      merge with last-write-wins; equal timestamps from different devices flag
 *      'conflict' for manual resolution.
 *
 * None of this runs until auth + a Supabase client are wired in (Phase 4).
 */

export type SyncDirection = "push" | "pull";

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}

export interface SyncEngine {
  isConfigured(): boolean;
  push(): Promise<number>;
  pull(): Promise<{ pulled: number; conflicts: number }>;
  syncAll(): Promise<SyncResult>;
}

/** No-op engine used while the app is offline-only. */
export const offlineSyncEngine: SyncEngine = {
  isConfigured: () => false,
  push: async () => 0,
  pull: async () => ({ pulled: 0, conflicts: 0 }),
  syncAll: async () => ({ pushed: 0, pulled: 0, conflicts: 0 }),
};

/**
 * The active engine. Phase 4 swaps this for a Supabase-backed implementation
 * once credentials and (optional) auth are present.
 */
export let syncEngine: SyncEngine = offlineSyncEngine;

export function setSyncEngine(engine: SyncEngine) {
  syncEngine = engine;
}
