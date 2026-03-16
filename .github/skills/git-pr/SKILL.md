---
name: git-pr
description: "Use when: creating a pull request, writing a PR title or description, drafting a PR body, checking PR target branch policy, opening a PR from a feature or fix branch, redacting PR summary or notes, validating a PR before merge. Applies project-specific PR conventions for Gestor ICE based on PULL_REQUEST_TEMPLATE.md."
argument-hint: "Describe the change, or paste the branch name or issue number"
---

# git-pr — Pull Request Workflow

Generates and validates Pull Request titles and bodies following the conventions of Gestor ICE, using `.github/PULL_REQUEST_TEMPLATE.md` as the canonical structure.

---

## When to Use

Invoke this skill whenever you need to:
- Draft or complete a PR title and description.
- Validate that a PR targets the correct branch.
- Check that the validation checklist (`build`, `lint`, `test`) is satisfied before merging.
- Confirm that the issue reference is correctly included.

---

## Guided Flow

If the user's request is missing context, ask in this order before drafting:

1. What is the source branch? (e.g. `feature/2-tasks-crud-endpoints`)
2. Which issue does this PR close? (`Closes #n`)
3. What changed? (brief description, in any language; output will be in English)
4. Have build, lint, and tests been run and passed?

If branch name and git log are available in context, infer the summary and issue automatically without asking.

---

## PR Title Format

```
<type>(<scope>): <subject>
```

Uses the same rules as the commit subject:

| Rule | Detail |
|---|---|
| Max length | 72 characters |
| Case | Lowercase; never capitalize the first letter |
| Verb | Imperative mood ("add", "fix") |
| No period | Do not end with `.` |
| Language | Always English |
| Type and scope | Derived from the branch name and changed files |

The PR title should match or summarize the most significant commit on the branch.

---

## PR Body Template

Use the following structure, filling in each section:

```markdown
## Summary
<3-5 lines describing what changed, why, and the approach taken.
Focus on behavior visible to API consumers, not implementation details.>

## Issue
Closes #<issue-id>

## Target Branch Policy (required)
- [x] This PR targets `dev` if it comes from `feature/*`, `fix/*`, `chore/*`, or `hotfix/*`
- [ ] This PR targets `main` only when source branch is `dev`

## Validation
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run test`

## Notes
<Only required when targeting `main`. Describe release scope and risk.
For PRs targeting `dev`, write "N/A".>
```

Rules for filling the template:
- Summary: 3-5 lines, present tense, first person omitted. Describe what changed, not how code is structured.
- Issue: always `Closes #n`.
- Target Branch Policy: tick exactly one checkbox based on source branch.
- Validation: leave all checkboxes unticked when drafting; tick them after running the commands.
- Notes: required only for PRs to `main`. For `dev`-targeted PRs, write `N/A`.

---

## Target Branch Policy

| Source branch | Target branch | Allowed |
|---|---|---|
| `feature/*` | `dev` | Yes |
| `fix/*` | `dev` | Yes |
| `chore/*` | `dev` | Yes |
| `hotfix/*` | `dev` | Yes |
| `dev` | `main` | Yes |
| Any branch | `main` directly | No |
| `feature/*` | `feature/*` | No |

Rule: never open a PR directly to `main` from a feature, fix, chore, or hotfix branch.

---

## Type and Scope Mapping

Derive type and scope from the primary files changed (same as `git-commit` skill):

| Changed path | Scope |
|---|---|
| `src/modules/tasks/**` | `tasks` |
| `src/modules/ice/**` | `ice` |
| `src/modules/ai/**` | `ai` |
| `src/infrastructure/**` | `persistence` |
| `src/config/**` | `config` |
| `src/common/**` | `common` |
| `.github/**`, CI files | `ci` |
| `design/**`, `*.md` | Omit scope; type `docs` |
| Multiple unrelated modules | Omit scope |

---

## Example

Title:
```
feat(tasks): add CRUD endpoints for task management
```

Body:
```markdown
## Summary
Implements the base CRUD endpoints for tasks: POST /tasks,
GET /tasks, GET /tasks/:id, and DELETE /tasks/:id. Adds DTO
validation and maps persistence errors to 404/400 HTTP responses.

## Issue
Closes #2

## Target Branch Policy (required)
- [x] This PR targets `dev` if it comes from `feature/*`, `fix/*`, `chore/*`, or `hotfix/*`
- [ ] This PR targets `main` only when source branch is `dev`

## Validation
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run test`

## Notes
N/A
```

---

## Validation Checklist

Before confirming the PR draft, verify:

- [ ] Title is lowercase, imperative, and <= 72 characters.
- [ ] Title type and scope match changed files.
- [ ] `Closes #n` references the correct issue.
- [ ] Exactly one Target Branch Policy checkbox is ticked.
- [ ] Target branch is correct for the source branch type.
- [ ] PR is not targeting `main` directly from a feature/fix/chore/hotfix branch.
- [ ] Notes section is completed when targeting `main`.

---

## Common Mistakes to Correct

| Wrong | Correct |
|---|---|
| `Fixes #2` in issue section | `Closes #2` |
| Feature branch PR targeting `main` | Must target `dev` first |
| `FEAT(tasks): Added CRUD` as title | `feat(tasks): add CRUD endpoints` |
| Empty Summary section | 3-5 lines describing the change |
| Both policy checkboxes ticked | Tick exactly one |
| Blank Notes section on `main` PR | Describe release scope and risk |
