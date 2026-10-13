# modules/

Feature-sliced modular architecture for upcoming features.

Each feature/module is self-contained in its own folder (e.g.
`modules/compensation-event/`) with its own `components/`, `hooks/`, `services/`,
`types/`, `utils/`, and `constants/` folders.

This is the target architecture for all **new** features. Existing code under
`components/module/` and `hooks/modules/` is left untouched for now and will be
migrated incrementally.
