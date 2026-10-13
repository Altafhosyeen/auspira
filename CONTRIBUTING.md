# Contributing to Auspira Frontend

## Stack

Next.js 15 (App Router) · React 19 · Ant Design 6 · TanStack React Query · Zustand · Tailwind CSS v4 · TypeScript · Biome (format + lint) · Vitest · Lefthook (git hooks).

## Setup

```bash
nvm use            # Node 22 (see .nvmrc)
cp .env.example .env.local   # then fill in real values
npm install        # installs lefthook git hooks via prepare script
npm run dev        # http://localhost:3000
```

Editor: VS Code or Cursor. Recommended extensions and workspace settings live in
`.vscode/` — Biome is the default formatter (format-on-save, import sorting).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbo) |
| `npm run build` | Typecheck + tests + production build |
| `npm run check-types` | `tsc --noEmit` |
| `npm run test` / `test:watch` | Vitest unit tests |
| `npm run lint` / `format` | Biome lint / format |
| `npm run analyze` | Production build + bundle-size report |

## Conventions (enforced by lefthook on staged files)

- **Formatting & linting:** Biome only (`biome.json`). No ESLint/Prettier.
- **Commit messages:** conventional commits — `<type>(<scope>): <subject>`
  (types: `feat fix docs style refactor perf test build ci chore revert`). The
  commit-msg hook rejects anything else.
- **File/folder naming:** kebab-case, always (e.g. `compensation-event-list-page.tsx`).
- **New features:** self-contained slices under `src/modules/<feature>/`
  (`components/`, `hooks/`, `services/`, `types/`, `utils/`, `constants/`,
  `index.ts` barrel). Consumers import from the module root only. See
  `.agents/architecture.md` and the reference module `src/modules/compensation-event/`.
- **UI:** raw Ant Design only for new modules — no legacy X-wrappers
  (`ButtonX`, `InputX`, …), no Tailwind, no custom CSS.
- **Comments:** minimal; one-liners only when something is non-obvious.

## Testing

- Unit tests live in `src/tests/<feature>/` and are picked up automatically by
  Vitest (`*.test.ts`). Pure logic (utils/constants) must have tests.
- Component tests are supported (jsdom + tsx) — add them when behavior warrants.

## Git hooks

Lefthook (`lefthook.yml`) runs on every commit: architecture checks
(`scripts/check-staged.mjs`) + Biome on staged files, and conventional-commit
validation. Checks apply to **staged files only** — legacy code is not linted
until it's touched. Run `npx lefthook run pre-commit` to check staged changes
without committing.

## Pull requests

Use the template in `.github/PullRequestTemplate.md`. Keep PRs small and scoped.
CI runs typecheck + unit tests before building/deploying (see
`azure-pipelines.yml`).

## MCP servers

Figma and Playwright MCP servers are configured for VS Code (`.vscode/mcp.json`),
Cursor (`.cursor/mcp.json`), and agent tools (`.mcp.json`).
