#!/usr/bin/env node
// Architectural checks on staged files — runs via lint-staged in pre-commit.
// Enforces the modular architecture (see .agents/) on changed files only.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const MAX_FILE_LINES = Number(process.env.MAX_FILE_LINES ?? 500);
const MODULES_PREFIX = 'src/modules/';
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const SKIP = new Set(['package-lock.json', 'skills-lock.json']);

const errors = [];
const warnings = [];

// Renames (R) keep their content — skip the line-count check for them so
// restructuring moves of large legacy files are not blocked.
const staged = (() => {
  const fromArgs = process.argv.slice(2).filter((f) => f && existsSync(f));
  if (fromArgs.length) return fromArgs.map((f) => ({ file: f, isRename: false }));
  return execSync('git diff --cached --name-status --diff-filter=ACMR', { encoding: 'utf8' })
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split('\t');
      return { file: parts[parts.length - 1], isRename: parts[0].startsWith('R') };
    });
})();

function checkLargeFile(file) {
  const lines = readFileSync(file, 'utf8').split('\n').length;
  if (lines > MAX_FILE_LINES) {
    errors.push(
      `${file}: exceeds ${MAX_FILE_LINES} lines (${lines}) — split it into smaller units.`
    );
  }
}

const isKebabSegment = (segment) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(segment);

function checkKebabCase(file) {
  if (!file.startsWith(MODULES_PREFIX)) return;
  const name = basename(file).replace(/\.[^.]+$/, '');
  if (name === 'index' || name === 'README') return;
  // Each dot-separated segment must be kebab-case, so the documented
  // `<name>.constants.ts` / `<name>.types.ts` suffixes are accepted too.
  if (!name.split('.').every(isKebabSegment)) {
    errors.push(`${file}: filename must be kebab-case (e.g. compensation-event-list-page.tsx).`);
  }
}

function checkComments(file) {
  if (!file.startsWith(MODULES_PREFIX) || !CODE_EXT.test(file)) return;
  const content = readFileSync(file, 'utf8');
  const blocks = content.match(/\/\*\*[\s\S]*?\*\//g) ?? [];
  if (blocks.some((b) => b.includes('\n'))) {
    errors.push(`${file}: multi-line JSDoc block found — use a one-line comment (//).`);
  }
}

function checkModuleLayering(file) {
  if (!CODE_EXT.test(file)) return;
  const content = readFileSync(file, 'utf8');
  if (/^src\/modules\/[^/]+\/components\//.test(file)) {
    if (content.includes("from '@/lib/api/auspira-api'") || content.includes('AUSPIRA<')) {
      errors.push(
        `${file}: components must not call AUSPIRA directly — use hooks (components → hooks → services).`
      );
    }
    if (/from ['"]\.\.?\/services\//.test(content)) {
      errors.push(`${file}: components must not import services directly — use hooks.`);
    }
  }
  if (/^src\/modules\/[^/]+\/services\//.test(file)) {
    if (/from ['"]\.\.\/components/.test(content) || /from ['"]\.\.\/hooks/.test(content)) {
      errors.push(`${file}: services must not import components or hooks (one-way dependency).`);
    }
  }
}

function checkConsole(file) {
  if (!CODE_EXT.test(file) || file.startsWith('scripts/')) return;
  const content = readFileSync(file, 'utf8');
  if (/console\.log\s*\(/.test(content)) {
    warnings.push(`${file}: console.log found — remove before committing.`);
  }
}

for (const { file, isRename } of staged) {
  if (SKIP.has(basename(file))) continue;
  if (!isRename) checkLargeFile(file);
  checkKebabCase(file);
  checkComments(file);
  checkModuleLayering(file);
  checkConsole(file);
}

for (const w of warnings) console.warn(`[warn] ${w}`);
for (const e of errors) console.error(`[error] ${e}`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} architectural issue(s) — fix before committing.`);
  process.exit(1);
}
if (warnings.length) console.warn(`\n${warnings.length} warning(s) — review.`);
else if (staged.length) console.log(`✓ check-staged: ${staged.length} file(s) ok`);
