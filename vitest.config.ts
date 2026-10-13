import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'react' },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Timestamp helpers render in the viewer's zone. Node reads TZ once at startup,
    // so it has to be pinned for the whole run — setting it inside a test is a no-op.
    env: { TZ: 'Asia/Karachi' },
    include: ['src/tests/**/*.test.{ts,tsx}'],
    exclude: ['.next/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './src/tests/reports/coverage',
      include: [
        'src/app/**/*.{ts,tsx}',
        'src/components/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/store/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.d.ts', '**/index.ts', '**/types/**'],
    },
  },
});
