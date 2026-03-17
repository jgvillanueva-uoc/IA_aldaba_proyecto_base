---
description: Instructions for unit and end-to-end tests.
applyTo: '{src,test}/**/*.spec.ts'
---

## Context

These files verify application behavior through unit and end-to-end tests.

## Rules

- Focus tests on observable behavior and meaningful outcomes.
- Keep test setup and assertions readable and intention-revealing.
- Update tests when application behavior changes.
- Prefer deterministic tests over brittle or timing-sensitive assertions.
- Reuse helpers when they improve clarity and reduce duplicated setup.

## Avoid

- Over-mocking when integration behavior is important.
- Asserting against incidental implementation details.
- Duplicating large setup blocks across many tests without a clear reason.
