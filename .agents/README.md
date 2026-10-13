# .agents — Project Standards for AI Agents

Single source of truth for how to build features in this repository.
Agents read these before writing code; humans can read them too.

- [architecture.md](./architecture.md) — modular folder structure for new features
- [coding-principles.md](./coding-principles.md) — principles, naming, UI rules, code review
- [skills/](./skills/) — installed tech-stack skills (SKILL.md per skill)

**Rule of thumb:** when in doubt, follow these docs over patterns found in
legacy code (`components/module/`, `hooks/modules/`). Legacy code stays as-is
and is migrated incrementally — new code follows the modular architecture.

## Installed skills

| Skill | Source | Stack |
| --- | --- | --- |
| `ant-design` | ant-design/antd-skill | Ant Design patterns & components (incl. v6) |
| `react-query` | mindrally/skills | React Query hooks, caching & mutations |
| `tailwind-4-docs` | lombiq/tailwind-agent-skills | Tailwind CSS v4 (used by legacy code) |
| `tailwind-design-system` | wshobson/agents | Tailwind design-system patterns |
| `nextjs-app-router-patterns` | wshobson/agents | Next.js App Router patterns |
| `vercel-react-best-practices` | vercel-labs/agent-skills | React/Next.js performance (Vercel) |
| `zustand` | lobehub/lobehub | Zustand store patterns |

Note: new feature modules are **raw antd only** (see `coding-principles.md`);
the Tailwind/React skills apply to legacy code and general React quality.
