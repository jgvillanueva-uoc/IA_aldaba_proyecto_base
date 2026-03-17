#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });
}

function runCapture(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

const gitCheck = runCapture('git', ['rev-parse', '--is-inside-work-tree']);
if (gitCheck.status !== 0) {
  console.log('[pre-commit-lite] skipped: not a git repository');
  process.exit(0);
}

const staged = runCapture('git', [
  'diff',
  '--cached',
  '--name-only',
  '--diff-filter=ACMR',
]);
if (staged.status !== 0) {
  console.error('[pre-commit-lite] failed: cannot list staged files');
  process.exit(2);
}

const stagedFiles = staged.stdout
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean);

if (stagedFiles.length === 0) {
  console.log('[pre-commit-lite] skipped: no staged files');
  process.exit(0);
}

const eslintTargets = stagedFiles.filter((file) =>
  /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file),
);
const prettierTargets = stagedFiles.filter((file) =>
  /\.(ts|tsx|js|jsx|mjs|cjs|json|md|yml|yaml)$/.test(file),
);

const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (eslintTargets.length > 0) {
  console.log(
    `[pre-commit-lite] eslint --fix on ${eslintTargets.length} staged file(s)`,
  );
  const lintResult = run(npmBin, [
    'exec',
    '--',
    'eslint',
    '--fix',
    ...eslintTargets,
  ]);
  if (lintResult.status !== 0) {
    console.error('[pre-commit-lite] failed: eslint reported errors');
    process.exit(2);
  }
}

if (prettierTargets.length > 0) {
  console.log(
    `[pre-commit-lite] prettier --write on ${prettierTargets.length} staged file(s)`,
  );
  const prettierResult = run(npmBin, [
    'exec',
    '--',
    'prettier',
    '--write',
    ...prettierTargets,
  ]);
  if (prettierResult.status !== 0) {
    console.error('[pre-commit-lite] failed: prettier reported errors');
    process.exit(2);
  }
}

const filesToRestage = Array.from(
  new Set([...eslintTargets, ...prettierTargets]),
);
if (filesToRestage.length > 0) {
  const addResult = run('git', ['add', '--', ...filesToRestage]);
  if (addResult.status !== 0) {
    console.error(
      '[pre-commit-lite] failed: could not re-stage formatted files',
    );
    process.exit(2);
  }
}

console.log('[pre-commit-lite] done');
process.exit(0);
