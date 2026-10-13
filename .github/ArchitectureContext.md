# Architecture Context

This repository is a production-grade admin frontend. Changes must preserve the existing architecture and security model.

## Runtime Stack

- Next.js App Router + React 19 + TypeScript strict mode
- NextAuth credentials flow and session handling
- Axios-based API layer with HMAC request signing
- TanStack Query for server state, Zustand for cross-page UI state
- Ant Design components with Tailwind utility-first layout

## System Constraints

- Treat app/runtime as stateless and serverless-friendly.
- Avoid global mutable auth state and token caches.
- Keep auth/session lifecycle within established auth utilities.
- Preserve existing behavior in `lib/auth/*` and `lib/api/*`.

## Auth and API Guardrails

- Do not store access/refresh/signing tokens in Zustand or localStorage.
- Keep centralized request concerns in `lib/api/axios.ts`:
  - auth header attachment
  - timestamp header (`X-HMAC-TS`)
  - HMAC signature header (`X-HMAC-Signature`)
  - JSON vs multipart handling
  - standardized API error mapping
- Keep URL normalization consistent with backend expectations via `lib/utils/urls.ts`.

## State and Data Boundaries

- TanStack Query: backend data, caching, retries, invalidation.
- Zustand: cross-page client state (UI/system-only state).
- Avoid duplicating server state into Zustand unless explicitly justified.

## UI Architecture Rules

- Use semantic HTML tags for text content and Tailwind classes for styling.
- Avoid typography wrappers for standard text blocks.
- Do not use Ant Design layout primitives for page composition.
- Keep route-group layout boundaries under `app/(auth)` and `app/(dashboard)`.

## Current Repository Structure (authoritative)

- `app/` route groups and API routes
- `components/layout/` shared app shells
- `hooks/` auth/cache/module hooks
- `lib/api/` request client, axios config, error handler, API wrappers
- `lib/auth/` auth and sign-out helpers
- `lib/utils/` shared browser/general/hmac/url utilities
- `providers/` auth/query/theme/settings/toast composition
- `store/` Zustand stores
- `types/` API/auth/system types
- `tests/` centralized and domain-separated testing suites

## Folder Standardization Rules

- Hybrid architecture: keep top-level technical boundaries (`app`, `lib`, `hooks`, `providers`, `store`, `types`) and use domain subfolders where they already exist (e.g., `hooks/auth`, `types/system`, `lib/api`).
- No bypassing boundaries: UI components should not directly implement transport logic.
- New modules should follow existing top-level boundaries before introducing new folders.
- If a new folder is required, prefer explicit domain/context names over generic names.
- Shared code must be framework-agnostic where possible and placed under `lib/*` or `tests/shared/*`.

## Coding Standardization Rules

- Strong typing at boundaries (API responses, store state, hook return types).
- Keep public APIs minimal and stable; avoid unnecessary re-exports.
- Side effects belong in dedicated layers (providers/hooks/api), not pure utility modules.
- Validate and normalize external data close to ingress points.
- Preserve existing lint/format/type contracts as non-optional quality gates.

## Forbidden Patterns

- Introducing alternative auth flows outside NextAuth utilities
- Scattered raw API access that bypasses `lib/api`
- Token persistence in client stores or local storage
- Unscoped refactors in feature/fix work
