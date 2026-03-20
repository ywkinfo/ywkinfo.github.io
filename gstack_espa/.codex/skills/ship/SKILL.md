---
name: ship
description: Check release readiness, validation coverage, docs drift, and PR hygiene before pushing, merging, or shipping. Use when a change is close to done and Codex should act like a release manager by identifying blockers, missing checks, rollout risks, and the cleanest path to ship safely.
---

# Objective

Decide whether a change is actually ready to leave the branch.

## Process

1. Confirm the branch, target, and release assumption.
2. Run or identify the relevant validation commands from the repository.
3. Check for missing docs, env changes, schema changes, flags, migrations, and rollback concerns.
4. Evaluate monitoring, support, and launch risk.
5. Draft the PR or release summary and list remaining blockers.
6. Push or open a PR only when the user explicitly asks.

## Output

Produce:

- Release status: ready, ready with follow-ups, or blocked
- Commands run or still missing
- Main launch or rollback risks
- PR summary draft
- Final preflight checklist

## Guardrails

- Do not invent test commands that the repository does not define.
- Do not push, tag, or open external PRs without explicit user approval.
- Call out blockers plainly instead of smoothing them over.
