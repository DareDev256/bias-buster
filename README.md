# BIAS BUSTER

> AI Ethics in Your Hands — Every Decision Has Consequences

A web-based educational game that teaches AI ethics through branching narrative gameplay. Players navigate simulated legal cases and ethical dilemmas, making decisions that ripple through society. No right or wrong answers — only consequences.

## Features

- **Branching Narrative** — 2–3 decision options per scenario, none obviously correct
- **Consequence Visualization** — SVG impact ripples + newspaper-headline UI showing how rulings cascade through public opinion, civil liberties, and city resources
- **Ethics Radar** — tracks Fairness, Transparency, Privacy, Accountability across decisions
- **Spaced Repetition** — FSRS-4.5 algorithm ensures long-term retention of ethical concepts
- **Mastery Gates** — Kumon-style progression: 90% accuracy on 3 consecutive attempts to advance
- **Streak System** — daily engagement tracking with earned freeze protection
- **Procedural Audio** — Web Audio API sound effects, zero external dependencies
- **CRT Aesthetic** — scanline overlay, neon glow, pixel borders, retro typography

## Tech Stack

- **Next.js 16** + React 19 + TypeScript (strict)
- **Tailwind CSS v4** (CSS-first `@theme inline`)
- **Framer Motion** — staggered reveals, spring animations
- **ts-fsrs** — spaced repetition scheduling
- **localStorage** — SSR-safe persistence, no backend required

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:3000
npm run build    # production build
npm run lint     # ESLint check
```

Zero API keys required. All scenarios and consequences are pre-written.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--game-primary` | `#1abc9c` | Teal — positive outcomes, balanced rulings |
| `--game-secondary` | `#f39c12` | Amber — adverse impacts, warnings |
| `--game-accent` | `#bdc3c7` | Silver — neutral UI, body text |
| `--game-dark` | `#0a1510` | Dark teal — backgrounds |

## Project

Part of the **Passionate Learning** series by [DareDev256](https://github.com/DareDev256).

---

*"The measure of a society is found in how it treats its weakest and most helpless citizens." — Jimmy Carter*
