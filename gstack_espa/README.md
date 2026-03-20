# gstack-espa

Codex-native role-based operating skeleton inspired by [garrytan/gstack](https://github.com/garrytan/gstack).

## What This Repo Contains

- `AGENTS.md`: always-on repository rules and workflow routing
- `.codex/skills/office-hours`: problem reframing
- `.codex/skills/plan-product-review`: product scope and sequencing review
- `.codex/skills/plan-eng-review`: architecture and test planning review
- `.codex/skills/review`: post-implementation code review
- `.codex/skills/qa`: manual QA and regression planning
- `.codex/skills/ship`: release-readiness review
- `.codex/skills/document-release`: documentation synchronization after shipping

## Quick Start

If you want Codex to auto-discover the repo-local skills, launch it with this repository as `CODEX_HOME`:

```bash
./scripts/codex-local
```

Or run:

```bash
CODEX_HOME="$PWD/.codex" codex
```

## Suggested Workflow

1. `office-hours`
2. `plan-product-review`
3. `plan-eng-review`
4. implement the change
5. `review`
6. `qa`
7. `ship`
8. `document-release`

## Design Notes

- This is not a direct Claude Code port.
- It keeps gstack's role separation while adapting to Codex conventions:
  `AGENTS.md` for always-on rules, `SKILL.md` files for task-specific SOPs, and subagents for parallel work.
- The release-oriented skills are intentionally conservative: they prepare or validate external actions, but do not assume pushes or PR creation unless explicitly requested.
