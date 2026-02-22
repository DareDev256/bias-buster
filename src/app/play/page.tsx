"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scenarios, type Decision, type BiasScenario } from "@/data/scenarios";

type Phase = "scenario" | "consequence" | "lesson" | "summary";

interface PlayedDecision {
  scenario: BiasScenario;
  decision: Decision;
}

const CATEGORY_LABEL: Record<string, string> = {
  hiring: "HIRING & RECRUITMENT",
  "content-moderation": "CONTENT MODERATION",
};

export default function PlayPage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [chosen, setChosen] = useState<Decision | null>(null);
  const [showLongTerm, setShowLongTerm] = useState(false);
  const [history, setHistory] = useState<PlayedDecision[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const current = scenarios[index] as BiasScenario | undefined;
  const isFinished = phase === "summary";

  const choose = useCallback((d: Decision) => {
    setChosen(d);
    setPhase("consequence");
    setShowLongTerm(false);
    // Reveal long-term after 2.5s
    setTimeout(() => setShowLongTerm(true), 2500);
  }, []);

  const toLesson = useCallback(() => {
    setPhase("lesson");
  }, []);

  const advance = useCallback(() => {
    if (!chosen || !current) return;
    const played: PlayedDecision = { scenario: current, decision: chosen };
    setHistory((h) => [...h, played]);
    setTotalScore((s) => s + chosen.impactScore);
    if (index + 1 >= scenarios.length) {
      setPhase("summary");
    } else {
      setIndex((i) => i + 1);
      setPhase("scenario");
      setChosen(null);
      setShowLongTerm(false);
    }
  }, [chosen, current, index]);

  // ── SUMMARY SCREEN ──
  if (isFinished) {
    const maxPossible = scenarios.reduce((s, sc) => s + Math.max(...sc.decisions.map((d) => d.impactScore)), 0);
    const pct = Math.round((totalScore / maxPossible) * 100);
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <div className="text-[6px] tracking-[0.5em] text-game-accent/50 font-pixel mb-4">━━ FINAL EDITION ━━</div>
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
          <button onClick={() => { setIndex(0); setPhase("scenario"); setChosen(null); setHistory([]); setTotalScore(0); setShowLongTerm(false); }} className="btn-retro text-[8px] text-game-primary border-2 border-game-primary px-6 py-3 mt-6 hover:bg-game-primary/10">
            PLAY AGAIN
          </button>
        </motion.div>
      </main>
    );
  }

  if (!current) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
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
