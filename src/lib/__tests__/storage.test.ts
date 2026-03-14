import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage before importing storage module
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};
vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("window", globalThis);

// Configure game ID before importing storage (which triggers config import)
import { configureStorage } from "../game-id";
configureStorage("bias_buster");

// Import after mocking + configuring
import {
  getProgress, saveProgress, addXP, completeLevel,
  updateItemScore, getRecallMultiplier,
  getFSRSCards, saveFSRSCard, getDueItems, getItemsForReview,
  updateStreak, recordMasteryAttempt, checkMastery, resetProgress,
} from "../storage";

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("getProgress / saveProgress", () => {
  it("returns defaults when storage is empty", () => {
    const p = getProgress();
    expect(p).toEqual({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 0, streakFreezes: 0, itemScores: {} });
  });

  it("round-trips valid progress", () => {
    saveProgress({ xp: 250, level: 3, currentCategory: "hiring", completedLevels: ["hiring-1"], streak: 5, streakFreezes: 1, itemScores: {} });
    const p = getProgress();
    expect(p.xp).toBe(250);
    expect(p.level).toBe(3);
    expect(p.completedLevels).toEqual(["hiring-1"]);
  });

  it("rejects corrupted data and returns defaults", () => {
    store["bias_buster_progress"] = '{"xp":"not-a-number","level":-1}';
    const p = getProgress();
    expect(p.xp).toBe(0);     // string rejected
    expect(p.level).toBe(1);   // negative rejected, falls to default
  });

  it("rejects NaN/Infinity in stored data", () => {
    store["bias_buster_progress"] = JSON.stringify({ xp: NaN, streak: Infinity });
    const p = getProgress();
    expect(p.xp).toBe(0);
    expect(p.streak).toBe(0);
  });
});

describe("addXP", () => {
  it("adds XP and calculates level correctly", () => {
    const p = addXP(50);
    expect(p.xp).toBe(50);
    expect(p.level).toBe(1); // 50/100 = level 1
  });

  it("levels up at 100 XP boundaries", () => {
    addXP(100);
    const p = addXP(50);
    expect(p.xp).toBe(150);
    expect(p.level).toBe(2); // floor(150/100) + 1 = 2
  });

  it("applies multiplier correctly", () => {
    const p = addXP(10, 3);
    expect(p.xp).toBe(30);
  });
});

describe("completeLevel", () => {
  it("adds level to completedLevels", () => {
    const p = completeLevel("hiring", 1);
    expect(p.completedLevels).toContain("hiring-1");
  });

  it("does not duplicate completed levels", () => {
    completeLevel("hiring", 1);
    const p = completeLevel("hiring", 1);
    expect(p.completedLevels.filter((l) => l === "hiring-1")).toHaveLength(1);
  });

  it("awards streak freeze every 10 levels", () => {
    for (let i = 1; i <= 10; i++) completeLevel("cat", i);
    const p = getProgress();
    expect(p.streakFreezes).toBe(1);
  });
});

describe("updateItemScore", () => {
  it("creates new score entry for unseen item", () => {
    const p = updateItemScore("hr-001", true);
    expect(p.itemScores["hr-001"].correct).toBe(1);
    expect(p.itemScores["hr-001"].incorrect).toBe(0);
  });

  it("increments correct/incorrect independently", () => {
    updateItemScore("hr-001", true);
    updateItemScore("hr-001", false);
    const p = updateItemScore("hr-001", true);
    expect(p.itemScores["hr-001"].correct).toBe(2);
    expect(p.itemScores["hr-001"].incorrect).toBe(1);
  });
});

describe("getRecallMultiplier", () => {
  it("returns 1x for unseen items", () => {
    expect(getRecallMultiplier("new-item")).toBe(1);
  });

  it("returns 2x for 7-day recall", () => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    saveProgress({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 0, streakFreezes: 0,
      itemScores: { "hr-001": { correct: 1, incorrect: 0, lastSeen: sevenDaysAgo } } });
    expect(getRecallMultiplier("hr-001")).toBe(2);
  });

  it("returns 3x for 30-day recall", () => {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    saveProgress({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 0, streakFreezes: 0,
      itemScores: { "hr-001": { correct: 1, incorrect: 0, lastSeen: thirtyDaysAgo } } });
    expect(getRecallMultiplier("hr-001")).toBe(3);
  });
});

describe("FSRS cards", () => {
  it("stores and retrieves cards", () => {
    saveFSRSCard({ itemId: "test", due: Date.now(), stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: Date.now() });
    expect(getFSRSCards()).toHaveLength(1);
  });

  it("updates existing card by itemId", () => {
    saveFSRSCard({ itemId: "test", due: 1000, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    saveFSRSCard({ itemId: "test", due: 2000, stability: 2, difficulty: 0.3, reps: 2, lapses: 0, lastReview: 1000 });
    const cards = getFSRSCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].due).toBe(2000);
  });

  it("getDueItems returns only past-due items sorted by due date", () => {
    const now = Date.now();
    saveFSRSCard({ itemId: "due", due: now - 1000, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    saveFSRSCard({ itemId: "future", due: now + 99999, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    expect(getDueItems()).toEqual(["due"]);
  });
});

describe("getItemsForReview", () => {
  it("falls back to incorrect-heavy items when no FSRS cards exist", () => {
    saveProgress({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 0, streakFreezes: 0,
      itemScores: {
        "weak": { correct: 1, incorrect: 5, lastSeen: 100 },
        "strong": { correct: 10, incorrect: 0, lastSeen: 200 },
      }
    });
    const review = getItemsForReview();
    expect(review).toContain("weak");
    expect(review).not.toContain("strong");
  });
});

describe("mastery gate", () => {
  it("requires 3 attempts at 90%+ to master", () => {
    recordMasteryAttempt("hiring-1", 95);
    recordMasteryAttempt("hiring-1", 92);
    expect(checkMastery("hiring-1")).toBe(false); // only 2
    recordMasteryAttempt("hiring-1", 91);
    expect(checkMastery("hiring-1")).toBe(true);
  });

  it("fails mastery if any of last 3 below 90%", () => {
    recordMasteryAttempt("hiring-1", 95);
    recordMasteryAttempt("hiring-1", 85); // below threshold
    recordMasteryAttempt("hiring-1", 95);
    expect(checkMastery("hiring-1")).toBe(false);
  });

  it("keeps only last 5 attempts", () => {
    for (let i = 0; i < 7; i++) recordMasteryAttempt("test", 50);
    const raw = JSON.parse(store["bias_buster_mastery"]);
    expect(raw["test"]).toHaveLength(5);
  });
});

describe("streak system", () => {
  it("increments streak when played yesterday", () => {
    saveProgress({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 3, streakFreezes: 0, itemScores: {} });
    store["bias_buster_last_played"] = new Date(Date.now() - 86400000).toDateString();
    const p = updateStreak();
    expect(p.streak).toBe(4);
  });

  it("resets streak after missed day with no freezes", () => {
    saveProgress({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 10, streakFreezes: 0, itemScores: {} });
    store["bias_buster_last_played"] = new Date(Date.now() - 3 * 86400000).toDateString();
    const p = updateStreak();
    expect(p.streak).toBe(1);
  });

  it("uses freeze to preserve streak on missed day", () => {
    saveProgress({ xp: 0, level: 1, currentCategory: "", completedLevels: [], streak: 10, streakFreezes: 2, itemScores: {} });
    store["bias_buster_last_played"] = new Date(Date.now() - 3 * 86400000).toDateString();
    const p = updateStreak();
    expect(p.streak).toBe(10);       // preserved
    expect(p.streakFreezes).toBe(1); // consumed one
  });
});

describe("resetProgress", () => {
  it("clears all storage keys", () => {
    addXP(100);
    recordMasteryAttempt("test", 95);
    resetProgress();
    expect(getProgress().xp).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledTimes(5); // 4 keys + analytics
  });
});
