# Aura Planner

A premium, dark-mode **digital planner** for phone and tablet — built mobile-first,
offline-first, and ready for cloud sync later. Inspired by a luxury digital mobile
planner: near-black surfaces, gold accents, a red Love Meter, uppercase wide-tracked
labels, ruler-style sliders, and card-based planner pages.

> Not a generic productivity app — a planner experience. Each screen feels like
> writing onto a page, but stores clean structured data underneath.

---

## Stack

| Concern        | Choice |
| -------------- | ------ |
| Framework      | React Native + **Expo** (SDK 52) |
| Language       | **TypeScript** (strict) |
| Navigation     | **Expo Router** (file-based, typed routes) |
| Styling        | **NativeWind** (Tailwind) + a shared theme token layer |
| Local data     | **expo-sqlite** (local-first) |
| State          | **Zustand** |
| Forms          | **React Hook Form** (reminder/bill composers) |
| Notifications  | **expo-notifications** (local; push-ready abstraction) |
| Future sync    | **Supabase** (architecture in place, not yet wired) |

---

## Getting started

```bash
npm install
npm start            # then press i / a, or scan the QR with Expo Go
# or target a platform directly:
npm run ios
npm run android
npm run web
```

Requires Node 18+. On a phone, install **Expo Go** and scan the QR code.

Useful checks:

```bash
npm run typecheck    # tsc --noEmit
```

---

## Design system

Tokens live in [`src/theme`](src/theme) and are mirrored in
[`tailwind.config.js`](tailwind.config.js) so you can style with `className`
or reach the raw values from native components.

```
bg #111111 · card #1E1E1E · elevated #2A2A2A · border #333333
ink #FFFFFF · muted #A8A8A8 · faint #6E6E6E
gold #D9C84E (primary) · love #D7263D (Love Meter)
```

Reusable components ([`src/components`](src/components)): `AppShell`,
`SidebarNavigation`, `BottomNavigation`, `PlannerCard`, `SectionHeader`,
`EditableTextBlock`, `CheckboxRow`, `DateSwitcher`, `DateField`, `IconButton`,
`ProgressSlider`, `StatCard`, `ModuleTile`, `EmptyState`, `FloatingAddButton`,
`ReminderTimePicker`, `Screen`, `LuxeLabel`.

---

## Responsive layout

`useBreakpoint()` ([`src/lib/responsive.ts`](src/lib/responsive.ts)) drives one
codebase across form factors:

- **Phone (< 720px)** — single-column scroll of cards + a bottom tab bar.
- **Tablet (≥ 720px)** — persistent left **sidebar** + a 2-column dashboard grid.
- **Wide (≥ 1080px)** — 3-column dashboard grid.

`AppShell` swaps the navigation chrome; screens reuse the exact same data and logic.

---

## Routing

File-based via Expo Router. `app/_layout.tsx` boots the database and renders the
responsive `AppShell` (which hosts the active route through `<Slot/>`).

```
app/
  _layout.tsx     boot + providers + AppShell
  index.tsx       Dashboard — "Personal Hub"
  priorities.tsx  todo.tsx   reminders.tsx  bills.tsx
  shopping.tsx    notes.tsx  health.tsx     meals.tsx
  love.tsx        schedule.tsx              settings.tsx
```

The module registry ([`src/constants/modules.ts`](src/constants/modules.ts)) is the
single source of truth for titles, icons, accents, and routes — used by the sidebar,
bottom nav, dashboard tiles, and quick links.

---

## Data model (offline-first)

Models in [`src/db/types.ts`](src/db/types.ts); SQL in
[`src/db/schema.ts`](src/db/schema.ts). Tables: `user_settings`, `planner_days`,
`priorities`, `tasks`, `reminders`, `bills`, `shopping_lists`, `shopping_items`,
`notes`, `health_logs`, `meal_plans`, `love_entries`, `calendar_events`.

**Every synced row carries the same envelope** so it can be created offline now and
reconciled with Supabase later without migration:

```
id · localId · userId (nullable) · createdAt · updatedAt
deletedAt (soft-delete tombstone) · syncStatus: local | synced | pending | conflict
```

A generic [`Repository`](src/db/repository.ts) provides CRUD for all tables:
inserts stamp the envelope, updates bump `updatedAt` and flip clean rows to
`pending`, deletes are soft. Day-scoped data (priorities, health, meals, love)
keys off a `YYYY-MM-DD` day key so a planner page maps to a calendar day.

No login is required in the MVP. The sync seam lives in
[`src/db/sync.ts`](src/db/sync.ts) — today an offline no-op engine; Phase 4 swaps in
a Supabase-backed `SyncEngine` (push pending, pull-since with last-write-wins).

---

## Modules

Dashboard · Priorities · To-Do · Reminders · Bills & Payments · Shopping · Notes ·
Health & Fitness · Meal Plan · Love Meter · Monthly Schedule (+ Settings).

Highlights: inline editing everywhere, ruler sliders for Health, a heart-rating Love
Meter, a tappable month calendar with per-day events, multi-list shopping, and a
hub dashboard that aggregates the day across modules.

---

## Notifications

[`src/notifications/index.ts`](src/notifications/index.ts) wraps Expo **local**
notifications behind a transport-agnostic API (`scheduleReminder` / `cancelReminder`).
Reminders schedule one-shot, daily, or weekly triggers. When remote push is added,
only the implementation behind these functions changes — callers don't.

---

## Build order (roadmap)

- **Phase 1 ✅** — Project, routing, design system, dashboard, responsive layout, all module screens.
- **Phase 2 ✅** — SQLite schema, CRUD for Priorities/To-Do/Notes/Reminders, local notifications.
- **Phase 3 ✅** — Bills, Shopping, Health, Meal Plan, Love Meter, Monthly Schedule.
- **Phase 4 ⏳** — Supabase client + optional auth, swap in the real `SyncEngine`.
- **Phase 5 ⏳** — Onboarding, animations polish, app icon/splash assets, settings depth.

---

## Notes & next steps

- App icon / splash assets are intentionally omitted so the project runs without
  binary files; add them under `assets/` and re-reference in `app.json` before a build.
- `ProgressSlider` uses `PanResponder`; for buttery drags on lower-end devices you can
  later port it to Reanimated's gesture handler.
