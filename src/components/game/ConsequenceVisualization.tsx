"use client";

import { motion } from "framer-motion";
import type { CaseOutcome, ImpactRipple } from "@/types/game";
import { generateHeadline } from "@/utils/headlineGenerator";

const impactColor = (type: ImpactRipple["type"]) =>
  type === "positive" ? "var(--game-primary)" : type === "negative" ? "var(--game-secondary)" : "var(--game-accent)";

const impactLabel = (type: ImpactRipple["type"]) =>
  type === "positive" ? "FAVORABLE" : type === "negative" ? "ADVERSE" : "MIXED";

function RippleSVG({ ripples }: { ripples: ImpactRipple[] }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-[180px] mx-auto"
      role="img"
      aria-label="Impact ripples radiating from verdict"
    >
      {/* center gavel dot */}
      <circle cx="100" cy="100" r="6" fill="var(--game-accent)" />

      {ripples.map((r, i) => {
        const radius = 30 + i * 22;
        const color = impactColor(r.type);
        return (
          <circle
            key={r.sphere}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={Math.max(1, r.magnitude / 30)}
            opacity={0.7}
            className="ripple-ring"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        );
      })}
    </svg>
  );
}

function Headline({ ripple, index }: { ripple: ImpactRipple; index: number }) {
  const color = impactColor(ripple.type);

  return (
    <motion.article
      initial={{ opacity: 0, x: -20, clipPath: "inset(0 100% 0 0)" }}
      animate={{ opacity: 1, x: 0, clipPath: "inset(0 0% 0 0)" }}
      transition={{ delay: 0.4 + index * 0.3, duration: 0.5, ease: "easeOut" }}
      className="border-b border-b-[var(--game-accent)]/20 pb-3 mb-3 last:border-b-0"
      role="article"
      aria-label={`Impact on ${ripple.sphere}: ${ripple.headline}`}
    >
      {/* sphere tag */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[7px] tracking-widest uppercase font-pixel px-2 py-0.5"
          style={{ color: "var(--game-black)", backgroundColor: color }}
        >
          {ripple.sphere}
        </span>
        <span
          className="text-[6px] tracking-wider font-pixel"
          style={{ color }}
        >
          {impactLabel(ripple.type)}
        </span>
      </div>

      {/* headline text */}
      <p className="text-[9px] leading-relaxed text-white/90 font-pixel">
        {ripple.headline}
      </p>

      {/* impact magnitude bar */}
      <div className="mt-2 h-[3px] w-full bg-white/10 overflow-hidden" role="meter" aria-valuenow={ripple.magnitude} aria-valuemin={0} aria-valuemax={100} aria-label={`${ripple.sphere} impact severity`}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${ripple.magnitude}%` }}
          transition={{ delay: 0.6 + index * 0.3, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.article>
  );
}

export default function ConsequenceVisualization({ outcome }: { outcome: CaseOutcome }) {
  const headline = generateHeadline(outcome);
  const severityAccent =
    headline.severity === "landmark"
      ? "var(--game-secondary)"
      : headline.severity === "significant"
        ? "var(--game-primary)"
        : "var(--game-accent)";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto p-6"
      aria-label="Consequence visualization"
    >
      {/* masthead */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <div className="text-[6px] tracking-[0.4em] text-game-accent/60 font-pixel mb-2 uppercase">
          ━━ Breaking Precedent ━━
        </div>
        <h2 className="text-sm text-game-primary font-pixel neon-glow mb-3 leading-snug">
          {outcome.title}
        </h2>
        <div
          className="inline-block text-[7px] font-pixel px-3 py-1.5 tracking-wider uppercase"
          style={{
            border: "2px solid var(--game-secondary)",
            color: "var(--game-secondary)",
          }}
        >
          {outcome.verdict}
        </div>
      </motion.header>

      {/* ── FRONT PAGE BANNER ── */}
      <motion.div
        initial={{ opacity: 0, rotateX: 90 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        style={{ transformOrigin: "top center", perspective: 600 }}
        className="mb-6"
      >
        <div
          className="front-page-banner text-center py-4 px-3"
          style={{ borderTop: `2px solid ${severityAccent}`, borderBottom: `2px solid ${severityAccent}` }}
          role="banner"
          aria-label={`Front page: ${headline.banner}`}
        >
          <div
            className="text-[5px] tracking-[0.5em] font-pixel mb-2 uppercase"
            style={{ color: severityAccent }}
          >
            {headline.edition} ─ {headline.dateline}
          </div>
          <h3
            className="font-headline text-base sm:text-lg leading-tight tracking-tight"
            style={{ color: "var(--game-accent)" }}
          >
            {headline.banner}
          </h3>
          {headline.severity === "landmark" && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
              className="mt-2 mx-auto h-[2px] w-3/4"
              style={{ backgroundColor: severityAccent }}
            />
          )}
        </div>
      </motion.div>

      {/* ripple visualization */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="mb-6"
      >
        <RippleSVG ripples={outcome.ripples} />
      </motion.div>

      {/* divider */}
      <div className="text-center text-[6px] text-game-accent/40 font-pixel tracking-[0.5em] mb-4">
        IMPACT REPORT
      </div>

      {/* headline cards */}
      <div>
        {outcome.ripples.map((ripple, i) => (
          <Headline key={ripple.sphere} ripple={ripple} index={i} />
        ))}
      </div>

      {/* editorial summary */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + outcome.ripples.length * 0.3, duration: 0.6 }}
        className="mt-5 pt-4 border-t border-t-[var(--game-accent)]/10"
      >
        <p className="text-[8px] leading-relaxed text-game-accent/70 font-pixel italic">
          &ldquo;{outcome.summary}&rdquo;
        </p>
      </motion.footer>
    </motion.section>
  );
}
