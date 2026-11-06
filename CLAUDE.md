# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Knowledge (Xynon Brain)

Brain project: park-predictor
Brain repo: TPWTP-DE

Project goals, status, decisions, infrastructure and repo gotchas live in the Xynon Brain vault, not in this repo. This repo is one of several in the project.
- Start here: `Claude/Projects/park-predictor/index.md`
- This repo: `Claude/Projects/park-predictor/repos/TPWTP-DE.md`
- Decisions: `Claude/Projects/park-predictor/decisions.md`
- External context: `Claude/Projects/park-predictor/notes/`

## Project Overview

Park Predictor — a Nuxt 4 + Nuxt UI dashboard for visualizing theme park ride wait times. Server routes query Postgres directly with SQL (destinations, parks, attractions, wait_times tables).

## Commands

- **Dev server:** `npm run dev` (Nuxt dev server, http://localhost:3000)
- **Production build:** `npm run build` (outputs to `.output/`)
- **Preview build:** `npm run preview`
- **Lint:** ESLint via `@nuxt/eslint` module

No test framework is configured.

## Architecture

**Framework:** Nuxt 4 with Nuxt UI v4, Vite, Vue 3.5

**Data layer:** Postgres via `pg`. Routes in `server/api/` run parameterized SQL through `dbQuery()` (`server/utils/db.ts`), connecting with `NUXT_DATABASE_URL`. Composables in `app/composables/` call those routes with `useFetch()`/`useAsyncData()`.

**Charting:** Unovis (`@unovis/vue`, `@unovis/ts`) for timeseries charts. Chart components use `.client.vue` suffix for client-only rendering.

**Component hierarchy:**
```
app.vue (UApp wrapper)
└── layouts/default.vue (UDashboardGroup + UDashboardSidebar)
    ├── pages/index.vue (Live Wait Times — park selector + stats + table)
    ├── pages/parks/index.vue (Parks browser — searchable table)
    ├── pages/parks/[id].vue (Park detail — stats + attractions table)
    └── pages/explorer.vue (Data Explorer — multi-attraction chart)
        └── components/explorer/ExplorerChart.client.vue (Unovis chart)
```

**Shared components:** `ParkSelector.vue`, `StatusBadge.vue`, `WaitTimeDisplay.vue`

**Composables:**
- `useParks.ts` — `useDestinations()`, `useParks()`, `usePark()`, `useAttractions()`
- `useWaitTimes.ts` — `useLiveWaitTimes()`, `useHistoricWaitTimes()`, `useAttractionWaitTimes()`

**Database schema (hosted on Supabase):** `destinations` → `parks` → `attractions` → `wait_times` (partitioned by month)

**UI:** Nuxt UI v4 (dashboard components, forms, tables), Tailwind CSS v4, Lucide icons

**Deployment:** Azure Static Web Apps via GitHub Actions on push to `master`.

## Path Alias

`~/` maps to `app/` (Nuxt 4 default).
