---
name: git-issue-start
description: "Use when: starting work on a GitHub issue, moving issue label to doing, creating a working branch from dev with project naming conventions, and preparing the local git context before coding."
argument-hint: "Provide issue number and branch type, e.g. issue=2 type=feature"
---

# git-issue-start - Start Working On An Issue

Purpose: standardize the start of issue work in this repository by updating the issue workflow label and creating the branch from dev with the project naming rules.

## When To Use

Use this skill when you are about to start implementing an issue and need to:
- Move the issue to label doing.
- Create and switch to a new branch from dev.
- Ensure branch naming follows CONTRIBUTING.md conventions.

## Required Inputs

Collect these values first:
1. issue number (required)
2. branch type (required): feature, fix, chore, hotfix
3. short slug (optional): if missing, infer from issue title and normalize

If context is missing, ask exactly:
1. What is the issue number?
2. Which branch type do you want (feature/fix/chore/hotfix)?
3. Do you want to provide a custom short slug, or should I infer it from the issue title?

## Repository Rules To Enforce

- Base branch must be dev.
- New branch format:
  - feature/<issue-id>-<short-description>
  - fix/<issue-id>-<short-description>
  - chore/<issue-id>-<short-description>
  - hotfix/<issue-id>-<short-description>
- Slug rules:
  - lowercase only
  - words separated with hyphens
  - no accents, punctuation, or underscores

## Execution Procedure

### Step 1 - Validate issue exists and read title

Run:

```bash
gh issue view <issue-id> --json number,title,labels,state
```

Expected result:
- issue exists
- issue state is open

If the issue is closed, stop and ask user confirmation before continuing.

### Step 2 - Move issue to doing label

Run these commands in order:

```bash
gh issue edit <issue-id> --remove-label todo || true
gh issue edit <issue-id> --add-label doing
```

Notes:
- Keep done untouched.
- If label doing does not exist, fail with a clear message and ask user whether to create it.

### Step 3 - Build branch name

Rules:
- branch type from allowed list only
- issue id from input
- short slug inferred from issue title when omitted

Normalization algorithm for slug:
1. lowercase
2. remove accents
3. replace non-alphanumeric sequences with a single hyphen
4. trim leading/trailing hyphens
5. keep 2 to 6 words when possible

Final branch:

```text
<type>/<issue-id>-<slug>
```

### Step 4 - Sync dev and create branch

Run:

```bash
git checkout dev
git pull origin dev
git checkout -b <type>/<issue-id>-<slug>
```

If the branch already exists locally:
- switch to it with git checkout <branch>

If it exists only in remote:
- use git checkout -b <branch> origin/<branch>

### Step 5 - Confirm result

Report:
- updated issue labels
- current checked-out branch
- next recommended command:

```bash
git push -u origin <type>/<issue-id>-<slug>
```

## Safety Checks

Before completing, verify:
- issue label doing is present
- active branch is not main
- active branch is not dev
- branch name matches project pattern

## Example Run

Input:
- issue: 3
- type: feature
- title: "Fase 3: dominio ICE manual"

Output branch:
- feature/3-dominio-ice-manual

Commands executed:

```bash
gh issue edit 3 --remove-label todo || true
gh issue edit 3 --add-label doing
git checkout dev
git pull origin dev
git checkout -b feature/3-dominio-ice-manual
```
