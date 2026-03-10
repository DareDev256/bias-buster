"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scenarios, type Decision, type BiasScenario } from "@/data/scenarios";
import { ScalesOfImpact } from "@/components/game/ScalesOfImpact";
import { addXP, updateStreak, updateItemScore, recordLearningEvent, recordMasteryAttempt, completeLevel } from "@/lib/storage";
import { categories } from "@/data/curriculum";

type Phase = "scenario" | "consequence" | "lesson" | "summary";

interface PlayedDecision {
  scenario: BiasScenario;
  decision: Decision;
}

const CATEGORY_LABEL: Record<string, string> = {
  hiring: "HIRING & RECRUITMENT",
  "content-moderation": "CONTENT MODERATION",
};

/** Find which category+level a scenario belongs to */
function findLevelForScenario(scenarioId: string): { categoryId: string; levelId: number } | null {
  for (const cat of categories) {
    for (const level of cat.levels) {
      if (level.items.includes(scenarioId)) {
        return { categoryId: cat.id, levelId: level.id };
      }
    }
  }
  return null;
}

export default function PlayPage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [chosen, setChosen] = useState<Decision | null>(null);
  const [showLongTerm, setShowLongTerm] = useState(false);
  const [history, setHistory] = useState<PlayedDecision[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const longTermTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = scenarios[index] as BiasScenario | undefined;
  const isFinished = phase === "summary";

  // Clean up stale timeout on unmount to prevent state updates after teardown
  useEffect(() => {
    return () => {
      if (longTermTimer.current) clearTimeout(longTermTimer.current);
    };
  }, []);

  const choose = useCallback((d: Decision) => {
    // Guard: ignore clicks if already past the scenario phase (prevents double-click race)
    if (phase !== "scenario") return;
    // Clear any lingering timer from a previous scenario
    if (longTermTimer.current) clearTimeout(longTermTimer.current);
    setChosen(d);
    setPhase("consequence");
    setShowLongTerm(false);
    longTermTimer.current = setTimeout(() => setShowLongTerm(true), 2500);
  }, [phase]);

  const toLesson = useCallback(() => {
    setPhase("lesson");
  }, []);

  /** Persist per-scenario progress: item score + analytics + XP */
  const persistScenarioResult = useCallback((scenario: BiasScenario, decision: Decision) => {
    const bestScore = Math.max(...scenario.decisions.map((d) => d.impactScore));
    const isOptimal = decision.impactScore === bestScore;

    updateItemScore(scenario.id, isOptimal);
    recordLearningEvent({
      type: isOptimal ? "first_correct" : "review_incorrect",
      itemId: scenario.id,
      timestamp: Date.now(),
      accuracy: Math.round((decision.impactScore / bestScore) * 100),
    });

    // Award XP proportional to impact score (1-10 mapped to 5-50 XP)
    addXP(decision.impactScore * 5);

    // Mark level complete if this scenario belongs to one
    const levelInfo = findLevelForScenario(scenario.id);
    if (levelInfo) {
      completeLevel(levelInfo.categoryId, levelInfo.levelId);
    }
  }, []);

  /** Persist session-level progress: streak + mastery */
  const persistSessionResult = useCallback((allPlayed: PlayedDecision[]) => {
    updateStreak();

    // Record mastery attempt per category
    const byCategory = new Map<string, { score: number; max: number }>();
    for (const h of allPlayed) {
      const best = Math.max(...h.scenario.decisions.map((d) => d.impactScore));
      const cat = h.scenario.category;
      const existing = byCategory.get(cat) || { score: 0, max: 0 };
      byCategory.set(cat, { score: existing.score + h.decision.impactScore, max: existing.max + best });
    }
    for (const [catId, { score: catScore, max: catMax }] of byCategory) {
      const accuracy = catMax > 0 ? Math.round((catScore / catMax) * 100) : 0;
      const catObj = categories.find((c) => c.id === catId);
      if (catObj) {
        for (const level of catObj.levels) {
          if (allPlayed.some((h) => level.items.includes(h.scenario.id))) {
            recordMasteryAttempt(`${catId}-${level.id}`, accuracy);
          }
        }
      }
    }
  }, []);

  const advance = useCallback(() => {
    if (!chosen || !current) return;
    // Kill any pending long-term timer before transitioning
    if (longTermTimer.current) clearTimeout(longTermTimer.current);
    const played: PlayedDecision = { scenario: current, decision: chosen };

    // Persist this scenario's result immediately
    persistScenarioResult(current, chosen);

    const newHistory = [...history, played];
    setHistory(newHistory);
    setTotalScore((s) => s + chosen.impactScore);
    if (index + 1 >= scenarios.length) {
      persistSessionResult(newHistory);
      setPhase("summary");
    } else {
      setIndex((i) => i + 1);
      setPhase("scenario");
      setChosen(null);
      setShowLongTerm(false);
    }
  }, [chosen, current, index, history, persistScenarioResult, persistSessionResult]);

  // Max possible equity — all scenarios for summary, played scenarios for in-game
  // Guard: Math.max() on empty array returns -Infinity; default to 0 for safety
  const maxPossible = useMemo(
    () => scenarios.reduce((s, sc) => s + (sc.decisions.length > 0 ? Math.max(...sc.decisions.map((d) => d.impactScore)) : 0), 0),
    [],
  );
  // Include the current scenario's max in the denominator so scales aren't stale
  const maxScoreSoFar = useMemo(() => {
    const historyMax = history.reduce((s, h) => s + Math.max(...h.scenario.decisions.map((d) => d.impactScore)), 0);
    const currentMax = current ? Math.max(...current.decisions.map((d) => d.impactScore)) : 0;
    // If we've made a choice for the current scenario, include its max
    return chosen ? historyMax + currentMax : historyMax;
  }, [history, current, chosen]);

  // ── SUMMARY SCREEN ──
  if (isFinished) {
    const pct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <div className="text-[6px] tracking-[0.5em] text-game-accent/50 font-pixel mb-4">━━ FINAL EDITION ━━</div>
          <div className="flex justify-center mb-4">
            <ScalesOfImpact score={totalScore} maxScore={maxPossible} decisionsPlayed={history.length} />
          </div>
          <h1 className="font-headline text-2xl text-game-accent mb-2">SESSION COMPLETE</h1>
          <div className="text-[8px] font-pixel mb-6" style={{ color: pct >= 70 ? "var(--game-primary)" : "var(--game-secondary)" }}>
            EQUITY SCORE: {totalScore}/{maxPossible} ({pct}%)
          </div>
          {history.map((h, i) => (
            <div key={h.scenario.id} className="text-left mb-3 pb-3 border-b border-white/10 last:border-0">
              <div className="text-[6px] font-pixel text-game-accent/40 mb-1">SCENARIO {i + 1}</div>
              <div className="text-[8px] font-pixel text-white/80 mb-1">{h.decision.label}</div>
              <div className="flex items-center gap-2">
                <div className="h-[3px] flex-1 bg-white/10 overflow-hidden">
                  <div className="h-full" style={{ width: `${h.decision.impactScore * 10}%`, backgroundColor: h.decision.impactScore >= 8 ? "var(--game-primary)" : h.decision.impactScore >= 5 ? "var(--game-accent)" : "var(--game-secondary)" }} />
                </div>
                <span className="text-[6px] font-pixel text-game-accent/60">+{h.decision.impactScore}</span>
              </div>
            </div>
          ))}
          <button onClick={() => { if (longTermTimer.current) clearTimeout(longTermTimer.current); setIndex(0); setPhase("scenario"); setChosen(null); setHistory([]); setTotalScore(0); setShowLongTerm(false); }} className="btn-retro text-[8px] text-game-primary border-2 border-game-primary px-6 py-3 mt-6 hover:bg-game-primary/10">
            PLAY AGAIN
          </button>
        </motion.div>
      </main>
    );
  }

  if (!current) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Scales of Impact — always visible during gameplay */}
      <div className="mb-4">
        <ScalesOfImpact score={totalScore + (chosen ? chosen.impactScore : 0)} maxScore={maxScoreSoFar} decisionsPlayed={history.length + (chosen ? 1 : 0)} />
      </div>

      {/* progress pips */}
      <div className="flex gap-2 mb-6" role="progressbar" aria-valuenow={index + 1} aria-valuemax={scenarios.length}>
        {scenarios.map((_, i) => (
          <div key={i} className="w-2 h-2 transition-colors duration-300" style={{ backgroundColor: i < index ? "var(--game-primary)" : i === index ? "var(--game-secondary)" : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── SCENARIO ── */}
        {phase === "scenario" && (
          <motion.div key={`scenario-${index}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md">
            <div className="text-[6px] tracking-[0.4em] text-game-accent/50 font-pixel mb-2 uppercase text-center">
              {CATEGORY_LABEL[current.category] ?? current.category} ─ CASE {index + 1}/{scenarios.length}
            </div>
            <div className="border-t-2 border-b-2 border-game-accent/20 py-5 px-4 mb-6">
              <p className="font-headline text-base sm:text-lg leading-relaxed text-game-accent text-center">{current.prompt}</p>
            </div>
            <div className="flex flex-col gap-3">
              {current.decisions.map((d, di) => (
                <motion.button
                  key={d.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + di * 0.15 }}
                  onClick={() => choose(d)}
                  className="btn-retro text-left text-[8px] sm:text-[9px] leading-relaxed text-white/90 border-2 border-white/15 px-4 py-3 hover:border-game-primary/60 hover:text-game-primary transition-colors focus-visible:outline-2 focus-visible:outline-game-primary"
                  aria-label={`Decision: ${d.label}`}
                >
                  <span className="text-game-accent/40 mr-2">{String.fromCharCode(65 + di)}.</span>
                  {d.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CONSEQUENCE ── */}
        {phase === "consequence" && chosen && (
          <motion.div key={`consequence-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md">
            <div className="text-center mb-4">
              <div className="text-[6px] tracking-[0.5em] font-pixel mb-2 uppercase" style={{ color: "var(--game-secondary)" }}>━━ BREAKING ━━</div>
              <div className="text-[8px] font-pixel text-white/50 mb-4">You chose: {chosen.label}</div>
            </div>
            {/* Immediate */}
            <motion.div initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.6, ease: "easeOut" }} className="border-l-2 border-game-primary pl-4 mb-5">
              <div className="text-[6px] font-pixel text-game-primary tracking-widest mb-1">IMMEDIATE IMPACT</div>
              <p className="text-[9px] font-pixel leading-relaxed text-white/85">{chosen.immediateResult}</p>
            </motion.div>
            {/* Long-term */}
            <AnimatePresence>
              {showLongTerm && (
                <motion.div initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.6, ease: "easeOut" }} className="border-l-2 border-game-secondary pl-4 mb-6">
                  <div className="text-[6px] font-pixel text-game-secondary tracking-widest mb-1">3 MONTHS LATER...</div>
                  <p className="text-[9px] font-pixel leading-relaxed text-white/85">{chosen.longTermResult}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {showLongTerm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
                <button onClick={toLesson} className="btn-retro text-[8px] text-game-accent border-2 border-game-accent/30 px-6 py-3 hover:border-game-primary hover:text-game-primary transition-colors">
                  WHAT DID I LEARN?
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── LESSON ── */}
        {phase === "lesson" && chosen && (
          <motion.div key={`lesson-${index}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center">
            <div className="text-[6px] tracking-[0.5em] text-game-accent/50 font-pixel mb-4">━━ THE TAKEAWAY ━━</div>
            <div className="border-t-2 border-b-2 py-5 px-4 mb-4" style={{ borderColor: chosen.impactScore >= 8 ? "var(--game-primary)" : chosen.impactScore >= 5 ? "var(--game-accent)" : "var(--game-secondary)" }}>
              <p className="font-headline text-sm sm:text-base leading-relaxed text-game-accent italic">&ldquo;{chosen.lesson}&rdquo;</p>
            </div>
            <div className="text-[8px] font-pixel mb-6" style={{ color: chosen.impactScore >= 8 ? "var(--game-primary)" : chosen.impactScore >= 5 ? "var(--game-accent)" : "var(--game-secondary)" }}>
              EQUITY IMPACT: +{chosen.impactScore}
            </div>
            <button onClick={advance} className="btn-retro text-[8px] text-game-primary border-2 border-game-primary px-6 py-3 hover:bg-game-primary/10 transition-colors">
              {index + 1 >= scenarios.length ? "VIEW RESULTS" : "NEXT SCENARIO →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* back to menu */}
      <motion.a href="/" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-[7px] font-pixel text-game-accent/30 mt-8 hover:text-game-accent/60 transition-colors">
        ← BACK TO MENU
      </motion.a>
    </main>
  );
}
