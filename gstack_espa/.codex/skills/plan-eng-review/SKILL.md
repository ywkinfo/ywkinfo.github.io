---
name: plan-eng-review
description: Review architecture, data flow, risks, boundaries, and test strategy before non-trivial implementation starts. Use when a feature touches multiple modules, introduces state changes, affects APIs or schemas, adds async behavior, or otherwise needs an engineering plan locked before code is written.
---

# Objective

Lock the implementation plan before editing files.

## Process

1. Translate the request into implementation terms.
2. Identify affected modules, interfaces, and ownership boundaries.
3. Map data flow, state transitions, and trust boundaries.
4. List edge cases, failure modes, rollout concerns, and compatibility risks.
5. Propose the smallest safe implementation sequence.
6. Define unit, integration, and manual validation coverage.

## Output

Produce:

- Architecture summary
- File or module touch list
- Main risks and mitigations
- Validation checklist
- Recommended implementation order
- Go or revise recommendation

## Guardrails

- Prefer minimal change sets over broad rewrites.
- Call out unknowns that block safe implementation.
- Use subagents only for independent side questions, not for the main architectural decision.
