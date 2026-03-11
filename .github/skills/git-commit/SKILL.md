---
name: git-commit
description: "Use when: writing a git commit message, redacting a commit, proposing a commit, validating a commit message, creating a branch name, staging changes, following Conventional Commits. Applies project-specific git conventions for Gestor ICE: types, scopes, subject rules, footer references, branch naming, and guided flow when context is missing."
argument-hint: "Describe the change (in any language) or paste the diff"
---

# git-commit — Commit Message & Branch Workflow

Generates, validates, and corrects git commit messages and branch names following the conventions of **Gestor ICE** as defined in `CONTRIBUTING.md` at the repository root.

---

## When to Use

Invoke this skill whenever you need to:
- Write or review a commit message.
- Name a new issue branch.
- Validate an existing commit subject.
- Stage and commit changes with the right format.

---

## Guided Flow

If the user's request is missing context, ask in this order before generating the message:

1. **What changed?** (files, behaviour, or description — in any language)
2. **Which issue does this close or reference?** (`Closes #n` / `Refs #n` / none)
3. **Is this a breaking change?** (if yes, add `BREAKING CHANGE:` in footer)

If the diff or changed files are available in context, infer scope automatically from the **Scope Map** section below without asking.

---

## Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Rules — Subject line

| Rule | Detail |
|---|---|
| Max length | 72 characters |
| Case | Lowercase — never capitalise the first letter |
| Verb | Imperative mood ("add", "fix") — never past tense |
| No period | Do not end with `.` |
| Language | Always **English**, even if the description was given in Spanish |

### Rules — Body (optional)

- Separated from subject by a blank line.
- Lines max 72 characters.
- Explain *what* and *why*, not *how*.

### Rules — Footer (optional)

- `Closes #<n>` when the commit fully resolves a GitHub issue.
- `Refs #<n>` when related but not closing.
- `BREAKING CHANGE: <description>` for breaking changes.

---

## Valid Types

| Type | When to use |
|---|---|
| `feat` | New feature visible to consumers |
| `fix` | Bug fix |
| `refactor` | Internal restructure without behaviour change |
| `test` | Add or modify tests |
| `chore` | Maintenance, tooling, config, CI |
| `docs` | Documentation only |
| `style` | Formatting, lint — zero logic change |
| `perf` | Performance improvement |
| `build` | Build system or dependency changes |
| `ci` | Pipeline configuration |

---

## Scope Map

Derive the scope from the primary files changed:

| Changed path | Scope |
|---|---|
| `src/modules/tasks/**` | `tasks` |
| `src/modules/ice/**` | `ice` |
| `src/modules/ai/**` | `ai` |
| `src/infrastructure/**` | `persistence` |
| `src/config/**` | `config` |
| `src/common/**` | `common` |
| `.github/**`, `*.yml`, `*.yaml` (CI) | `ci` → type should be `ci` or `chore` |
| `design/**`, `README.md`, `*.md` | omit scope → type must be `docs` |
| Multiple unrelated modules | omit scope |

Scope is **optional**. Omit it rather than inventing one.

---

## Branch Naming

Issue branches must be created from `dev`:

```
<type>/<issue-id>-<short-description>
```

Valid types for branches: `feature`, `fix`, `chore`, `hotfix`.

Examples:
```
feature/1-persistence-port-adapter
fix/2-tasks-crud-404
chore/6-quality-robustness
```

Rules:
- All lowercase, hyphens as separators.
- Short description: 2–5 words, no articles.
- Always include the issue id.

---

## Examples

```
feat(tasks): add create task endpoint

Implements POST /tasks with DTO validation and persistence
via TaskRepositoryPort.

Closes #2
```

```
fix(ice): reject effort value of zero

Prevents division by zero in ICE score formula.

Refs #3
```

```
refactor(persistence): inject TaskRepositoryPort instead of PrismaService

Decouples TasksService from the Prisma adapter so the port
can be swapped without touching application logic.

Closes #1
```

```
chore(ci): remove one-shot issue creation workflow and script
```

```
docs: update architecture document with persistence port pattern
```

---

## Validation Checklist

Before confirming a message, verify:

- [ ] Type is one of the valid list above.
- [ ] Subject is lowercase and imperative.
- [ ] Subject is ≤ 72 characters.
- [ ] Scope matches the scope map (or is omitted if ambiguous).
- [ ] `Closes #n` is present when the change resolves an issue.
- [ ] Message is in English.

---

## Common Mistakes to Correct

| Wrong | Correct |
|---|---|
| `feat(tasks): Added task creation` | `feat(tasks): add task creation` |
| `Fix: Task not found returns 500` | `fix(tasks): return 404 when task is not found` |
| `chore: Updated deps and linting and ci and config` | Split into focused commits or omit verbose list |
| `feat: implement the full CRUD for tasks and ice and ai` | `feat(tasks): implement task CRUD endpoints` |
| `feat(src/modules/tasks): ...` | `feat(tasks): ...` (scope is the module name, not the path) |
