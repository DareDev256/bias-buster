"use client";

import { useMemo } from "react";

interface ScalesOfImpactProps {
  /** Current cumulative equity score */
  score: number;
  /** Maximum possible score so far (based on scenarios played) */
  maxScore: number;
  /** Number of decisions made */
  decisionsPlayed: number;
}

/**
 * Dynamic scales-of-justice that tilt based on cumulative equity.
 * Teal pan = equitable outcomes, amber pan = adverse outcomes.
 * Balanced at 70%+ equity. Always visible during gameplay.
 */
export function ScalesOfImpact({ score, maxScore, decisionsPlayed }: ScalesOfImpactProps) {
  const { tiltDeg, tealWeight, amberWeight, label } = useMemo(() => {
    if (decisionsPlayed === 0 || maxScore === 0) {
      return { tiltDeg: 0, tealWeight: 0, amberWeight: 0, label: "Balanced" };
    }
    const ratio = score / maxScore;
    // Map ratio to tilt: 1.0 = +12° (teal heavy/down-right), 0.0 = -12° (amber heavy/down-left)
    const deg = (ratio - 0.5) * 24;
    const tW = Math.round(ratio * 100);
    const aW = 100 - tW;
    const lbl = ratio >= 0.7 ? "Equitable" : ratio >= 0.4 ? "Mixed" : "Adverse";
    return { tiltDeg: deg, tealWeight: tW, amberWeight: aW, label: lbl };
  }, [score, maxScore, decisionsPlayed]);

  const labelColor = label === "Equitable"
    ? "var(--game-primary)"
    : label === "Adverse"
      ? "var(--game-secondary)"
      : "var(--game-accent)";

  return (
    <div
      className="flex flex-col items-center select-none"
      role="img"
      aria-label={`Scales of Impact: ${label}. Equity ${tealWeight}%, Adverse ${amberWeight}%`}
    >
      <svg
        viewBox="0 0 120 80"
        className="w-28 sm:w-32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Pillar */}
        <rect x="58" y="30" width="4" height="46" rx="1" fill="var(--game-accent)" opacity="0.25" />
        {/* Base */}
        <rect x="40" y="73" width="40" height="4" rx="2" fill="var(--game-accent)" opacity="0.3" />
        {/* Fulcrum triangle */}
        <polygon points="60,26 55,32 65,32" fill="var(--game-accent)" opacity="0.4" />

        {/* Beam group — rotates around center fulcrum */}
        <g
          style={{
            transformOrigin: "60px 29px",
            transform: `rotate(${tiltDeg}deg)`,
            transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Beam */}
          <rect x="12" y="27" width="96" height="3" rx="1.5" fill="var(--game-accent)" opacity="0.5" />

          {/* Left chain (teal side) */}
          <line x1="20" y1="30" x2="20" y2="46" stroke="var(--game-primary)" strokeWidth="1" opacity="0.5" />
          <line x1="12" y1="30" x2="12" y2="44" stroke="var(--game-primary)" strokeWidth="0.7" opacity="0.3" />
          <line x1="28" y1="30" x2="28" y2="44" stroke="var(--game-primary)" strokeWidth="0.7" opacity="0.3" />

          {/* Left pan (teal) */}
          <path
            d="M6,46 Q6,50 20,50 Q34,50 34,46 Z"
            fill="var(--game-primary)"
            opacity={decisionsPlayed > 0 ? 0.6 : 0.2}
            style={{ transition: "opacity 0.5s ease" }}
          />
          {/* Teal weight indicator */}
          {decisionsPlayed > 0 && (
            <circle
              cx="20"
              cy="47"
              r={Math.max(2, (tealWeight / 100) * 5)}
              fill="var(--game-primary)"
              opacity="0.8"
              style={{ transition: "r 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
          )}

          {/* Right chain (amber side) */}
          <line x1="100" y1="30" x2="100" y2="46" stroke="var(--game-secondary)" strokeWidth="1" opacity="0.5" />
          <line x1="92" y1="30" x2="92" y2="44" stroke="var(--game-secondary)" strokeWidth="0.7" opacity="0.3" />
          <line x1="108" y1="30" x2="108" y2="44" stroke="var(--game-secondary)" strokeWidth="0.7" opacity="0.3" />

          {/* Right pan (amber) */}
          <path
            d="M86,46 Q86,50 100,50 Q114,50 114,46 Z"
            fill="var(--game-secondary)"
            opacity={decisionsPlayed > 0 ? 0.6 : 0.2}
            style={{ transition: "opacity 0.5s ease" }}
          />
          {/* Amber weight indicator */}
          {decisionsPlayed > 0 && (
            <circle
              cx="100"
              cy="47"
              r={Math.max(2, (amberWeight / 100) * 5)}
              fill="var(--game-secondary)"
              opacity="0.8"
              style={{ transition: "r 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
          )}
        </g>

        {/* Labels */}
        <text x="20" y="12" textAnchor="middle" className="text-[5px] font-pixel" fill="var(--game-primary)" opacity="0.6">
          EQUITY
        </text>
        <text x="100" y="12" textAnchor="middle" className="text-[5px] font-pixel" fill="var(--game-secondary)" opacity="0.6">
          IMPACT
        </text>
      </svg>

      {/* Status label */}
      {decisionsPlayed > 0 && (
        <div
          className="text-[6px] font-pixel tracking-[0.3em] mt-1"
          style={{ color: labelColor, transition: "color 0.5s ease" }}
        >
          {label.toUpperCase()}
        </div>
      )}
    </div>
  );
}
