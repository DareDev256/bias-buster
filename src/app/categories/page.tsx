"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/data/curriculum";
import { scenarios } from "@/data/scenarios";
import { useProgress } from "@/hooks/useProgress";

export default function CategoriesPage() {
  const { progress, isLoading, isLevelUnlocked, isCategoryUnlocked } =
    useProgress(categories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-pixel text-xs text-game-primary animate-pulse-neon">
          LOADING...
        </p>
      </main>
    );
  }

  function getCategoryCompletion(categoryId: string): {
    completed: number;
    total: number;
    percent: number;
  } {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !progress) return { completed: 0, total: 0, percent: 0 };
    const total = category.levels.length;
    const completed = category.levels.filter((level) =>
      progress.completedLevels.includes(`${categoryId}-${level.id}`)
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }

  function getScenarioCount(categoryId: string): number {
    return scenarios.filter((s) => s.category === categoryId).length;
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 pt-12 relative">
      {/* Decorative corners */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-game-primary/30" />
      <div className="fixed top-4 right-16 w-8 h-8 border-t-2 border-r-2 border-game-primary/30" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-game-primary/30" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-game-primary/30" />

      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-[6px] tracking-[0.5em] text-game-accent/50 font-pixel mb-3">
          ━━ SCENARIO DOMAINS ━━
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl text-game-accent mb-2">
          CATEGORIES
        </h1>
        <p className="font-pixel text-[7px] text-game-accent/40 max-w-sm">
          Each domain explores a different frontier of AI ethics. Master one to
          unlock the next.
        </p>
      </motion.div>

      {/* Category Grid */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {categories.map((category, ci) => {
          const locked = !isCategoryUnlocked(category.id);
          const { completed, total, percent } =
            getCategoryCompletion(category.id);
          const scenarioCount = getScenarioCount(category.id);
          const isExpanded = expandedCategory === category.id;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * ci, duration: 0.4 }}
              className="flex flex-col"
            >
              {/* Card */}
              <motion.button
                onClick={() =>
                  !locked &&
                  setExpandedCategory(isExpanded ? null : category.id)
                }
                className={`text-left w-full border-2 p-5 transition-colors ${
                  locked
                    ? "border-white/10 opacity-40 cursor-not-allowed"
                    : isExpanded
                      ? "border-game-primary bg-game-primary/5"
                      : "border-white/15 hover:border-game-primary/60"
                }`}
                whileHover={locked ? {} : { scale: 1.02 }}
                whileTap={locked ? {} : { scale: 0.98 }}
                aria-expanded={isExpanded}
                aria-disabled={locked}
              >
                {/* Icon + Lock */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl" role="img" aria-label={category.title}>
                    {locked ? "🔒" : category.icon}
                  </span>
                  {percent === 100 && (
                    <span className="text-[6px] font-pixel text-game-primary tracking-widest">
                      COMPLETE
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-headline text-base sm:text-lg text-game-accent mb-2">
                  {category.title}
                </h2>

                {/* Description */}
                <p className="font-pixel text-[7px] leading-relaxed text-white/60 mb-4">
                  {category.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-[6px] font-pixel text-game-accent/50 mb-3">
                  <span>{total} LEVELS</span>
                  <span className="text-game-accent/20">|</span>
                  <span>{scenarioCount} SCENARIOS</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[3px] bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: "var(--game-primary)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ delay: 0.3 + ci * 0.15, duration: 0.6 }}
                  />
                </div>
                <div className="text-[6px] font-pixel text-game-accent/40 mt-1 text-right">
                  {completed}/{total} — {percent}%
                </div>
              </motion.button>

              {/* Expanded Levels */}
              <AnimatePresence>
                {isExpanded && !locked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-x-2 border-b-2 border-game-primary/30 bg-game-primary/[0.02] p-4 flex flex-col gap-2">
                      {category.levels.map((level, li) => {
                        const levelUnlocked = isLevelUnlocked(
                          category.id,
                          level.id
                        );
                        const levelComplete =
                          progress?.completedLevels.includes(
                            `${category.id}-${level.id}`
                          ) ?? false;

                        return (
                          <motion.div
                            key={level.id}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 * li }}
                          >
                            {levelUnlocked ? (
                              <a
                                href={`/play?category=${category.id}&level=${level.id}`}
                                className={`flex items-center justify-between py-2 px-3 border transition-colors ${
                                  levelComplete
                                    ? "border-game-primary/30 bg-game-primary/10"
                                    : "border-white/10 hover:border-game-primary/40 hover:bg-game-primary/5"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className="text-[6px] font-pixel w-5 text-center"
                                    style={{
                                      color: levelComplete
                                        ? "var(--game-primary)"
                                        : "var(--game-accent)",
                                    }}
                                  >
                                    {levelComplete ? "✓" : level.id}
                                  </span>
                                  <div>
                                    <div className="text-[8px] font-pixel text-white/80">
                                      {level.name}
                                    </div>
                                    <div className="text-[6px] font-pixel text-game-accent/40">
                                      {level.items.length}{" "}
                                      {level.items.length === 1
                                        ? "scenario"
                                        : "scenarios"}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[6px] font-pixel text-game-primary/60">
                                  PLAY →
                                </span>
                              </a>
                            ) : (
                              <div className="flex items-center justify-between py-2 px-3 border border-white/5 opacity-40">
                                <div className="flex items-center gap-3">
                                  <span className="text-[6px] font-pixel w-5 text-center text-game-accent/40">
                                    🔒
                                  </span>
                                  <div>
                                    <div className="text-[8px] font-pixel text-white/50">
                                      {level.name}
                                    </div>
                                    <div className="text-[6px] font-pixel text-game-accent/30">
                                      {level.requiredXp} XP required
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Back link */}
      <motion.a
        href="/"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[7px] font-pixel text-game-accent/30 hover:text-game-accent/60 transition-colors"
      >
        ← BACK TO MENU
      </motion.a>

      <motion.p
        className="font-pixel text-[8px] text-game-primary/40 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        PASSIONATE LEARNING by DAREDEV256
      </motion.p>
    </main>
  );
}
