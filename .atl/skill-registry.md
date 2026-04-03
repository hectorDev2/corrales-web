# Skill Registry — corrales-web

## User Skills (global)

| Skill | Trigger |
|-------|---------|
| `branch-pr` | Creating a pull request, opening a PR, or preparing changes for review |
| `find-skills` | User asks "how do I do X", "find a skill for X", or wants to extend capabilities |
| `go-testing` | Writing Go tests, using teatest, or adding test coverage |
| `issue-creation` | Creating a GitHub issue, reporting a bug, or requesting a feature |
| `judgment-day` | "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar" |
| `skill-creator` | Creating a new skill, adding agent instructions, or documenting patterns for AI |

## SDD Skills (global)

| Skill | Trigger |
|-------|---------|
| `sdd-init` | Initialize SDD context in a project |
| `sdd-explore` | Investigate ideas before committing to a change |
| `sdd-propose` | Create a change proposal |
| `sdd-spec` | Write specifications with requirements and scenarios |
| `sdd-design` | Create technical design document |
| `sdd-tasks` | Break down a change into implementation tasks |
| `sdd-apply` | Implement tasks from the change |
| `sdd-verify` | Validate implementation matches specs |
| `sdd-archive` | Sync delta specs and archive a completed change |
| `sdd-onboard` | Guided SDD walkthrough |

## Project Convention Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Next.js agent rules — read `node_modules/next/dist/docs/` before writing code |
| `CLAUDE.md` | References AGENTS.md |

## Compact Rules

### From AGENTS.md
> This is NOT the Next.js you know. Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

### Stack Conventions
- Framework: Next.js 16.2.2 — App Router, TypeScript, Tailwind 4
- State: Zustand
- Forms: React Hook Form + Zod + @hookform/resolvers
- UI: shadcn/ui (Tailwind 4 mode), Sonner for toasts
- PWA: next-pwa
- Linter: ESLint flat config (eslint.config.mjs) — do NOT use .eslintrc
- Formatter: Prettier + prettier-plugin-tailwindcss
