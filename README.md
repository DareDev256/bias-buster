# BIAS BUSTER

> AI Ethics in Your Hands — Every Decision Has Consequences

A web-based educational game that teaches AI ethics through branching narrative gameplay. Players navigate simulated legal cases and ethical dilemmas, making decisions that ripple through society. No right or wrong answers — only consequences.

## Features

- **Playable Scenario Engine** — 5 branching scenarios across Hiring & Recruitment and Content Moderation, each with 2–3 decisions and no obviously correct answer
- **3-Phase Decision Flow** — scenario prompt → immediate consequence → delayed long-term reveal → lesson takeaway, with broadsheet-style newspaper animations
- **Consequence Visualization** — SVG impact ripples + newspaper-headline UI showing how rulings cascade through public opinion, civil liberties, and city resources
- **Dynamic Front-Page Headlines** — algorithmically generated broadsheet-style banner headlines with Playfair Display serif typography and Verdict Scroll unfurl animation
- **Scales of Impact** — always-visible SVG scales-of-justice that tilt dynamically as decisions accumulate, with teal (equity) and amber (adverse) weight indicators and spring-physics animation
- **Persistent Progress** — gameplay decisions persist to localStorage: XP awards, streak tracking, level completion, mastery gates, and learning analytics all update in real-time as you play
- **Equity Scoring** — impact-based scoring (2/5/10) that rewards equitable outcomes without moralizing, with division-safe percentage display
- **Ethics Radar** — tracks Fairness, Transparency, Privacy, Accountability across decisions
- **Spaced Repetition** — FSRS-4.5 algorithm ensures long-term retention of ethical concepts
- **Mastery Gates** — Kumon-style progression: 90% accuracy on 3 consecutive attempts to advance
- **Streak System** — daily engagement tracking with earned freeze protection
- **Procedural Audio** — Web Audio API sound effects, zero external dependencies
- **CRT Aesthetic** — scanline overlay, neon glow, pixel borders, retro typography

## Architecture

The persistence layer follows a modular design:

| Module | Responsibility |
|--------|----------------|
| `src/lib/security.ts` | Prototype pollution guard, JSON sanitization, schema validation primitives |
| `src/lib/analytics.ts` | Learning event tracking, retention metrics, isolated localStorage management |
| `src/lib/storage.ts` | Game progress CRUD, XP system, streaks, FSRS scheduling, mastery gates — re-exports security & analytics for backward compatibility |

## Security

- **Prototype pollution guard** (`security.ts`) — all localStorage reads pass through recursive `sanitize()` that strips `__proto__`/`constructor`/`prototype` keys before object merging
- **Schema validation** — every deserialized value is type-checked against expected shapes; malformed data falls back to safe defaults
- **Storage size cap** — 512KB per key prevents localStorage-bomb DoS
- **Security headers** — CSP (self + Google Fonts), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy

## Tech Stack

- **Next.js 16** + React 19 + TypeScript (strict)
- **Tailwind CSS v4** (CSS-first `@theme inline`)
- **Framer Motion** — staggered reveals, spring animations
- **ts-fsrs** — spaced repetition scheduling
- **Vitest** — unit test suite (47 tests across security, storage, headline generation)
- **localStorage** — SSR-safe persistence, no backend required

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:3000
npm run build    # production build
npm run lint     # ESLint check
npm test         # Run test suite (vitest)
npm run test:watch  # Watch mode
```

Zero API keys required. All scenarios and consequences are pre-written.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--game-primary` | `#1abc9c` | Teal — positive outcomes, balanced rulings |
| `--game-secondary` | `#f39c12` | Amber — adverse impacts, warnings |
| `--game-accent` | `#bdc3c7` | Silver — neutral UI, body text |
| `--game-dark` | `#0a1510` | Dark teal — backgrounds |

## Documentation

- [`docs/research-saga-mcp.md`](docs/research-saga-mcp.md) — Research on Saga MCP server for AI agent task tracking, with integration analysis for content pipeline management
- [`docs/research-claude-code-security.md`](docs/research-claude-code-security.md) — Research on Anthropic's Claude Code Security for AI-driven vulnerability discovery, with scenario mapping for ethics curriculum
- [`docs/research-agentic-ai-cyber-warfare.md`](docs/research-agentic-ai-cyber-warfare.md) — Research on AI-orchestrated cyber espionage and the dual-use dilemma of agentic AI in cybersecurity

## Project

Part of the **Passionate Learning** series by [DareDev256](https://github.com/DareDev256).

---

*"The measure of a society is found in how it treats its weakest and most helpless citizens." — Jimmy Carter*
