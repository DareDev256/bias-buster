# Changelog

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
