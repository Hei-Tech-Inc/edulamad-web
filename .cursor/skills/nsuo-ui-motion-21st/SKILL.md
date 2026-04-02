---
name: nsuo-ui-motion-21st
description: >-
  Applies Nsuo frontend UI stack alongside UI/UX Pro Max — Framer Motion for
  animation, Lucide plus react-icons for icons, and @21st-sdk/react for agent
  chat UI. Use when building or polishing Nsuo UI, landing pages, dashboards, or
  interactive components in this repository.
---

# Nsuo UI — motion, icons, and 21st.dev

## Workflow

1. For design direction, follow `.cursor/skills/ui-ux-pro-max/SKILL.md` and run its `search.py` from the repo root when the user asks for UI/UX work.
2. Match Nsuo data and API rules in `.cursor/rules/nsuo-frontend.mdc` and `prompt.md` — types and endpoints from `contexts/api-docs.json` only.

## Libraries in this repo

| Concern | Package | Notes |
|--------|---------|--------|
| Motion | `framer-motion` | Springs, layout, reduced-motion awareness in UX-heavy flows |
| Icons (primary) | `lucide-react` | Prefer for app chrome and data UI |
| Icons (extra) | `react-icons` | Brands / MD / FA subsets when Lucide lacks a glyph |
| Agent/chat UI | `@21st-sdk/react` | Import package CSS when using exported components |

## Hydration-safe patterns (Pages Router)

- Do not render different markup on server vs first client render for animated wrappers.
- Defer motion until after mount when using scroll position, `window`, or random layout IDs, or use `initial={false}` on `motion` components.

## Anti-patterns

- Replacing Lucide wholesale with mixed icon families on the same screen without visual hierarchy.
- Heavy motion on tables or dense forms without user benefit.
- Adding 21st SDK styles globally if no 21st components are used on that page tree.
