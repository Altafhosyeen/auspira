# GitHub Copilot Instructions

## Product and Stack

- Product: Student Apply Admin
- Frontend: Next.js App Router, React 19, TypeScript (strict)
- UI: Ant Design components + Tailwind utilities
- State: TanStack Query (server state), Zustand (cross-page UI state)
- Auth/API: NextAuth credentials + centralized Axios client + HMAC signing

## Core Engineering Principles

- Prefer minimal, scoped, production-safe changes.
- Preserve existing architecture and folder boundaries.
- Fix root causes; avoid superficial patches.
- Keep code strongly typed; avoid widening types unnecessarily.
- Avoid introducing new dependencies unless there is clear value.

## Folder Conventions (Strict)

- Keep `app/(auth)` for authentication pages and `app/(dashboard)` for protected pages.
- Keep route-level concerns colocated with route segments; avoid cross-domain coupling.
- Keep shared shell/layout components under `components/layout`.
- Keep all API clients and transport logic under `lib/api`; keep auth lifecycle under `lib/auth`.
- Keep reusable utility helpers in `lib/utils`; avoid domain business logic in generic utils.
- Keep cross-page UI state in `store`; avoid feature-specific server state in stores.
- Keep type contracts in `types/*` by domain (`auth`, `system`, `api`) and avoid duplicate type declarations.
- Keep tests centralized by context under `tests/domains/<domain>/**` with shared test helpers in `tests/shared/*`.
- Keep endpoint snapshot fixtures under `test_data/**`, mirroring API paths as nested folders ending in `response.json`.

## Coding Conventions (Strict)

- Use TypeScript-first patterns: explicit interfaces/types at module boundaries.
- Prefer named exports for shared modules; keep default exports only where framework-conventional.
- Keep functions focused and side-effect aware; isolate transformation logic from I/O.
- Avoid `any`; if unavoidable, isolate and document narrowly.
- Prefer early returns and guard clauses to reduce nested branching.
- Reuse shared constants from `constants/*`; avoid magic strings/values.
- Keep API interactions typed end-to-end (request config, response shape, normalized errors).
- Preserve existing naming style and avoid one-letter variable names.

## UI and Layout Rules (Strict)

- Use semantic HTML for text: `h1`, `h2`, `p`, `span`, `label`, etc.
- Do not use text wrapper typography APIs for standard text blocks.
- Prefer Ant Design over native interactive HTML elements for functional UI. Default to Ant Design for `button`, `input`, `select`, `textarea`, dropdown, menu, modal, popover, table, tabs, pagination, date/time picker, upload, feedback, and similar controls unless Ant Design cannot satisfy the requirement.
- Use Ant Design components for functional UI elements and interactions by default: buttons, inputs, selects, menus, popovers, modals, tables, tabs, pagination, feedback, and similar controls.
- Use Ant Design `Layout` primitives (`Layout`, `Sider`, `Header`, `Content`, `Footer`) for page and app-shell structure.
- For layout composition, prefer Ant Design `Layout` for shells and Tailwind flex/grid utilities for internal structure; do not use native layout hacks where Ant Design layout primitives are appropriate.
- Do not use Ant Design grid/helper layout wrappers such as `Row`, `Col`, or `Space` for page composition; use Tailwind utilities and CSS flex/grid for internal layout.
- Prefer Tailwind for spacing, alignment, typography composition, and non-functional visual styling around Ant Design components.
- Avoid ad-hoc CSS unless utilities cannot satisfy the requirement.

## Routing and Boundary Rules

- Keep auth screens under `app/(auth)`.
- Keep protected screens under `app/(dashboard)`.
- Respect existing shared-layout responsibilities in `components/layout` and `providers`.

## API and Security Rules

- Use `lib/api` abstractions (`axios.ts`, `api-client.ts`, `error-handler.ts`).
- Do not bypass shared API behavior with scattered raw `fetch` calls.
- Preserve HMAC and auth header logic; do not weaken signing flows.
- Do not store tokens in Zustand or localStorage.
- For API snapshot mocking, reuse `lib/api/mock-data.ts`; do not introduce alternate endpoint-to-file mapping logic.

## State Management Rules

- Use TanStack Query for backend data fetching, caching, retries, invalidation.
- Use Zustand for cross-page client/UI state only.
- Keep query keys stable and predictable; colocate by domain when possible.

## Testing and Quality Expectations

- Place tests in centralized domain folders under `tests/domains/*`.
- Reuse setup and helpers in `tests/setup/*` and `tests/shared/*`.
- Prefer deterministic tests with explicit mocks and clear assertions.
- Use `test_data/**` for endpoint-level JSON fixtures when backend-driven flows need stable mock payloads.
- Derive fixture paths from the cleaned endpoint URL, e.g. `/api/v1/auth/login/` -> `test_data/api/v1/auth/login/response.json`.
- Read and save endpoint snapshots through the existing helpers and routes: `readEndpointMock`, `saveEndpointMock`, `GET /api/test-data/read`, and `POST /api/test-data/save`.
- Treat mock snapshot reads and writes as non-production-only behavior; do not rely on `app/api/test-data/*` routes for production features.
- Keep saved snapshots pretty-printed JSON and preserve the existing `response.json` filename convention for endpoint mocks.
- Keep each PR quality-gated with:
  - `npm run check-types`
  - `npm run check-lint`
  - `npm run check-format`
  - `npm test`

## Change Scope and PR Hygiene

- Keep features/fixes focused; avoid opportunistic refactors.
- Maintain naming consistency and existing module conventions.
- Update docs/templates when introducing process or structure changes.
