#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read NEXT_PUBLIC_PORT from .env (if present) and use it as Next's port.
// Usage in package.json: "dev": "node ./scripts/run-next.js dev"

function readNextPublicPort() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return undefined;
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/^\s*NEXT_PUBLIC_PORT\s*=\s*['"]?([^'"\n\r]+)['"]?\s*$/m);
  return m ? m[1] : undefined;
}

const nextPublicPort = readNextPublicPort();
const defaultPort = process.env.PORT || nextPublicPort || '3000';

// Forward arguments (e.g. "dev" or "start") to the next binary and pass -p <port>
const args = process.argv.slice(2);
if (args.length === 0) args.push('dev');

const child = spawn('npx', ['next', ...args, '-p', defaultPort], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code));
child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
