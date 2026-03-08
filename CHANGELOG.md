# Changelog

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
