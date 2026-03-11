import { describe, it, expect } from "vitest";
import { sanitize, safeParse, isFiniteNumber, BANNED_KEYS, MAX_STORAGE_SIZE } from "../security";

describe("sanitize", () => {
  it("strips __proto__ keys from flat objects", () => {
    const poisoned = JSON.parse('{"__proto__":{"admin":true},"name":"safe"}');
    const result = sanitize<Record<string, unknown>>(poisoned);
    expect(result).toEqual({ name: "safe" });
    expect(Object.getPrototypeOf(result)).toBeNull(); // Object.create(null)
  });

  it("strips constructor and prototype keys recursively", () => {
    const nested = JSON.parse(
      '{"data":{"constructor":{"prototype":{"polluted":true}},"value":1}}'
    );
    const result = sanitize<Record<string, unknown>>(nested);
    expect((result as Record<string, Record<string, unknown>>).data).toEqual({ value: 1 });
  });

  it("handles arrays with poisoned elements", () => {
    const arr = [{ safe: 1 }, JSON.parse('{"__proto__":{"x":1},"ok":2}')];
    const result = sanitize<Record<string, unknown>[]>(arr);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ ok: 2 });
  });

  it("passes through primitives unchanged", () => {
    expect(sanitize<number>(42)).toBe(42);
    expect(sanitize<string>("hello")).toBe("hello");
    expect(sanitize<boolean>(true)).toBe(true);
    expect(sanitize<null>(null)).toBeNull();
    expect(sanitize<undefined>(undefined)).toBeUndefined();
  });
});

describe("safeParse", () => {
  it("parses valid JSON and sanitizes", () => {
    const result = safeParse<{ x: number }>('{"x":1}', { x: 0 });
    expect(result).toEqual({ x: 1 });
  });

  it("returns fallback for null input", () => {
    expect(safeParse(null, "default")).toBe("default");
  });

  it("returns fallback for empty string", () => {
    expect(safeParse("", [])).toEqual([]);
  });

  it("returns fallback for malformed JSON", () => {
    expect(safeParse("{broken", 42)).toBe(42);
  });

  it("rejects payloads exceeding MAX_STORAGE_SIZE", () => {
    const bomb = "x".repeat(MAX_STORAGE_SIZE + 1);
    expect(safeParse(bomb, "safe")).toBe("safe");
  });

  it("strips prototype pollution from parsed JSON", () => {
    const result = safeParse<Record<string, unknown>>(
      '{"__proto__":{"admin":true},"legit":1}',
      {}
    );
    expect(result).toEqual({ legit: 1 });
  });
});

describe("isFiniteNumber", () => {
  it("accepts normal numbers", () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-1)).toBe(true);
    expect(isFiniteNumber(3.14)).toBe(true);
  });

  it("rejects NaN, Infinity, -Infinity", () => {
    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber(Infinity)).toBe(false);
    expect(isFiniteNumber(-Infinity)).toBe(false);
  });

  it("rejects non-number types", () => {
    expect(isFiniteNumber("5")).toBe(false);
    expect(isFiniteNumber(null)).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
    expect(isFiniteNumber({})).toBe(false);
  });
});

describe("constants", () => {
  it("BANNED_KEYS covers all pollution vectors", () => {
    expect(BANNED_KEYS.has("__proto__")).toBe(true);
    expect(BANNED_KEYS.has("constructor")).toBe(true);
    expect(BANNED_KEYS.has("prototype")).toBe(true);
    expect(BANNED_KEYS.size).toBe(3);
  });
});
