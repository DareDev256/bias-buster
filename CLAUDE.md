# CLAUDE.md — Bias Buster

## Project: Passionate Learning Game #4
A web-based educational game that teaches AI ethics through branching narrative gameplay.

## Game Identity
- **Title**: BIAS BUSTER
- **Subtitle**: AI Ethics in Your Hands
- **Tagline**: EVERY DECISION HAS CONSEQUENCES
- **Storage key prefix**: `bias_buster`

## Full Spec
Read `/Users/tdot/Documents/Projects/passionate-learning/specs/04-bias-buster.md` for the complete game specification.

## Tech Stack
- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme inline`)
- Framer Motion for animations
- localStorage persistence (SSR-safe)
- Deploy: Vercel

## Template
Scaffolded from Passionate Learning shared template at `/Users/tdot/Documents/Projects/passionate-learning/template/`.

## Theme Colors
```css
--game-primary: #1abc9c;   /* teal */
--game-secondary: #f39c12; /* amber */
--game-accent: #bdc3c7;    /* silver */
--game-dark: #0a1510;
```

## Core Mechanic
Scenario presented → 2-3 decision options (none obviously right/wrong) → immediate consequence → long-term consequence reveals later → no game over, every path teaches.

## Build Priority
1. Landing page with scales-of-justice theme
2. Scenario card display with decision options
3. Decision selection + immediate consequence reveal
4. Long-term consequence engine (tracks decisions, reveals cascade effects)
5. Ethics radar chart (Fairness, Transparency, Privacy, Accountability)
6. Stakeholder impact panel
7. Full curriculum (120 decisions across 8 scenario domains)
8. Timeline visualization showing cascading consequences

## Quality Bar
- Production-grade. No placeholders.
- Zero API keys required — all scenarios and consequences are pre-written.
- Mobile responsive — decision cards work with tap on mobile.
- NOT preachy — experiential learning through consequences.

## Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # ESLint check
```
