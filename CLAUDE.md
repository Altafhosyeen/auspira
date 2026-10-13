# Auspira Frontend — Claude Code Guide

## Tech Stack

| Layer             | Library                                  | Version  |
| ----------------- | ---------------------------------------- | -------- |
| Framework         | Next.js (App Router)                     | ^15.1.7  |
| UI                | React                                    | ^19.0.0  |
| Component library | Ant Design                               | ^6.3.0   |
| Server state      | TanStack React Query                     | ^5.67.2  |
| Client state      | Zustand                                  | ^5.0.3   |
| HTTP client       | Axios                                    | ^1.16.0  |
| Auth              | NextAuth.js                              | ^4.24.11 |
| Animation         | Framer Motion                            | ^12.38.0 |
| Styling           | Tailwind CSS v4 + Ant Design tokens      | —        |
| Deployment        | Azure Container Apps (Docker standalone) | —        |

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build (typecheck + tests + next build)
npm run lint       # Biome lint
npm run format     # Biome format --write
npm run test       # Vitest unit tests
```

## Quality gates

- **Linting/formatting:** Biome (config: `biome.json`) — replaces the old
  ESLint + Prettier setup.
- **Pre-commit hook (lefthook):** Biome runs on **staged files only** (never the
  whole repo), plus `scripts/check-staged.mjs` enforces architecture rules
  (large files, kebab-case names in `src/modules/`, one-line comments, module
  layering, no `console.log`). Hooks config: `lefthook.yml`.
- **Commit messages:** `scripts/check-commit-message.mjs` (commit-msg hook)
  enforces conventional commits: `<type>(<scope>): <subject>`.
- `quality:ci` is typecheck-only by design — full-repo lint would fail until
  legacy code is migrated. Lint is enforced on changed files at commit time.

All source code lives under `src/` (Next.js `src/app` layout). `public/` stays at
the repo root.

```
src/
  app/
    (auth)/        # Public routes: login, register, etc.
    (dashboard)/   # Protected routes (middleware-guarded)
      contracts/   # Contract Registry (tabbed, lazy-loaded)
      projects/[id]/ # Project detail with dynamic ID
      users/
      settings/
    api/
      auth/        # NextAuth + token refresh endpoint
  components/
    contract/      # Contract Registry tab components
    layout/        # BaseLayout, Sidebar, Header
    module/        # Feature modules (project, auth, organisation)
    shared/        # Reusable: GlobalLoader, PageX, Button, etc.
  hooks/
    modules/       # React Query hooks: project.ts, organisation.ts, users.ts
    caching/       # Long-lived cache hooks (useCountryCache)
  lib/
    api/
      axios.ts       # Axios instance — JWT interceptors, proactive token refresh
      api-client.ts  # Typed HTTP methods wrapper
      auspira-api.ts # AUSPIRA<T>() request function used everywhere
      query-client.ts# React Query config (staleTime, gcTime, error handler)
      error-handler.ts
    auth/          # NextAuth config, refresh-token, sign-out helpers
  modules/         # NEW architecture: feature slices (see .agents/architecture.md)
  providers/
    index.tsx        # Provider composition: Auth → Query → Toast → Theme
    QueryProvider.tsx# ReactQueryDevtools enabled in development
  store/           # Zustand stores: auth, project, loading, lookup, system
  constants/
    api.constants.ts # API_ENDPOINTS + API_CONFIG (BASE_URL, TIMEOUT_MS)
    routes.constants.ts
  middleware.ts    # Protects /projects, /users, /finance, /welcome-back, /
```

## API Layer

All API calls go through `AUSPIRA<T>()` in [src/lib/api/auspira-api.ts](src/lib/api/auspira-api.ts):

```ts
AUSPIRA<ResponseType>({
  url: API_ENDPOINTS.PROJECTS.PROJECT,
  method: 'GET',
  skipLoader: true, // prevents GlobalLoader overlay — use on background/list fetches
});
```

**Key rules:**

- Use `skipLoader: true` on list/lookup queries so the full-screen overlay does not block navigation.
- Use `skipLoader: false` (default) only on primary page-level fetches that the user is explicitly waiting for.
- The axios instance auto-refreshes JWT 30 s before expiry and retries once on 401.
- Timeout is set to `API_CONFIG.TIMEOUT_MS` (20 s).

## React Query Conventions

Hooks live in [src/hooks/modules/](src/hooks/modules/). Pattern:

```ts
export const useGetProjects = (params?, helpers?) =>
  useQuery({
    queryKey: [...PROJECT_QUERY_KEY, params?.skip, params?.top, params?.term],
    queryFn: () => getProjects(params),
    ...helpers, // caller can override staleTime, enabled, select, etc.
  });
```

**Defaults** (set in [src/lib/api/query-client.ts](src/lib/api/query-client.ts)):

- `staleTime: 60_000` — data is fresh for 60 s; navigating back is instant.
- `gcTime: 300_000` — unused cache kept for 5 min.
- `refetchOnWindowFocus: false`
- `retry: 1` for queries, `retry: 0` for mutations.

Mutations always call `queryClient.invalidateQueries()` on success to keep cache consistent.

## Auth Flow

1. NextAuth session holds `accessToken`, `refreshToken`, `accessTokenExpires`.
2. Axios request interceptor calls `readAuthState()` — proactively refreshes if token expires within 30 s.
3. On 401 response, interceptor calls `attemptRefreshOn401()` and retries the request once.
4. If refresh fails → `signOut({ callbackUrl: '/login' })`.
5. Middleware (`src/middleware.ts`) uses NextAuth `withAuth` to protect all dashboard routes.

## Performance Notes

- **Dynamic imports**: Contract Registry tab components are lazy-loaded via `next/dynamic` with `<Skeleton>` fallbacks.
- **skipLoader**: All list/lookup queries use `skipLoader: true` to avoid full-screen blocking on background fetches.
- **gcTime**: Navigating back to a page reuses cached data immediately without a network round-trip.
- **Production**: `compiler.removeConsole` strips `console.log` in production builds.
- **Keep-alive**: `httpAgentOptions.keepAlive: true` reduces TCP handshake overhead for backend calls.
- **ReactQueryDevtools**: Enabled in development — look for the floating icon at the bottom of the screen.

## Adding a New Feature

1. Add endpoint to `src/constants/api.constants.ts`.
2. Add fetch function + hook to `src/hooks/modules/<domain>.ts` (follow existing pattern).
3. Use `skipLoader: true` if it is a background/list fetch.
4. Add the page under `src/app/(dashboard)/<route>/page.tsx` as a `'use client'` component.
5. Use `dynamic()` from `next/dynamic` for any large sub-components.

**New features should follow the modular architecture instead** — build a
self-contained slice under `src/modules/<feature>/` (see `.agents/architecture.md`
and `.agents/coding-principles.md`).

## Environment Variables

| Variable                  | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `NEXTAUTH_URL`            | Full URL of this app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET`         | NextAuth signing secret                             |
| `NEXT_PUBLIC_BACKEND_URL` | Azure backend base URL                              |
| `NEXT_PUBLIC_ENVIRONMENT` | `development` / `production`                        |
| `ANALYZE`                 | Set to `true` to run bundle analyzer on build       |

## Deployment

- `output: 'standalone'` in [next.config.ts](next.config.ts) produces a self-contained Node server.
- Docker multi-stage build copies `.next/standalone` into the final image.
- Deployed to **Azure Container Apps** (UK South region).
- API rewrites in `next.config.ts` proxy `/api/organizations/*` to the backend to avoid CORS.
