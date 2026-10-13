# Coding Principles & Conventions

## Principles

- **SOLID** — one responsibility per file; depend on abstractions (hooks,
  services), not implementation details.
- **DRY** — single source of truth. Status labels/colors/options live in the
  module `constants/` and are reused by tags, tables, filters, and forms.
- **YAGNI** — build only what the current requirement needs; extend later.
- **Composition over inheritance** — small components compose into bigger ones.
- **Container/presentational** — containers own state & side effects;
  presentational components are props-in, callbacks-out.

## Naming conventions

- **Files & folders: kebab-case, always.** e.g. `compensation-event-list-page.tsx`,
  `use-compensation-events.ts`, `compensation-event.constants.ts`. No
  PascalCase/camelCase file names. (Export identifiers stay PascalCase — that's
  code, not file naming.)
- **Components:** PascalCase identifier, default export, one component per file.
- **Hooks:** `useGet<X>` for queries, `useCreate/Update/Delete<X>` for mutations.
- **Query keys:** export `<MODULE>_QUERY_KEY`; mutations invalidate it on success.
- **Services:** one `service` object per module (e.g. `compensationEventService`).

## UI rules

- **Raw antd only.** Never the X-wrappers (`ButtonX`, `InputX`, `CardX`,
  `TableX`, `ModalX`, …).
- **No Tailwind CSS, no custom CSS**, no inline styling beyond layout sizing
  (`style={{ width }}`).

## Comments

- **Minimal.** Prefer self-explanatory code. Use a one-liner only when something
  is non-obvious (API quirks, date conversions, loader decisions).
- No JSDoc boilerplate on every function/component.

## Code review

- Dependency direction respected — no `AUSPIRA`/service imports inside components,
  no cross-module imports (barrel-only).
- Kebab-case file names, raw antd, no dead code, no unused exports.
- `npx tsc --noEmit` must pass.
- New pure logic (utils/constants) should have Vitest unit tests.

## Tooling (enforced automatically)

- **Lint/format:** Biome (`biome.json`) — no ESLint, no Prettier.
- **Pre-commit:** lefthook (`lefthook.yml`) runs Biome **and**
  `scripts/check-staged.mjs` on staged files only (large files, kebab-case in
  `src/modules/`, one-line comments, module layering, `console.log`).
- **Commit messages:** conventional commits via `scripts/check-commit-message.mjs`
  (`<type>(<scope>): <subject>`).
