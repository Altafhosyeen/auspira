// Copies the pdf.js worker from pdfjs-dist into /public so react-pdf can load
// it from a same-origin URL (/pdf.worker.min.mjs). Runs on postinstall and
// prebuild so it is present in dev, CI, and the Docker standalone build.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destDir = join(root, 'public');
const dest = join(destDir, 'pdf.worker.min.mjs');

if (!existsSync(src)) {
  console.warn('[copy-pdf-worker] pdfjs-dist worker not found, skipping:', src);
  process.exit(0);
}

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log('[copy-pdf-worker] copied worker -> public/pdf.worker.min.mjs');
