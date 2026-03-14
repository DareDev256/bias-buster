# Changelog

## [0.7.0] — 2026-03-14

### Changed
- **Dynamic storage key derivation** — replaced hardcoded `GAME_ID` constants in `storage.ts` and `analytics.ts` with a `configureStorage(id)` API + `storageKey(suffix)` derivation. Each Passionate Learning game now edits a single `src/lib/config.ts` file instead of find-and-replacing constants across modules
- **New module `src/lib/game-id.ts`** — single source of truth for game ID configuration with input validation (lowercase alphanumeric + underscores)
- **New module `src/lib/config.ts`** — one-line game identity file that each template clone edits

### Fixed
- **`averageTimeToMastery` was always 0** — now computes hours between each item's earliest `first_correct` and `concept_mastered` events, averaged across all mastered items
- **`retentionRate30Day` was always 0** — now mirrors the 7-day retention pattern, filtering review events with `daysSinceLastSeen >= 30`

## [0.6.3] — 2026-03-13

### Added
- **Headline Generator deep dive** in README — portfolio-grade documentation of the deterministic 3-step pipeline (`dominantRipple` → `classifySeverity` → banner synthesis), with pipeline diagram, severity tier table, template pattern reference, determinism guarantee explanation, and component integration flow

## [0.6.2] — 2026-03-11

### Added
- **Test infrastructure** — Vitest configured with path aliases, `npm test` and `npm run test:watch` scripts
- **Security tests** (14 tests) — prototype pollution stripping, recursive sanitization, safeParse size cap enforcement, JSON parse fallback, isFiniteNumber edge cases (NaN, Infinity, type coercion)
- **Storage tests** (26 tests) — progress CRUD round-trip, corrupted data rejection (NaN/string/negative values), XP leveling math, recall multiplier tiers (1x/2x/3x at 0/7/30 days), FSRS card upsert + due-date filtering, mastery gate 90% threshold enforcement, streak increment/reset/freeze consumption, level completion deduplication + freeze-every-10 reward, review queue fallback ordering
- **Headline generator tests** (7 tests) — severity classification (landmark/significant/routine), dominant ripple selection with negative tie-breaking, banner text accuracy per severity tier, deterministic dateline assignment

## [0.6.1] — 2026-03-10

### Fixed
- **Double-click race condition on decision buttons** — rapid clicks during the scenario phase could fire `choose()` multiple times, queuing conflicting `setTimeout` timers and corrupting the consequence reveal sequence. Added phase guard to reject clicks outside `"scenario"` state
- **Memory leak from orphaned setTimeout** — the 2.5s long-term consequence timer was never cleared on unmount, advance, or replay, causing stale `setShowLongTerm(true)` calls to fire into unmounted or reset state. Timer is now tracked via ref and cleaned up on every state transition
- **Division by zero on summary screen** — if `scenarios` array were empty (or all scenarios had zero-decision entries), `totalScore / maxPossible` produced `NaN%`. Added zero-guard and `Math.max` empty-array protection
- **XP bar showed 0% at level-up thresholds** — `xp % 100` maps 100→0, 200→0, etc., displaying an empty progress bar at the exact moment a player levels up. Replaced with level-boundary arithmetic so the bar correctly reflects progress within the current level

## [0.6.0] — 2026-03-09

### Changed
- **Extracted `src/lib/security.ts`** from storage monolith — `sanitize()`, `safeParse()`, `isFiniteNumber()`, `BANNED_KEYS`, and `MAX_STORAGE_SIZE` now live in a dedicated security module, reusable across all Passionate Learning games
- **Extracted `src/lib/analytics.ts`** from storage monolith — `LearningEvent`, `recordLearningEvent()`, `getLearningAnalytics()`, and event validation now isolated with their own localStorage key management
- **Slimmed `src/lib/storage.ts`** from 386 → 290 LOC — re-exports extracted modules for full backward compatibility (zero consumer changes needed)
- Removed unused `STREAK_FREEZE_KEY` and `ANALYTICS_KEY` constants from storage.ts (analytics key now managed by its own module)

## [0.5.2] — 2026-03-08

### Security
- **Prototype pollution guard on localStorage reads** — all `JSON.parse` calls in `storage.ts` now route through `safeParse()` which strips `__proto__`, `constructor`, and `prototype` keys recursively before merging, preventing injected localStorage payloads from polluting `Object.prototype`
- **Schema validation on deserialized data** — `getProgress()`, `getFSRSCards()`, `checkMastery()`, `recordMasteryAttempt()`, `recordLearningEvent()`, and `getLearningAnalytics()` now validate property types and shapes against expected schemas, rejecting malformed data instead of blindly spreading it
- **Storage size limit** — 512KB cap per localStorage key prevents storage-bomb DoS via tampered keys
- **Security headers via `next.config.ts`** — added Content-Security-Policy (allowlisting self + Google Fonts only), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (camera/mic/geo disabled), and X-XSS-Protection

## [0.5.1] — 2026-03-07

### Fixed
- **Play page now persists progress to localStorage** — gameplay was completely disconnected from the XP, streak, mastery, and analytics systems. Decisions now record item scores, award XP (5-50 per scenario based on impact), mark curriculum levels as complete, update daily streaks, and record mastery attempts per category
- **Scales of Impact stale data on first decision** — scales showed 0/0 during consequence and lesson phases because `maxScoreSoFar` only included completed history entries. Now includes the current scenario's max score and the current decision's impact score immediately after choosing, so the scales animate on the first decision
- **React 19 ref-during-render violation** — moved session persistence logic out of render phase into the `advance` callback to comply with React 19's stricter ref access rules

## [0.5.0] — 2026-03-06

### Added
- **Scales of Impact** component (`src/components/game/ScalesOfImpact.tsx`) — dynamic SVG scales-of-justice that tilt based on cumulative equity score, with teal (equity) and amber (adverse) pans, weight-proportional indicator circles, spring-physics CSS transitions, and ARIA accessibility
- Scales integrated into play page during active gameplay and on summary screen
- `maxPossible` and `maxScoreSoFar` memoized computations for efficient score tracking

## [0.4.0] — 2026-02-21

### Added
- **Playable scenario engine** (`src/app/play/page.tsx`) — end-to-end game flow with 3-phase decision reveal (scenario → consequence → lesson), progress pips, equity scoring, and session summary screen
- **5 starter scenarios** (`src/data/scenarios.ts`) — 3 Hiring & Recruitment scenarios (resume screening bias, video interview analysis, salary negotiation gender bias) + 2 Content Moderation scenarios (racial bias in toxicity detection, government criticism censorship)
- `BiasScenario` and `Decision` types for scenario data modeling
- Broadsheet-style consequence animations using `clipPath` horizontal unroll
- Delayed long-term consequence reveal (2.5s after immediate impact) for temporal weight
- Session summary with per-scenario equity impact bars and play-again loop

## [0.3.0] — 2026-02-21

### Added
- **Dynamic front-page headline generator** (`src/utils/headlineGenerator.ts`) — deterministic algorithm that analyzes ripple severity, dominant sphere, and outcome polarity to craft broadsheet-style banner headlines with edition tags and fictional datelines
- **Front-Page Banner UI** — Verdict Scroll unfurl animation (rotateX reveal) in Consequence Visualization, with severity-coded accent colors (amber for landmark, teal for significant, silver for routine)
- **Playfair Display serif font** — loaded via `next/font/google` as CSS variable `--font-playfair`, providing authoritative newspaper masthead typography contrasting the pixel UI
- `.font-headline` CSS class and `.front-page-banner` styling for broadsheet aesthetic

## [0.2.3] — 2026-02-21

### Added
- **Agentic AI Cyber Warfare research doc** (`docs/research-agentic-ai-cyber-warfare.md`) — analysis of the September 2025 AI-orchestrated cyber espionage campaign (80–90% autonomous, ~30 targets) and the February 2026 Claude Code Security launch that wiped billions off cybersecurity stocks, with dual-use dilemma scenario mapping for ethics curriculum

## [0.2.2] — 2026-02-21

### Added
- **Claude Code Security research doc** (`docs/research-claude-code-security.md`) — analysis of Anthropic's AI-driven vulnerability scanner (500+ decade-old bugs found), multi-stage verification pipeline, market impact, and mapping to Bias Buster's ethics curriculum as scenario material and design pattern reference

## [0.2.1] — 2026-02-21

### Added
- **Saga MCP research doc** (`docs/research-saga-mcp.md`) — analysis of Saga project tracker for AI agent task management, mapping its hierarchy to Bias Buster's content pipeline (scenario domains → decisions → consequence chains), comparison with Passion Memory MCP

## [0.2.0] — 2026-02-21

### Added
- **Consequence Visualization** component — verdict reel with SVG impact ripples, newspaper-style headlines, and animated magnitude bars
- `CaseOutcome`, `ImpactRipple`, `ImpactType` types for modeling case consequences
- CSS ripple-expand animation for SVG ring reveals
- Teal/amber color coding: teal for positive outcomes, amber for adverse rulings
- Full accessibility: ARIA labels, meter roles, reduced-motion support

## [0.1.0] — 2026-02-20

### Added
- Initial scaffold from Passionate Learning template
- Core game engine: progress, streaks, mastery gates, spaced repetition (FSRS)
- UI components: Button, Logo, StreakBadge, XPBar, Timer, VictoryScreen
- Procedural sound effects via Web Audio API
- CRT scanline overlay, neon glow, pixel border aesthetics
- ESLint 9 flat config
