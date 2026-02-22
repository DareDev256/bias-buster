# Changelog

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
