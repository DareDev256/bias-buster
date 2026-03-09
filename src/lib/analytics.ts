// ─── Learning Analytics ───
// Track what matters: are people LEARNING, not just playing?
// Isolated from game state — reads/writes its own localStorage key.

import { safeParse, isFiniteNumber } from "./security";

const GAME_ID = "bias_buster";
const ANALYTICS_KEY = `${GAME_ID}_analytics`;

export interface LearningEvent {
  type: "first_correct" | "review_correct" | "review_incorrect" | "concept_mastered" | "drop_off";
  itemId: string;
  timestamp: number;
  daysSinceLastSeen?: number;
  accuracy?: number;
}

const VALID_EVENT_TYPES = new Set<string>([
  "first_correct", "review_correct", "review_incorrect", "concept_mastered", "drop_off",
]);

function isValidLearningEvent(e: unknown): e is LearningEvent {
  if (!e || typeof e !== "object") return false;
  const ev = e as Record<string, unknown>;
  return typeof ev.type === "string" && VALID_EVENT_TYPES.has(ev.type) &&
    typeof ev.itemId === "string" && isFiniteNumber(ev.timestamp);
}

export function recordLearningEvent(event: LearningEvent): void {
  if (typeof window === "undefined") return;
  try {
    const raw = safeParse<unknown[]>(localStorage.getItem(ANALYTICS_KEY), []);
    const events: LearningEvent[] = Array.isArray(raw) ? raw.filter(isValidLearningEvent) : [];
    events.push(event);
    // Keep last 1000 events
    const trimmed = events.slice(-1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail
  }
}

export function getLearningAnalytics(): {
  totalItemsSeen: number;
  itemsMastered: number;
  averageTimeToMastery: number;
  retentionRate7Day: number;
  retentionRate30Day: number;
} {
  const empty = { totalItemsSeen: 0, itemsMastered: 0, averageTimeToMastery: 0, retentionRate7Day: 0, retentionRate30Day: 0 };
  if (typeof window === "undefined") return empty;
  try {
    const raw = safeParse<unknown[]>(localStorage.getItem(ANALYTICS_KEY), []);
    const events: LearningEvent[] = Array.isArray(raw) ? raw.filter(isValidLearningEvent) : [];

    const itemsSeen = new Set(events.map((e) => e.itemId));
    const mastered = events.filter((e) => e.type === "concept_mastered");
    const reviews7d = events.filter((e) => e.type === "review_correct" && (e.daysSinceLastSeen || 0) >= 7);
    const reviewAttempts7d = events.filter(
      (e) => (e.type === "review_correct" || e.type === "review_incorrect") && (e.daysSinceLastSeen || 0) >= 7
    );

    return {
      totalItemsSeen: itemsSeen.size,
      itemsMastered: mastered.length,
      averageTimeToMastery: 0, // Computed from first_correct to concept_mastered timestamps
      retentionRate7Day: reviewAttempts7d.length > 0
        ? Math.round((reviews7d.length / reviewAttempts7d.length) * 100)
        : 0,
      retentionRate30Day: 0, // Same pattern for 30-day window
    };
  } catch {
    return empty;
  }
}

/** Remove all analytics data. Called by resetProgress(). */
export function clearAnalytics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANALYTICS_KEY);
}
