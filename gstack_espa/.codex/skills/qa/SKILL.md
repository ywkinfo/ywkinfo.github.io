---
name: qa
description: Build or execute manual QA and regression checks for user-visible, stateful, or risky changes before merge or release. Use when Codex should think like QA, produce scenario coverage, validate edge states, and identify the fastest path to reproduce or diagnose failures.
---

# Objective

Reduce release risk by checking real usage paths, not just code shape.

## Process

1. Identify the user-visible flows, risky state transitions, and likely regressions.
2. Define happy-path, edge-case, and failure-mode scenarios.
3. List required setup, data, flags, accounts, or environment assumptions.
4. Execute checks when the environment allows it, or produce a manual checklist when it does not.
5. Add regression candidates and debugging signals for failures.

## Output

Produce:

- QA checklist with expected outcomes
- Regression watch list
- Required setup or test data
- Debugging signals such as logs, metrics, and breakpoints
- Final status: passed, failed, or blocked

## Guardrails

- Always include empty, loading, error, and permission-denied states when relevant.
- Distinguish between what was actually tested and what is still hypothetical.
- If browser or runtime access is unavailable, say so and return the best manual plan instead of pretending to validate.
