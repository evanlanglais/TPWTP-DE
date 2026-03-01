# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Park Predictor — a Nuxt 4 + Nuxt UI dashboard for visualizing theme park ride wait times. Connects directly to Supabase for all data (destinations, parks, attractions, wait_times tables).

## Commands

- **Dev server:** `npm run dev` (Nuxt dev server, http://localhost:3000)
- **Production build:** `npm run build` (outputs to `.output/`)
- **Preview build:** `npm run preview`
- **Lint:** ESLint via `@nuxt/eslint` module

No test framework is configured.

## Architecture

**Framework:** Nuxt 4 with Nuxt UI v4, Vite, Vue 3.5

**Data layer:** Supabase via `@nuxtjs/supabase`. Composables in `app/composables/` use `useSupabaseClient()` and `useAsyncData()`.

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

**Supabase schema:** `destinations` → `parks` → `attractions` → `wait_times` (partitioned by month)

**UI:** Nuxt UI v4 (dashboard components, forms, tables), Tailwind CSS v4, Lucide icons

**Deployment:** Azure Static Web Apps via GitHub Actions on push to `master`.

## Path Alias

`~/` maps to `app/` (Nuxt 4 default).
