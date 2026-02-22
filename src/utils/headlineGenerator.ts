// ─── Dynamic Headline Generator ───
// Synthesizes ripple data into a front-page banner headline
// with the gravitas of a broadsheet newspaper verdict.

import type { ImpactRipple, CaseOutcome } from "@/types/game";

interface GeneratedHeadline {
  banner: string;      // bold front-page headline
  edition: string;     // edition descriptor (e.g. "EVENING EDITION")
  dateline: string;    // fictional dateline
  severity: "landmark" | "significant" | "routine";
}

const DATELINES = [
  "NEO-TOKYO BUREAU",
  "SILICON VALLEY DESK",
  "FEDERAL AI COURT",
  "ETHICS COMMISSION HQ",
  "ALGORITHMIC REVIEW BOARD",
  "DIGITAL RIGHTS TRIBUNAL",
];

/** Pick the dominant ripple — highest magnitude wins, negative breaks ties */
function dominantRipple(ripples: ImpactRipple[]): ImpactRipple {
  return [...ripples].sort((a, b) => {
    if (b.magnitude !== a.magnitude) return b.magnitude - a.magnitude;
    return a.type === "negative" ? -1 : 1;
  })[0];
}

/** Classify overall severity from combined magnitudes */
function classifySeverity(ripples: ImpactRipple[]): GeneratedHeadline["severity"] {
  const avg = ripples.reduce((s, r) => s + r.magnitude, 0) / ripples.length;
  if (avg >= 70) return "landmark";
  if (avg >= 40) return "significant";
  return "routine";
}

/** Generate a synthesized front-page headline from outcome data */
export function generateHeadline(outcome: CaseOutcome): GeneratedHeadline {
  const lead = dominantRipple(outcome.ripples);
  const severity = classifySeverity(outcome.ripples);
  const negCount = outcome.ripples.filter((r) => r.type === "negative").length;
  const posCount = outcome.ripples.filter((r) => r.type === "positive").length;

  // Build the banner — combine verdict weight with dominant sphere
  let banner: string;
  if (severity === "landmark") {
    banner =
      negCount > posCount
        ? `LANDMARK RULING SENDS SHOCKWAVES THROUGH ${lead.sphere.toUpperCase()}`
        : `HISTORIC VERDICT BOLSTERS ${lead.sphere.toUpperCase()} IN SWEEPING DECISION`;
  } else if (severity === "significant") {
    banner =
      negCount >= posCount
        ? `${lead.sphere.toUpperCase()} FACES SCRUTINY AS RULING DIVIDES EXPERTS`
        : `DECISION BRINGS CAUTIOUS OPTIMISM FOR ${lead.sphere.toUpperCase()}`;
  } else {
    banner = `COURT ISSUES MEASURED RULING ON ${lead.sphere.toUpperCase()} MATTER`;
  }

  const edition =
    severity === "landmark"
      ? "◆ SPECIAL EDITION ◆"
      : severity === "significant"
        ? "EVENING EDITION"
        : "DAILY BRIEF";

  const dateline = DATELINES[Math.abs(outcome.title.length) % DATELINES.length];

  return { banner, edition, dateline, severity };
}
