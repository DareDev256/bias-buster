"use client";

interface XPBarProps {
  xp: number;
  level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
  // XP needed to reach the *next* level threshold
  const nextLevelXP = level * 100;
  const prevLevelXP = (level - 1) * 100;
  const xpInLevel = xp - prevLevelXP;
  const levelRange = nextLevelXP - prevLevelXP; // always 100 for now, but future-proof
  const pct = Math.min(100, Math.round((xpInLevel / levelRange) * 100));

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-[10px] text-game-accent">
          LVL {level}
        </span>
        <span className="font-pixel text-[10px] text-game-accent">
          {xpInLevel}/{levelRange} XP
        </span>
      </div>
      <div className="h-3 bg-game-dark border border-game-primary/30">
        <div
          className="h-full bg-game-primary xp-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
