# Scaffold risk outcomes (ticket #2)

Settles uncertainties #2, #3 and #5 from `auth-calendar-stack.md`. Verified 2026-10-13 on Node 24, Postgres 17, with the exact pinned versions.

## 1. Auth.js `PrismaAdapter` with Prisma 7: works

- Versions: `next-auth@5.0.0-beta.32`, `@auth/prisma-adapter@2.11.3`, `@prisma/client@7.10.0` + `@prisma/adapter-pg@7.10.0`, generator `prisma-client` with output `src/generated/prisma`.
- `PrismaAdapter(prisma)` accepts the Prisma 7 driver-adapter client unchanged (`src/features/auth/lib/adapter.ts`). TypeScript accepts it too.
- Smoke test `src/features/auth/tests/adapter.smoke.test.ts` runs, against a real Postgres, the calls Auth.js makes on a first Google sign-in under the JWT strategy: `getUserByAccount` (miss) -> `getUserByEmail` (miss) -> `createUser` -> `linkAccount`, then `getUserByAccount`/`getUser` hits. It also confirms:
  - Google users get a real `User` row with `passwordHash = null`, so `Event.ownerId` can reference them.
  - `getUserByEmail` finds a password user, which is what the account-conflict policy (ADR 0004) will use.
  - `Account (provider, providerAccountId)` uniqueness is enforced.
- Uncertainty #3 (dropping `Session`/`VerificationToken`): not tested. The models are kept as the Auth.js docs show them; with `strategy: "jwt"` they stay unused. Removing them is a later optimisation.
- Not covered by this smoke test: the full `signIn` round trip through Google (needs real OAuth credentials). Ticket 03 covers the Credentials side; the Google flow needs a manual check with real client credentials.

## 2. FullCalendar 7.1.2 refetch and callbacks: verified in the browser

Checked with a throwaway page (removed afterwards) that fetched events through a Server Action, in the Next 16.4 dev server.

- **Refetch API:** `ref.current.getApi().refetchEvents()` where `ref` is `useRef<CalendarRef>()` and `CalendarRef` is exported from `@fullcalendar/react`. After a mutation it re-invoked the `events` function and replaced the rendered events (the event title changed from v3 to v4). `CalendarApi` also has `getEventSources()[n].refetch()`. There is also a `useCalendarController()` hook (navigation and view changes only; it has no refetch).
- **Range fetch:** `events` may be an async function `(info: EventSourceFuncInfo) => Promise<EventInput[]>`. `info.startStr` / `info.endStr` are offset-aware ISO strings in the browser time zone (e.g. `2026-09-27T00:00:00+03:00` to `2026-11-08T00:00:00+02:00` for the October month grid), `end` exclusive, padded to whole weeks. Navigating next/prev and changing view triggered a new call.
- **Callbacks:** `dateClick` (needs the interaction plugin; `dateStr` = `2026-11-04`), `eventClick` (`info.event.id`) and `datesSet` fire as documented.
- **Gotcha 1 (real bug source):** the `events` function must have a **stable identity** (`useCallback`). An inline arrow function is seen as a new event source on every render, which refetches, which re-renders: an infinite loop ("Maximum update depth exceeded").
- **Gotcha 2:** callbacks (`events`, `datesSet`) can run during FullCalendar's render phase, so a direct `setState` inside them gives "Cannot update a component while rendering". Defer state updates (`setTimeout`/`startTransition`) or keep them in refs.
- **Gotcha 3:** `events={async (info) => ...}` is not inferred; annotate `info: EventSourceFuncInfo` (imported from `@fullcalendar/react`).
- **Setup that worked:** `import FullCalendar from "@fullcalendar/react"`; plugins from `@fullcalendar/react/daygrid`, `/timegrid`, `/interaction`, `/themes/classic`; CSS `@fullcalendar/react/skeleton.css`, `/themes/classic/theme.css`, `/themes/classic/palette.css`; the whole thing inside a file marked `"use client"`. `temporal-polyfill` is installed as a peer.
- **Server Actions:** the very first fetch in dev waits for the action to compile (seconds); afterwards calls were fast. Actions are dispatched one at a time, as documented, so the calendar wrapper must ignore stale responses (spec decision).

## 3. Other findings

- Next 16.4 runs `instrumentation.ts` `register()` at startup; throwing there stops the server with the validation message (used for the fail-fast environment check).
- `npx prisma` resolves to 7.10.0 because `prisma@7.10.0` is pinned as a devDependency (the npm `latest` tag is the 8 RC).
- Vitest 5.0.4 supports `resolve.tsconfigPaths: true`, so `vite-tsconfig-paths` is not needed.
- `next dev` writes an `AGENTS.md` block pointing to the bundled Next docs; it is committed.
- TypeScript is pinned to 5.9.3 (7.x is current on npm but untested with this toolchain).
