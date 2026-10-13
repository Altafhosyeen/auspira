# Architecture — Modular Feature Slices

All **new** features live under `src/modules/` as self-contained feature slices.

## Folder structure

```
src/modules/
└── <feature>/                  # kebab-case, e.g. compensation-event
    ├── index.ts                # module barrel — the only public entry point
    ├── components/             # UI components (raw antd only)
    ├── hooks/                  # React Query hooks — data fetching & state
    ├── services/               # API calls via AUSPIRA
    ├── types/                  # domain models & DTOs
    ├── utils/                  # pure helper functions
    └── constants/              # module-owned endpoints, enums, labels
```

## Rules

1. **Dependency direction is one-way:** `components → hooks → services → AUSPIRA`.
   Components never call the API layer directly; they use hooks.
2. **Modules own their endpoints** in `constants/` — do not add to the shared
   `constants/api.constants.ts`.
3. **Barrel-only imports:** consumers import from the module root
   (`src/modules/<feature>`), never from deep internal paths.
4. **Reuse shared infrastructure:** `AUSPIRA` (`@/lib/api/auspira-api`),
   `buildUrl` (`@/lib/utils/request`), `IPaginatedApiResponse` (`@/types`) —
   reuse, don't re-implement.
5. **Reference implementation:** `src/modules/compensation-event/` — an end-to-end
   example (types → service → hooks → components → container).
6. **Per-module conventions** live in each module's own `README.md`; repo-wide
   rules live in this folder.
