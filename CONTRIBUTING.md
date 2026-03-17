# Contributing Workflow

This repository uses a simplified Git Flow.

## Branches

- `main`: production branch (no direct pushes)
- `dev`: integration branch for all issue work

## Issue Branch Naming

Create issue branches from `dev` using:

- `feature/<issue-id>-<short-description>`
- `fix/<issue-id>-<short-description>`
- `chore/<issue-id>-<short-description>`
- `hotfix/<issue-id>-<short-description>`

Example:

- `feature/245-ice-manual-endpoint`

## Mandatory PR/MR Policy

1. Issue branches must open PR/MR to `dev`.
2. Only `dev` can open PR/MR to `main`.
3. Direct pushes to `main` are forbidden.
4. Direct pushes to `dev` are discouraged and should be blocked.

## GitHub Setup Checklist

1. Protect `main`:
   - require pull request
   - require status checks
   - require approvals
   - block force push and deletion
2. Protect `dev`:
   - require pull request
   - require status checks
   - optional approvals
3. Mark workflow `.github/workflows/pr-target-policy.yml` as required status check.

## GitLab Setup Checklist

1. Protect `main` and disallow direct pushes.
2. Protect `dev` and prefer MR-only changes.
3. Enable MR approvals and required pipeline pass.
4. Ensure `.gitlab-ci.yml` policy job is required.

## Local Command Flow

```bash
# start from dev
git checkout dev
git pull origin dev

# create issue branch
git checkout -b feature/245-ice-manual-endpoint

# work and commit
git add .
git commit -m "feat: implement manual ICE endpoint"

# push and open PR/MR to dev
git push -u origin feature/245-ice-manual-endpoint
```

## Release Flow

1. Merge issue PR/MRs into `dev`.
2. Open PR/MR from `dev` to `main`.
3. Merge after approvals and checks.
4. Tag release from `main`.
