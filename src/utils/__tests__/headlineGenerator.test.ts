import { describe, it, expect } from "vitest";
import { generateHeadline } from "../headlineGenerator";
import type { CaseOutcome, ImpactRipple } from "@/types/game";

function ripple(overrides: Partial<ImpactRipple> = {}): ImpactRipple {
  return { sphere: "Public Trust", magnitude: 50, type: "negative", headline: "Test", ...overrides };
}

function outcome(ripples: ImpactRipple[], title = "Test v. State"): CaseOutcome {
  return { title, verdict: "Verdict", ripples, summary: "Summary" };
}

describe("generateHeadline", () => {
  it("produces landmark headline for high-magnitude negative ripples", () => {
    const h = generateHeadline(outcome([ripple({ magnitude: 80 }), ripple({ magnitude: 90 })]));
    expect(h.severity).toBe("landmark");
    expect(h.banner).toContain("SHOCKWAVES");
    expect(h.edition).toContain("SPECIAL EDITION");
  });

  it("produces landmark positive headline when positives dominate", () => {
    const h = generateHeadline(outcome([
      ripple({ magnitude: 80, type: "positive" }),
      ripple({ magnitude: 75, type: "positive" }),
    ]));
    expect(h.severity).toBe("landmark");
    expect(h.banner).toContain("BOLSTERS");
  });

  it("produces significant headline for mid-magnitude ripples", () => {
    const h = generateHeadline(outcome([ripple({ magnitude: 50 }), ripple({ magnitude: 45 })]));
    expect(h.severity).toBe("significant");
    expect(h.edition).toBe("EVENING EDITION");
  });

  it("produces routine headline for low-magnitude ripples", () => {
    const h = generateHeadline(outcome([ripple({ magnitude: 20 }), ripple({ magnitude: 30 })]));
    expect(h.severity).toBe("routine");
    expect(h.banner).toContain("MEASURED RULING");
    expect(h.edition).toBe("DAILY BRIEF");
  });

  it("uses dominant sphere (highest magnitude) in banner text", () => {
    const h = generateHeadline(outcome([
      ripple({ sphere: "Civil Liberties", magnitude: 90 }),
      ripple({ sphere: "City Budget", magnitude: 10 }),
    ]));
    expect(h.banner).toContain("CIVIL LIBERTIES");
    expect(h.banner).not.toContain("CITY BUDGET");
  });

  it("breaks ties toward negative ripples for dominant selection", () => {
    const h = generateHeadline(outcome([
      ripple({ sphere: "Privacy", magnitude: 80, type: "positive" }),
      ripple({ sphere: "Economy", magnitude: 80, type: "negative" }),
    ]));
    // Negative should win the tie → "ECONOMY" appears in banner
    expect(h.banner).toContain("ECONOMY");
  });

  it("assigns dateline deterministically from title length", () => {
    const h1 = generateHeadline(outcome([ ripple() ], "Short"));
    const h2 = generateHeadline(outcome([ ripple() ], "Short"));
    expect(h1.dateline).toBe(h2.dateline);
    // Different title length → potentially different dateline
    const h3 = generateHeadline(outcome([ ripple() ], "A Much Longer Title"));
    expect(typeof h3.dateline).toBe("string");
    expect(h3.dateline.length).toBeGreaterThan(0);
  });
});
