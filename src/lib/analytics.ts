// ─── Learning Analytics ───
// Track what matters: are people LEARNING, not just playing?
// Isolated from game state — reads/writes its own localStorage key.

import "@/lib/config"; // Initialize game ID before any storage access
import { safeParse, isFiniteNumber } from "./security";
import { storageKey } from "./game-id";

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
    const key = storageKey("analytics");
    const raw = safeParse<unknown[]>(localStorage.getItem(key), []);
    const events: LearningEvent[] = Array.isArray(raw) ? raw.filter(isValidLearningEvent) : [];
    events.push(event);
    // Keep last 1000 events
    const trimmed = events.slice(-1000);
    localStorage.setItem(key, JSON.stringify(trimmed));
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
    const raw = safeParse<unknown[]>(localStorage.getItem(storageKey("analytics")), []);
    const events: LearningEvent[] = Array.isArray(raw) ? raw.filter(isValidLearningEvent) : [];

    const itemsSeen = new Set(events.map((e) => e.itemId));
    const mastered = events.filter((e) => e.type === "concept_mastered");

    // ─── Average Time to Mastery ───
    // Pair each item's earliest first_correct with its earliest concept_mastered.
    // Delta (in hours) averaged across all mastered items.
    const firstCorrectMap = new Map<string, number>();
    const masteredMap = new Map<string, number>();
    for (const e of events) {
      if (e.type === "first_correct" && !firstCorrectMap.has(e.itemId)) {
        firstCorrectMap.set(e.itemId, e.timestamp);
      }
      if (e.type === "concept_mastered" && !masteredMap.has(e.itemId)) {
        masteredMap.set(e.itemId, e.timestamp);
      }
    }
    let masterySum = 0;
    let masteryCount = 0;
    for (const [itemId, masteredAt] of masteredMap) {
      const firstAt = firstCorrectMap.get(itemId);
      if (firstAt !== undefined && masteredAt > firstAt) {
        masterySum += (masteredAt - firstAt) / (1000 * 60 * 60); // ms → hours
        masteryCount++;
      }
    }

    // ─── Retention Rates ───
    const reviews7d = events.filter((e) => e.type === "review_correct" && (e.daysSinceLastSeen || 0) >= 7);
    const reviewAttempts7d = events.filter(
      (e) => (e.type === "review_correct" || e.type === "review_incorrect") && (e.daysSinceLastSeen || 0) >= 7
    );
    const reviews30d = events.filter((e) => e.type === "review_correct" && (e.daysSinceLastSeen || 0) >= 30);
    const reviewAttempts30d = events.filter(
      (e) => (e.type === "review_correct" || e.type === "review_incorrect") && (e.daysSinceLastSeen || 0) >= 30
    );

    return {
      totalItemsSeen: itemsSeen.size,
      itemsMastered: mastered.length,
      averageTimeToMastery: masteryCount > 0 ? Math.round(masterySum / masteryCount) : 0,
      retentionRate7Day: reviewAttempts7d.length > 0
        ? Math.round((reviews7d.length / reviewAttempts7d.length) * 100)
        : 0,
      retentionRate30Day: reviewAttempts30d.length > 0
        ? Math.round((reviews30d.length / reviewAttempts30d.length) * 100)
        : 0,
    };
  } catch {
    return empty;
  }
}

/** Remove all analytics data. Called by resetProgress(). */
export function clearAnalytics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey("analytics"));
}
