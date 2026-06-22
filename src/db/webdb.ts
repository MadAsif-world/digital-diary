/**
 * Web fallback database.
 *
 * `expo-sqlite` has no web implementation, so on web we back the exact same
 * async interface (execAsync / runAsync / getAllAsync / getFirstAsync) with an
 * in-memory store that understands the small, fixed subset of SQL this app
 * issues. Data is mirrored to localStorage so a web preview survives reloads.
 *
 * Native platforms never touch this file — they use real SQLite.
 */

type Row = Record<string, unknown>;
type Tables = Record<string, Row[]>;

const STORAGE_KEY = "aura.webdb.v1";

function pkOf(table: string): string {
  return table === "_meta" ? "key" : "id";
}

export function createWebDatabase() {
  const tables: Tables = load();

  function persist() {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(tables));
    } catch {
      /* storage may be unavailable; preview just won't persist */
    }
  }

  function ensure(table: string) {
    if (!tables[table]) tables[table] = [];
    return tables[table];
  }

  // --- statement handlers ---------------------------------------------------

  function execSchema(sql: string) {
    for (const raw of sql.split(";")) {
      const stmt = raw.trim();
      if (!stmt) continue;
      const create = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      if (create) { ensure(create[1]); continue; }
      const del = stmt.match(/^DELETE FROM (\w+)/i);
      if (del) { tables[del[1]] = []; continue; }
      // PRAGMA / CREATE INDEX / others: no-op in memory
    }
    persist();
  }

  function runInsert(sql: string, params: unknown[]) {
    const m = sql.match(/^INSERT(?: OR REPLACE)? INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.+)\)\s*$/is);
    if (!m) throw new Error("webdb: unsupported INSERT: " + sql);
    const [, table, colList, valList] = m;
    const cols = colList.split(",").map((c) => c.trim());
    const tokens = splitTop(valList);
    let pi = 0;
    const row: Row = {};
    cols.forEach((col, i) => {
      row[col] = literal(tokens[i], () => params[pi++]);
    });
    const arr = ensure(table);
    const pk = pkOf(table);
    const idx = arr.findIndex((r) => r[pk] === row[pk]);
    if (idx >= 0) arr[idx] = row;
    else arr.push(row);
    persist();
  }

  function runUpdate(sql: string, params: unknown[]) {
    const m = sql.match(/^UPDATE (\w+) SET (.+) WHERE (\w+)\s*=\s*\?\s*$/is);
    if (!m) throw new Error("webdb: unsupported UPDATE: " + sql);
    const [, table, setClause, whereCol] = m;
    const assignments = splitTop(setClause).map((a) => a.trim());
    let pi = 0;
    const ops: { col: string; value: (row: Row) => unknown }[] = [];
    for (const a of assignments) {
      const am = a.match(/^(\w+)\s*=\s*(.+)$/is);
      if (!am) continue;
      const col = am[1];
      const expr = am[2].trim();
      if (expr === "?") {
        const p = params[pi++];
        ops.push({ col, value: () => p });
      } else if (/^CASE/i.test(expr)) {
        // CASE WHEN syncStatus = 'synced' THEN 'pending' ELSE syncStatus END
        ops.push({ col, value: (row) => (row.syncStatus === "synced" ? "pending" : row.syncStatus) });
      } else {
        const lit = literal(expr, () => params[pi++]);
        ops.push({ col, value: () => lit });
      }
    }
    const whereVal = params[pi++];
    for (const row of ensure(table)) {
      if (row[whereCol] === whereVal) {
        for (const op of ops) row[op.col] = op.value(row);
      }
    }
    persist();
  }

  function runSelect(sql: string, params: unknown[]): Row[] {
    let s = sql.trim();
    let limit: number | undefined;
    let order: string | undefined;
    let where: string | undefined;

    let m = s.match(/\s+LIMIT\s+(\d+)\s*$/i);
    if (m) { limit = Number(m[1]); s = s.slice(0, m.index); }
    m = s.match(/\s+ORDER BY\s+(.+)$/i);
    if (m) { order = m[1]; s = s.slice(0, m.index); }
    m = s.match(/\s+WHERE\s+(.+)$/i);
    if (m) { where = m[1]; s = s.slice(0, m.index); }
    const head = s.match(/^SELECT\s+.+?\s+FROM\s+(\w+)/i);
    if (!head) throw new Error("webdb: unsupported SELECT: " + sql);
    const table = head[1];

    let rows = ensure(table).slice();
    if (where) {
      let pi = 0;
      const conds = where.split(/\s+AND\s+/i).map((c) => c.trim());
      rows = rows.filter((row) => conds.every((cond) => evalCond(cond, row, () => params[pi++])));
    }
    if (order) rows = sortRows(rows, order);
    if (limit !== undefined) rows = rows.slice(0, limit);
    return rows.map((r) => ({ ...r }));
  }

  // --- public async surface (mirrors SQLiteDatabase) -----------------------

  return {
    async execAsync(sql: string) { execSchema(sql); },
    async runAsync(sql: string, params: unknown[] = []) {
      const t = sql.trim();
      if (/^INSERT/i.test(t)) runInsert(t, params);
      else if (/^UPDATE/i.test(t)) runUpdate(t, params);
      else if (/^DELETE/i.test(t)) { const dm = t.match(/^DELETE FROM (\w+)/i); if (dm) { tables[dm[1]] = []; persist(); } }
      return { changes: 0, lastInsertRowId: 0 };
    },
    async getAllAsync<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
      return runSelect(sql.trim(), params) as T[];
    },
    async getFirstAsync<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
      return (runSelect(sql.trim(), params)[0] as T) ?? null;
    },
  };
}

// --- helpers ---------------------------------------------------------------

function load(): Tables {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Tables;
  } catch {
    /* ignore */
  }
  return {};
}

/** Split a comma list at the top level (ignores commas inside parens). */
function splitTop(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** Resolve a SQL value token: ?, NULL, 'string', or number. */
function literal(token: string, nextParam: () => unknown): unknown {
  const t = token.trim();
  if (t === "?") return nextParam();
  if (/^NULL$/i.test(t)) return null;
  if (/^'.*'$/.test(t)) return t.slice(1, -1).replace(/''/g, "'");
  const n = Number(t);
  return Number.isNaN(n) ? t : n;
}

function evalCond(cond: string, row: Row, nextParam: () => unknown): boolean {
  if (/^1\s*=\s*1$/.test(cond)) return true;
  let m = cond.match(/^(\w+)\s+IS\s+NOT\s+NULL$/i);
  if (m) return row[m[1]] != null;
  m = cond.match(/^(\w+)\s+IS\s+NULL$/i);
  if (m) return row[m[1]] == null;
  m = cond.match(/^(\w+)\s*(=|>=|<=|>|<)\s*(\?|'.*'|\d+(?:\.\d+)?)$/i);
  if (m) {
    const col = m[1];
    const op = m[2];
    const rhs = literal(m[3], nextParam);
    const lhs = row[col];
    switch (op) {
      case "=": return lhs === rhs;
      case ">=": return (lhs as never) >= (rhs as never);
      case "<=": return (lhs as never) <= (rhs as never);
      case ">": return (lhs as never) > (rhs as never);
      case "<": return (lhs as never) < (rhs as never);
    }
  }
  return true;
}

function sortRows(rows: Row[], order: string): Row[] {
  const keys = order.split(",").map((part) => {
    const [col, dir] = part.trim().split(/\s+/);
    return { col, desc: /desc/i.test(dir ?? "") };
  });
  return rows.sort((a, b) => {
    for (const { col, desc } of keys) {
      const av = a[col] as never;
      const bv = b[col] as never;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
    }
    return 0;
  });
}
