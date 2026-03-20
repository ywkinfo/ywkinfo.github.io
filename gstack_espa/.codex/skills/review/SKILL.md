---
name: review
description: Review changed code for correctness bugs, regressions, operational risk, and missing tests after implementation. Use when a diff, commit series, or in-progress change needs a skeptical engineering review that prioritizes behavior and production safety over style commentary.
---

# Objective

Find the issues that are most likely to break users, operators, or future changes.

## Process

1. Read the diff and the surrounding code paths it depends on.
2. Look for correctness risks first, especially null or empty states, race conditions, stale state, trust boundaries, migrations, and rollback hazards.
3. Check whether logging, metrics, and error handling are sufficient to debug failures.
4. Verify that tests cover the changed behavior rather than only the happy path.
5. Report findings ordered by severity with concrete evidence.

## Output

Produce:

- Findings ordered from highest to lowest severity
- File references for each finding when possible
- Open questions or assumptions
- Brief residual risk summary

## Guardrails

- Lead with findings, not a summary.
- Say explicitly when no findings were found.
- Skip style-only nits unless they hide a functional risk.
