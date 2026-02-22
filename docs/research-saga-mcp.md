# Research: Saga MCP — Structured Project Tracking for AI Agents

> Source: [Show HN: Saga](https://news.ycombinator.com/item?id=47106215) | [GitHub](https://github.com/spranab/saga-mcp) | [npm](https://www.npmjs.com/package/saga-mcp)

## What It Is

Saga is an MCP (Model Context Protocol) server that gives AI coding agents a Jira-like project tracker backed by a local SQLite database. Instead of agents dumping state into scattered markdown files or losing context between sessions, Saga provides a structured hierarchy: **Projects > Epics > Tasks > Subtasks**.

- **22 tools** for CRUD across the full hierarchy
- **Notes system** — decisions, blockers, meeting notes attached to entities
- **Cross-entity search** — find anything across the project graph
- **Activity log** — automatic mutation tracking with timestamps
- **Per-project isolation** — each project gets its own `.tracker.db`
- **Zero config** — no Docker, no Postgres, no API keys. `npx saga-mcp` and go.

## Why This Matters for Bias Buster

Bias Buster's curriculum spans **8 scenario domains** with **120 planned decisions**, each with branching consequences. Tracking development progress across that content matrix is a real problem — which scenarios are written, which consequence chains are tested, which ethics dimensions are covered.

### Potential integration points

| Saga Concept | Bias Buster Mapping |
|---|---|
| **Project** | Bias Buster game itself |
| **Epic** | Scenario domain (e.g., "Predictive Policing", "Hiring AI") |
| **Task** | Individual scenario with its decision tree |
| **Subtask** | Per-decision consequence chain, stakeholder impacts |
| **Notes** | Design rationale for why a scenario teaches what it teaches |
| **Activity Log** | Track which content was last reviewed/updated |

### What this would solve

1. **Content authoring at scale** — 120 decisions is a content pipeline problem. Saga gives agents a structured backlog instead of scanning files.
2. **Coverage tracking** — map which ethics dimensions (Fairness, Transparency, Privacy, Accountability) are covered per scenario domain.
3. **Session continuity** — agents picking up content work mid-session get a `tracker_dashboard` call showing exactly where things stand.
4. **Quality gates** — subtasks can track whether consequence chains have been reviewed for tone (not preachy), balance (no obviously right answer), and educational value.

## Architecture Fit

Bias Buster is a **zero-backend game** (localStorage, no API keys). Saga doesn't conflict with this — it's a development-time tool, not a runtime dependency. The `.tracker.db` file stays local and can be gitignored.

```
Development workflow:
  Claude Code ──MCP──> Saga (.tracker.db)
                         ├── Project: Bias Buster
                         ├── Epic: Predictive Policing scenarios
                         │   ├── Task: "Precinct Alpha" scenario
                         │   │   ├── Subtask: Write decision options
                         │   │   ├── Subtask: Map consequence chains
                         │   │   └── Subtask: Balance ethics radar impact
                         │   └── Task: "Recidivism Score" scenario
                         └── Epic: Hiring AI scenarios
```

## Comparison: Saga vs Passion Memory MCP

We already use Passion Memory MCP for session handoffs and project state. Saga fills a different niche:

| Concern | Passion Memory | Saga |
|---|---|---|
| **Scope** | Cross-project brain (memories, sessions, jobs) | Single-project task tracking |
| **Data model** | Key-value + session blobs | Relational hierarchy (project > epic > task) |
| **Best for** | "What did I do last session?" | "What tasks remain in this epic?" |
| **Overlap** | Session handoff, project status | None — complementary |

They'd work well together: Passion Memory for high-level project state and session continuity, Saga for granular task tracking within a content-heavy project like Bias Buster.

## Installation (if adopted)

```json
// claude_desktop_config.json or .claude/settings.json
{
  "mcpServers": {
    "saga": {
      "command": "npx",
      "args": ["saga-mcp"]
    }
  }
}
```

## Verdict

**Relevant, not urgent.** Saga solves a real problem (structured task tracking for AI agents) that becomes acute when Bias Buster's content pipeline scales to 120 decisions. Worth revisiting when content authoring begins in earnest. For now, Passion Memory's session handoff is sufficient for the current feature-building phase.

---

*Researched 2026-02-21 via Show HN. Relevance score: 75/100.*
