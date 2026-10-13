## Summary

- Problem and business/engineering impact.
- What changed (high level).
- Why this approach is safe.

## Scope and Boundaries

- [ ] Scoped and minimal (no unrelated refactors)
- [ ] Maintains existing architecture and module boundaries
- [ ] Public contract changes are explicitly documented
- [ ] New features follow the modular architecture (`src/modules/<feature>/`,
      import from the module root only, one-way deps `components → hooks → services`)

## Implementation Notes

- Key files touched:
- Key design decisions:
- Alternatives considered (if any):

## UI Checklist

- [ ] New module UI uses **raw Ant Design** (no `ButtonX`/`InputX`/`CardX` wrappers,
      no Tailwind, no custom CSS)
- [ ] Legacy-page changes keep existing conventions (semantic HTML, no typography
      wrappers for standard text, no Ant Design layout wrappers for page structure)
- [ ] Screenshots/GIF added for UI changes (if applicable)

## Routing / Data / State Checklist

- [ ] Route-group boundaries respected (`app/(auth)` vs `app/(dashboard)`)
- [ ] Protected routes registered in `PROTECTED_ROUTES` + middleware matcher
- [ ] Shared API layer in `lib/api` used (no scattered raw `fetch`)
- [ ] TanStack Query used for server state, Zustand for cross-page UI state only

## Quality Gates (run locally — lefthook enforces on staged files)

- [ ] `npm run check-types`
- [ ] `npm run test`
- [ ] Tests added/updated for behavior change
- [ ] Commit messages are conventional (`<type>(<scope>): <subject>`)

## Risk and Rollback

- Risk level: Low / Medium / High
- Main risk areas:
- Rollback plan:

## Follow-ups

- Any deferred tasks or known limitations.
