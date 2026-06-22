import { db } from "./database";
import { uuid, nowIso } from "../lib/id";
import type { SyncBase } from "./types";

const SYNC_FIELDS = [
  "id", "localId", "userId", "createdAt", "updatedAt", "deletedAt", "syncStatus",
] as const;

/**
 * Generic local-first repository. Every table shares the same CRUD shape:
 * inserts stamp the sync envelope, updates bump `updatedAt` and flip clean rows
 * to `pending`, and deletes are soft (tombstone via `deletedAt`).
 *
 * `columns` is the list of model-specific columns (excluding the sync envelope).
 */
export class Repository<T extends SyncBase> {
  constructor(
    private readonly table: string,
    private readonly columns: (keyof T)[],
  ) {}

  private allColumns(): string[] {
    return [...SYNC_FIELDS, ...(this.columns as string[])];
  }

  /** All live (non-deleted) rows, newest first unless an order clause is given. */
  async all(orderBy = "updatedAt DESC"): Promise<T[]> {
    return db().getAllAsync<T>(
      `SELECT * FROM ${this.table} WHERE deletedAt IS NULL ORDER BY ${orderBy}`,
    );
  }

  async where(clause: string, params: SQLParams = [], orderBy = "updatedAt DESC"): Promise<T[]> {
    return db().getAllAsync<T>(
      `SELECT * FROM ${this.table} WHERE deletedAt IS NULL AND ${clause} ORDER BY ${orderBy}`,
      params,
    );
  }

  async first(clause: string, params: SQLParams = []): Promise<T | null> {
    return db().getFirstAsync<T>(
      `SELECT * FROM ${this.table} WHERE deletedAt IS NULL AND ${clause} LIMIT 1`,
      params,
    );
  }

  async byId(id: string): Promise<T | null> {
    return db().getFirstAsync<T>(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
  }

  /** Insert a new row. Caller supplies model fields; sync envelope is generated. */
  async insert(data: Partial<T>): Promise<T> {
    const id = (data.id as string) ?? uuid();
    const ts = nowIso();
    const record = {
      id,
      localId: (data.localId as string) ?? id,
      userId: (data.userId as string | null) ?? null,
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
      syncStatus: "local",
      ...data,
    } as Record<string, unknown>;

    // Only insert columns that were actually provided. Omitting the rest lets
    // SQLite apply each column's DEFAULT instead of forcing NULL into a
    // NOT NULL column.
    const cols = this.allColumns().filter((c) => record[c] !== undefined);
    const placeholders = cols.map(() => "?").join(", ");
    const values = cols.map((c) => normalize(record[c]));
    await db().runAsync(
      `INSERT INTO ${this.table} (${cols.join(", ")}) VALUES (${placeholders})`,
      values as SQLParams,
    );
    return (await this.byId(id))!;
  }

  /** Patch model fields. Bumps updatedAt and marks the row pending if synced. */
  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const keys = Object.keys(patch).filter(
      (k) => k !== "id" && k !== "createdAt" && k !== "localId",
    );
    if (keys.length === 0) return this.byId(id);

    const sets = [...keys.map((k) => `${k} = ?`), "updatedAt = ?",
      "syncStatus = CASE WHEN syncStatus = 'synced' THEN 'pending' ELSE syncStatus END"];
    const values = [
      ...keys.map((k) => normalize((patch as Record<string, unknown>)[k])),
      nowIso(),
      id,
    ];
    await db().runAsync(
      `UPDATE ${this.table} SET ${sets.join(", ")} WHERE id = ?`,
      values as SQLParams,
    );
    return this.byId(id);
  }

  /** Soft delete: tombstone the row so the change can sync later. */
  async remove(id: string): Promise<void> {
    const ts = nowIso();
    await db().runAsync(
      `UPDATE ${this.table} SET deletedAt = ?, updatedAt = ?,
        syncStatus = CASE WHEN syncStatus = 'synced' THEN 'pending' ELSE syncStatus END
       WHERE id = ?`,
      [ts, ts, id],
    );
  }

  /** Find a single row by a unique field, or create it with defaults. */
  async getOrCreate(clause: string, params: SQLParams, defaults: Partial<T>): Promise<T> {
    const existing = await this.first(clause, params);
    if (existing) return existing;
    return this.insert(defaults);
  }
}

export type SQLParams = (string | number | null)[];

/** Coerce JS values to SQLite-bindable primitives. */
function normalize(v: unknown): string | number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}
