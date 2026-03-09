import { UserProgress } from "@/types/game";
import { safeParse, isFiniteNumber } from "./security";
import { clearAnalytics } from "./analytics";

// Re-export extracted modules for backward compatibility
export { sanitize, safeParse, isFiniteNumber } from "./security";
export type { LearningEvent } from "./analytics";
export { recordLearningEvent, getLearningAnalytics } from "./analytics";

// ─── Passionate Learning — Persistence Layer ───
// Pure functions over localStorage. SSR-safe. Merge-on-read for forward compat.
// Security primitives live in ./security.ts. Analytics in ./analytics.ts.

const GAME_ID = "bias_buster"; // OVERRIDE per game
const STORAGE_KEY = `${GAME_ID}_progress`;
const LAST_PLAYED_KEY = `${GAME_ID}_last_played`;
const MASTERY_KEY = `${GAME_ID}_mastery`;
const FSRS_KEY = `${GAME_ID}_fsrs_cards`;

// ─── Schema Validators ───
// Ensure localStorage data matches expected shapes — reject type mismatches.

function validateProgress(raw: unknown): Partial<UserProgress> {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const safe: Partial<UserProgress> = {};

  if (isFiniteNumber(r.xp) && r.xp >= 0) safe.xp = r.xp;
  if (isFiniteNumber(r.level) && r.level >= 1) safe.level = r.level;
  if (typeof r.currentCategory === "string") safe.currentCategory = r.currentCategory;
  if (Array.isArray(r.completedLevels) && r.completedLevels.every((v: unknown) => typeof v === "string")) {
    safe.completedLevels = r.completedLevels as string[];
  }
  if (isFiniteNumber(r.streak) && r.streak >= 0) safe.streak = r.streak;
  if (isFiniteNumber(r.streakFreezes) && r.streakFreezes >= 0) safe.streakFreezes = r.streakFreezes;
  if (r.itemScores && typeof r.itemScores === "object" && !Array.isArray(r.itemScores)) {
    const scores: UserProgress["itemScores"] = {};
    for (const [id, val] of Object.entries(r.itemScores as Record<string, unknown>)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const s = val as Record<string, unknown>;
        if (isFiniteNumber(s.correct) && isFiniteNumber(s.incorrect) && isFiniteNumber(s.lastSeen)) {
          scores[id] = { correct: s.correct, incorrect: s.incorrect, lastSeen: s.lastSeen };
        }
      }
    }
    safe.itemScores = scores;
  }
  return safe;
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  currentCategory: "",
  completedLevels: [],
  streak: 0,
  streakFreezes: 0,
  itemScores: {},
};

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    const raw = safeParse<unknown>(stored, null);
    if (!raw) return defaultProgress;
    const validated = validateProgress(raw);
    return { ...defaultProgress, ...validated };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateProgress(updates: Partial<UserProgress>): UserProgress {
  const current = getProgress();
  const updated = { ...current, ...updates };
  saveProgress(updated);
  return updated;
}

// ─── XP System with Delayed Rewards ───
// 1x on first correct, 2x on 7-day recall, 3x on 30-day recall

export function addXP(amount: number, multiplier = 1): UserProgress {
  const current = getProgress();
  const newXP = current.xp + Math.round(amount * multiplier);
  const newLevel = Math.floor(newXP / 100) + 1;
  return updateProgress({ xp: newXP, level: newLevel });
}

export function getRecallMultiplier(itemId: string): number {
  const current = getProgress();
  const score = current.itemScores[itemId];
  if (!score || score.correct === 0) return 1; // First time
  const daysSinceLastSeen = (Date.now() - score.lastSeen) / (1000 * 60 * 60 * 24);
  if (daysSinceLastSeen >= 30) return 3;  // 30-day recall = 3x XP
  if (daysSinceLastSeen >= 7) return 2;   // 7-day recall = 2x XP
  return 1;
}

export function completeLevel(categoryId: string, levelId: number): UserProgress {
  const current = getProgress();
  const levelKey = `${categoryId}-${levelId}`;
  if (!current.completedLevels.includes(levelKey)) {
    // Award streak freeze every 10 levels
    const newCompleted = [...current.completedLevels, levelKey];
    const earnedFreeze = newCompleted.length % 10 === 0;
    return updateProgress({
      completedLevels: newCompleted,
      streakFreezes: current.streakFreezes + (earnedFreeze ? 1 : 0),
    });
  }
  return current;
}

export function updateItemScore(itemId: string, isCorrect: boolean): UserProgress {
  const current = getProgress();
  const existing = current.itemScores[itemId] || {
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
  };
  return updateProgress({
    itemScores: {
      ...current.itemScores,
      [itemId]: {
        correct: existing.correct + (isCorrect ? 1 : 0),
        incorrect: existing.incorrect + (isCorrect ? 0 : 1),
        lastSeen: Date.now(),
      },
    },
  });
}

// ─── FSRS-4.5 Spaced Repetition ───
// Uses ts-fsrs for research-grade scheduling.
// Cards stored in localStorage, keyed by item ID.
// Each card tracks: difficulty, stability, retrievability, due date.
// Passion Agent will integrate ts-fsrs during build.
// This is the localStorage bridge for FSRS card state.

export interface FSRSCard {
  itemId: string;
  due: number;         // timestamp when review is due
  stability: number;   // memory stability
  difficulty: number;  // item difficulty (0-1)
  reps: number;        // number of reviews
  lapses: number;      // number of times forgotten
  lastReview: number;  // timestamp of last review
}

export function getFSRSCards(): FSRSCard[] {
  if (typeof window === "undefined") return [];
  const cards = safeParse<unknown[]>(localStorage.getItem(FSRS_KEY), []);
  if (!Array.isArray(cards)) return [];
  return cards.filter((c): c is FSRSCard =>
    !!c && typeof c === "object" &&
    typeof (c as FSRSCard).itemId === "string" &&
    isFiniteNumber((c as FSRSCard).due)
  );
}

export function saveFSRSCard(card: FSRSCard): void {
  if (typeof window === "undefined") return;
  const cards = getFSRSCards();
  const idx = cards.findIndex((c) => c.itemId === card.itemId);
  if (idx >= 0) {
    cards[idx] = card;
  } else {
    cards.push(card);
  }
  localStorage.setItem(FSRS_KEY, JSON.stringify(cards));
}

export function getDueItems(limit = 5): string[] {
  const now = Date.now();
  return getFSRSCards()
    .filter((card) => card.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, limit)
    .map((card) => card.itemId);
}

// Fallback review queue (for before FSRS is fully integrated)
export function getItemsForReview(limit = 5): string[] {
  // Prefer FSRS-scheduled items
  const fsrsDue = getDueItems(limit);
  if (fsrsDue.length > 0) return fsrsDue;

  // Fallback: naive incorrect > correct sorting
  const current = getProgress();
  return Object.entries(current.itemScores)
    .filter(([, score]) => score.incorrect > score.correct)
    .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
    .slice(0, limit)
    .map(([id]) => id);
}

// ─── Streak System with Freeze ───

export function updateStreak(): UserProgress {
  if (typeof window === "undefined") return getProgress();
  const current = getProgress();
  const lastPlayed = localStorage.getItem(LAST_PLAYED_KEY);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let newStreak = current.streak;
  let freezesUsed = 0;

  if (lastPlayed === yesterday) {
    newStreak = current.streak + 1;
  } else if (lastPlayed !== today) {
    // Missed a day — try to use a streak freeze
    if (current.streakFreezes > 0) {
      freezesUsed = 1;
      // Streak preserved, but no increment
    } else {
      newStreak = 1; // Reset
    }
  }

  localStorage.setItem(LAST_PLAYED_KEY, today);
  return updateProgress({
    streak: newStreak,
    streakFreezes: current.streakFreezes - freezesUsed,
  });
}

// ─── Mastery Gate (Kumon-style) ───
// 90% accuracy on last 3 attempts to unlock next level

interface MasteryAttempt {
  accuracy: number;
  timestamp: number;
}

export function recordMasteryAttempt(levelKey: string, accuracy: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = safeParse<Record<string, unknown>>(localStorage.getItem(MASTERY_KEY), {});
    const data: Record<string, MasteryAttempt[]> = {};
    // Re-validate each entry on read
    for (const [key, val] of Object.entries(raw)) {
      if (Array.isArray(val)) {
        data[key] = val.filter((a): a is MasteryAttempt =>
          !!a && typeof a === "object" && isFiniteNumber((a as MasteryAttempt).accuracy) && isFiniteNumber((a as MasteryAttempt).timestamp)
        );
      }
    }
    const attempts = data[levelKey] || [];
    attempts.push({ accuracy, timestamp: Date.now() });
    data[levelKey] = attempts.slice(-5);
    localStorage.setItem(MASTERY_KEY, JSON.stringify(data));
  } catch {
    // Silently fail on storage errors
  }
}

export function checkMastery(levelKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = safeParse<Record<string, unknown>>(localStorage.getItem(MASTERY_KEY), {});
    const attempts = raw[levelKey];
    if (!Array.isArray(attempts) || attempts.length < 3) return false;
    const validated = attempts.filter((a): a is MasteryAttempt =>
      !!a && typeof a === "object" && isFiniteNumber((a as MasteryAttempt).accuracy)
    );
    if (validated.length < 3) return false;
    return validated.slice(-3).every((a) => a.accuracy >= 90);
  } catch {
    return false;
  }
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_PLAYED_KEY);
  localStorage.removeItem(MASTERY_KEY);
  localStorage.removeItem(FSRS_KEY);
  clearAnalytics();
}
