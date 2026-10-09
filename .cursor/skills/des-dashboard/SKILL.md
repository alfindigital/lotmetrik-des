---
name: des-dashboard
description: >-
  Full context for Lotmetrik DES Dashboard (des.lotmetrik.my.id): lead-magnet
  site, funnel Telegram, update.bat workflow, cache bust, SEO /saham pages,
  retired reminder Worker. Use when working on DES, this repo, lotmetrik-des,
  funnel.js, or continuing after another AI session.
---

# DES Dashboard — Agent Skill

## First action

Read in order (repo root):

1. `HANDOFF.md` — long-form handoff (local-only, gitignored)
2. `AGENTS.md` — hard product rules

`CURSOR-HANDOFF.md` no longer exists — skip references to it in old docs.

Confirm briefly; do not change files until asked.

## Snapshot (9 Okt 2026)

- Live `?v=301` · funnel v3 → `t.me/lotmetrik` · Worker reminder **deleted**
- Site at repo ROOT — subfolder `des-flow-tool-v2/` removed 23 Sep; content commit `f7e1bc50`
- Push this repo (`lotmetrik-des`) to deploy Netlify
- Focus: **promotion**, not new features
- Semester update: `update.bat` + `RELEASE-PLAYBOOK.md`

## Hard rules (abbrev.)

- Free lead magnet forever — no paywall
- POJK 8/2025 criteria only
- Generate `saham/` via `_update/generate_saham.py`
- Bump cache `?v=` on asset changes
- No inline third-party scripts (CSP) — use `analytics.js` + `_headers`
- No DES prediction / buy-signal copy

Full rules: `AGENTS.md` (repo root). Full session log: `HANDOFF.md` (repo root, local-only).
