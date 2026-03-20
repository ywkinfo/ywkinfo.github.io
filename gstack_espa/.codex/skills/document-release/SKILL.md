---
name: document-release
description: Update README files, setup guides, API docs, examples, and release notes so documentation matches a shipped or nearly shipped change. Use when code and docs may have drifted after implementation, review, or release preparation and Codex should synchronize factual project documentation with the diff.
---

# Objective

Keep documentation aligned with the product that actually exists.

## Process

1. Compare the change set against README content, setup steps, commands, examples, API docs, and screenshots.
2. Update factual drift such as file paths, flags, commands, project structure, and supported behavior.
3. Separate subjective copy decisions from mechanical documentation sync.
4. Highlight any remaining gaps that require human product or comms judgment.

## Output

Produce:

- Docs updated
- Docs still needing decisions
- User-facing change summary
- Follow-up notes for future documentation work

## Guardrails

- Prefer factual sync over marketing copy.
- Do not document behavior that is not present in the code or rollout plan.
- Flag screenshots, diagrams, or external docs that cannot be updated from the current workspace.
