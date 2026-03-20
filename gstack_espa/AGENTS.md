# AGENTS.md

## Operating Model

This repository uses a gstack-inspired, Codex-native workflow.
Separate problem framing, product review, engineering review, implementation, QA, release readiness, and documentation updates instead of collapsing everything into one step.

## Default Expectations

- Inspect existing code, configuration, and docs before adding new modules.
- Prefer the smallest diff that solves the problem cleanly.
- When project tooling exists, run the smallest relevant validation commands from the repo before declaring work complete.
- For UI changes, include manual verification notes and likely regression points.
- For API, schema, config, or migration changes, update docs and rollout notes in the same change when applicable.
- Do not change CI, deployment, infrastructure, secrets, or billing-sensitive settings unless the user explicitly asks.

## Skill Routing

- Use `office-hours` when the request is ambiguous, solution-biased, or missing the real problem statement.
- Use `plan-product-review` before committing to scope, sequencing, or launch shape for a feature.
- Use `plan-eng-review` before non-trivial implementation, refactors, or cross-cutting changes.
- Use `review` after code changes or when evaluating a diff for behavioral regressions.
- Use `qa` before merge for user-visible, risky, or stateful changes.
- Use `ship` before push, merge, or release-readiness decisions.
- Use `document-release` when shipped behavior changes README content, setup steps, APIs, examples, or screenshots.

## Subagents

- Split only independent work such as codebase exploration, test impact analysis, or UI regression scouting.
- Give each subagent a narrow goal and disjoint ownership.
- Review subagent output locally before making merge or release decisions.

## Repo-Local Skills

- Repo-local skills live in `.codex/skills`.
- If Codex is not discovering them automatically, launch it with `CODEX_HOME=$PWD/.codex`.
