// ─── Passionate Learning — Security Primitives ───
// Reusable guards against prototype pollution, schema injection, and storage bombs.
// Zero game-specific logic — safe to share across all Passionate Learning games.

export const BANNED_KEYS = new Set(["__proto__", "constructor", "prototype"]);
export const MAX_STORAGE_SIZE = 512 * 1024; // 512KB per key — prevent localStorage bomb

/** Strip prototype-polluting keys recursively before merging untrusted data. */
export function sanitize<T>(raw: unknown): T {
  if (raw === null || raw === undefined) return raw as T;
  if (typeof raw !== "object") return raw as T;
  if (Array.isArray(raw)) return raw.map((item) => sanitize(item)) as T;
  const clean: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (BANNED_KEYS.has(key)) continue;
    clean[key] = typeof value === "object" ? sanitize(value) : value;
  }
  return clean as T;
}

/** Parse JSON from localStorage with size cap + sanitization. Returns fallback on any failure. */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  if (raw.length > MAX_STORAGE_SIZE) return fallback;
  try {
    return sanitize<T>(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

/** Type guard: finite number (rejects NaN, Infinity, -Infinity). */
export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
