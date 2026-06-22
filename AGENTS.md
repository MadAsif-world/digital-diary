# AGENTS.md — Digital Diary

Context for AI agents working in this repo. Read this first.

## What this is

**Digital Diary** is a premium, dark-mode personal planner for phone, tablet, and web,
built with Expo (SDK 54) + expo-router. Mobile-first and offline-first, with cloud sync
planned for later. Aesthetic: near-black surfaces, gold accents, a red "Love Meter",
uppercase wide-tracked labels.

- **Repo:** `origin` → https://github.com/MadAsif-world/digital-diary.git (branch `main`)
- **On-disk folder:** `c:\Users\AMP PC\aura-planner` (folder name is legacy; the product/package is `digital-diary`).
- The app was rebranded from "Aura Planner" → "Digital Diary". Don't reintroduce "Aura"
  in user-facing strings.

## Commands

```bash
npm start          # expo start (dev server / Metro)
npm run web        # run in browser
npm run android    # run on Android
npm run ios        # run on iOS
npm run typecheck  # tsc --noEmit
```

Always run `npm run typecheck` before committing.

> ⚠️ Do NOT add `eslint` / `eslint-config-expo` to dependencies. They pull in
> `unrs-resolver`'s platform-specific WASM bindings (`@emnapi/*`), which don't
> lock cleanly across OSes and break EAS's `npm ci --include=dev` on Linux. If
> you need to lint, run it without committing those deps to package.json.

## Tech stack

- **Expo SDK 54**, React Native 0.81, React 19
- **expo-router 6** — file-based routing (the `app/` directory)
- **NativeWind 4** (Tailwind for RN) — styling via `className`; mirrors `tailwind.config.js`
- **Zustand 5** — state management (`src/store/*`)
- **expo-sqlite** — local persistence (native); in-memory adapter on web
- **react-hook-form**, **expo-notifications**, **react-native-reanimated**

## Project structure

```
app/                       # expo-router screens (file = route)
  _layout.tsx              # root: providers, DB init via useAppStore, splash, AppShell
  index.tsx                # "/" dashboard / personal hub
  priorities|todo|reminders|bills|shopping|notes|health|meals|love|schedule|settings.tsx
src/
  components/
    AppShell.tsx           # responsive frame: phone=BottomNavigation, tablet=SidebarNavigation
    nav/BottomNavigation.tsx   # phone: 4 tabs + a "+" that opens the module picker
    nav/ModulePicker.tsx       # phone: full-screen arc wheel of all modules (opened by "+")
    nav/SidebarNavigation.tsx  # tablet: wider labelled sidebar
    Screen.tsx, PlannerCard.tsx, SectionHeader.tsx, LuxeText.tsx, AppIcon.tsx, ... (shared UI)
    index.ts               # barrel export for components
  constants/modules.ts     # SINGLE SOURCE OF TRUTH for modules (routes, icons, accents, labels)
  db/
    database.ts            # db() singleton + initDatabase(); native SQLite vs web adapter
    schema.ts, types.ts    # table SQL + schema version; TS row types
    repository.ts, repositories.ts  # generic repo + per-table repos (getOrCreate/update/first)
    webdb.ts               # in-memory SQLite-shaped adapter for web
    sync.ts                # (cloud sync, future)
  store/                   # zustand stores: app, day, tasks, bills, notes, reminders, shopping, events
  hooks/                   # useAccent, useDayScreen
  lib/                     # date.ts (dayKey), id.ts (uuid/nowIso), responsive.ts (useBreakpoint)
  notifications/           # index.ts + index.web.ts platform split
  theme/                   # colors.ts, tokens.ts, index.ts
```

## Architecture conventions

- **Routing:** add a screen by creating `app/<name>.tsx`. Register it in
  `src/constants/modules.ts` (`MODULES`) so it appears in navigation — that file is the
  source of truth for route, icon, accent, and labels. Both nav rail and sidebar map over it.
- **Data flow:** screens → zustand store action → repository → `db()`. The DB is initialized
  once in `app/_layout.tsx` via `useAppStore.init()`; screens read from stores, never call
  the DB directly.
- **Web vs native:** never assume native SQLite — `database.ts` swaps in `webdb.ts` on web.
  Use `Platform`-specific files (`*.web.ts`) for platform splits (see `notifications/`).
- **Styling:** prefer NativeWind `className`. When className isn't ergonomic (icon tint,
  native pickers, SVG, gradients, inline `style`), import tokens from `src/theme`
  (`colors.gold`, `colors.love`, etc.). Keep `colors.ts` and `tailwind.config.js` in sync.
- **Accents:** `gold` is the default accent; `love` (red) is reserved for the Love Meter.
  `useAccent()` resolves the active accent.
- **IDs/dates:** use `uuid()`/`nowIso()` from `src/lib/id.ts` and `dayKey()` from
  `src/lib/date.ts`. Day-scoped modules share `selectedDayKey` in the app store.

## Design system (theme/colors.ts)

- Surfaces: `bg #111`, `bgDeep #0C0C0C`, `card #1E1E1E`, `elevated #2A2A2A`, `border #333`
- Ink: `ink #FFF`, `inkMuted #A8A8A8`, `inkFaint #6E6E6E`
- Accents: `gold #D9C84E`, `love #D7263D`, `success #4ECB9A`, `warning #E0A458`
- Dark mode only (`userInterfaceStyle: dark`). Uppercase, wide letter-spacing for labels.

## Gotchas / do-not-break

- **Internal storage identifiers are intentionally NOT renamed** to avoid wiping existing
  device data: local DB file is `aura.db` (`src/db/database.ts`) and the web storage key is
  `aura.webdb.v1` (`src/db/webdb.ts`). Leave these unless doing a deliberate data migration.
- Phone navigation is the bottom tab bar + "+" module picker wheel; tablet is the
  labelled sidebar. There is no `menu.tsx` screen or left icon rail anymore.
- Keep `MODULES` and the actual `app/*.tsx` files in sync (every module needs both).
- This is `private: true`, not published to npm.
