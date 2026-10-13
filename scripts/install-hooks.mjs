// Installs the lefthook git hooks on `npm install` / `npm ci`.
// Git hooks only mean something in a real clone: the Docker build copies
// package.json without .git (.dockerignore excludes it), where `lefthook
// install` exits 128 and would fail `npm ci`. Skip when there is no repo, or
// when LEFTHOOK is set to 0/false, and never fail the install over hooks.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const lefthookFlag = process.env.LEFTHOOK;
if (lefthookFlag === '0' || lefthookFlag === 'false') {
  console.log('[install-hooks] LEFTHOOK is disabled, skipping hook install');
  process.exit(0);
}

// A worktree or submodule has .git as a file rather than a directory.
if (!existsSync(join(root, '.git'))) {
  console.log('[install-hooks] no .git directory, skipping hook install');
  process.exit(0);
}

// npm only puts node_modules/.bin on PATH when it runs the script itself, so
// prepend it here too and the script also works when invoked directly.
const binDir = join(root, 'node_modules', '.bin');
const result = spawnSync('lefthook', ['install'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PATH: `${binDir}${delimiter}${process.env.PATH ?? ''}` },
});

if (result.status !== 0) {
  console.warn('[install-hooks] lefthook install failed, run it manually to enable git hooks');
}
