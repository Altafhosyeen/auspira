# Auspira Frontend

Web application for the Auspira platform — contract and project management with
early-warning workflows, built on the Next.js App Router.

## Tech Stack

| Layer | Library |
| --- | --- |
| Framework | Next.js 15 (App Router, standalone output) |
| UI | React 19 · Ant Design 6 |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 |
| Styling | Tailwind CSS v4 + Ant Design tokens |
| Auth | NextAuth.js 4 |
| Formatting / linting | Biome 2 (no ESLint / Prettier) |
| Testing | Vitest 4 (jsdom) |
| Git hooks | Lefthook (staged-file checks) |
| Deployment | Azure Container Apps (Docker standalone) |

## Getting Started

Prerequisites: Node 22 (see `.nvmrc`) and npm ≥ 10.

```bash
nvm use
cp .env.example .env.local   # fill in real values (see Environment Variables)
npm install                  # also installs lefthook git hooks
npm run dev                  # http://localhost:3000
```

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXTAUTH_URL` | Full URL of this app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | NextAuth signing secret |
| `NEXT_PUBLIC_BACKEND_URL` | Azure backend base URL |
| `NEXT_PUBLIC_ENVIRONMENT` | `development` / `production` |
| `ANALYZE` | Set to `true` to run the bundle analyzer on build |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbo) |
| `npm run build` | Typecheck + unit tests + production build |
| `npm run check-types` | `tsc --noEmit` |
| `npm run test` / `test:watch` | Vitest unit tests |
| `npm run lint` / `format` | Biome lint / format |
| `npm run analyze` | Production build with bundle-size reports |

## Project Structure

```
src/
  app/            # Next.js routes: (auth) public, (dashboard) protected
  components/     # Legacy shared components (layout, shared, module)
  constants/      # Shared constants (api, routes, theme, ...)
  hooks/          # React Query hooks + caches
  lib/            # API client (AUSPIRA), auth, utils, pdf-highlight
  modules/        # NEW modular architecture — self-contained feature slices
  providers/      # Auth, Query, Toast, Theme composition
  store/          # Zustand stores
  tests/          # Vitest unit tests (mirrors the src/ layout)
  types/          # Shared types
  utils/          # Legacy utilities
  middleware.ts   # Route protection (NextAuth + PROTECTED_ROUTES)
public/           # Static assets (stays at repo root)
```

## Architecture

New features are built as **self-contained modules** under `src/modules/<feature>/`
(components, hooks, services, types, utils, constants + `index.ts` barrel), with
one-way dependencies (`components → hooks → services → AUSPIRA`), kebab-case file
names, and raw Ant Design only. See `.agents/architecture.md` and the reference
implementation `src/modules/compensation-event/`.

## Quality Gates

- **Biome** (`biome.json`) is the only formatter and linter — format-on-save is
  configured for VS Code/Cursor in `.vscode/`.
- **Lefthook** (`lefthook.yml`) enforces on **staged files only**: architecture
  checks (`scripts/check-staged.mjs`), Biome format/lint, and conventional
  commit messages (`<type>(<scope>): <subject>`).
- **CI** (`azure-pipelines.yml`) runs typecheck + unit tests before building and
  deploying to Azure Container Apps.

## Testing

Unit tests live in `src/tests/<feature>/` and run with Vitest:

```bash
npm run test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup details, conventions, and the PR
process.
