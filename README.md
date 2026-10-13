# EventsOn

A personal Event planner: sign up (email and password, or Google), create Events, and view them in a month/week/day calendar or as a paged list, filtered by Importance and keyword. The UI is in Ukrainian.

Stack: Next.js 16 (App Router, Server Actions), MUI 9, FullCalendar 7, Prisma 7, Auth.js v5 beta, PostgreSQL 17, Vitest.

## Requirements

- Node.js 24 or newer (`engines` in `package.json`)
- Docker (for PostgreSQL, via Docker Compose)
- A Google OAuth client (only needed to try "Sign in with Google"; see below)

## Run locally

```bash
git clone https://github.com/KobelOleh/eventsOn.git
cd eventsOn
cp .env.example .env         # then edit .env, see "Environment variables"; do this first
npm install                  # also runs `prisma generate` (needs DATABASE_URL from .env) and installs the git hooks
docker compose up -d --wait  # PostgreSQL on localhost:5432
npm run db:deploy            # apply migrations to the dev database
npm run dev                  # http://localhost:3000
```

`docker compose up` creates two databases in one container: `eventson` (development) and `eventson_test` (used by the test suite, so tests never touch dev data). The container uses a named volume; `docker compose down -v` wipes it. If port 5432 is already taken, change the host port in `docker-compose.yml` and in both URLs in `.env`.

On Windows, port 3000 can fall into a range reserved by the system (`netsh interface ipv4 show excludedportrange protocol=tcp`). Then run `npm run dev -- -p 3100` and use `http://localhost:3100` (also in the Google redirect URI below, and in `AUTH_URL` if you set it).

The UI follows the system light/dark theme; the header toggle (also on the login and register pages) overrides it.

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable                               | Notes                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | Dev database. The default matches `docker-compose.yml`.                                                                         |
| `TEST_DATABASE_URL`                    | Test database. The default matches `docker-compose.yml`.                                                                        |
| `AUTH_SECRET`                          | Required, at least 16 characters. Generate with `npx auth secret` or `openssl rand -base64 32` and paste the value into `.env`. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional, set both or neither (empty counts as unset). Without them Google sign-in is disabled, see below.                      |
| `AUTH_TRUST_HOST`                      | Set to `true` when running `next start` (production build) on localhost or behind a proxy. `next dev` does not need it.         |

Missing or invalid variables stop the server at startup with a message listing them (values are never printed).

### Google OAuth credentials

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials) create an OAuth client ID of type "Web application".
2. Add the authorized redirect URI `http://localhost:3000/api/auth/callback/google`.
3. Put the client ID and secret in `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

Leave both empty to run without Google: the app starts and email/password sign-up and sign-in work; only the Google button fails.

## Commands

| Command                       | What it does                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                 | Dev server on http://localhost:3000                                                                                                                          |
| `npm run build` / `npm start` | Production build / serve it. Without `AUTH_TRUST_HOST=true` in `.env`, every `/api/auth/*` request fails with `UntrustedHost` (HTTP 500) when served locally |
| `npm test`                    | Vitest against the real Postgres in `TEST_DATABASE_URL`; migrations are applied automatically                                                                |
| `npm run lint`                | ESLint                                                                                                                                                       |
| `npm run typecheck`           | `tsc --noEmit`                                                                                                                                               |
| `npm run boundaries`          | dependency-cruiser: enforces module boundaries and forbids import cycles                                                                                     |
| `npm run format`              | Prettier (also run on staged files by the pre-commit hook)                                                                                                   |
| `npm run db:migrate`          | Create and apply a new migration in development (`prisma migrate dev`)                                                                                       |
| `npm run db:deploy`           | Apply existing migrations                                                                                                                                    |

Run all checks the way CI does:

```bash
npm run typecheck && npm run lint && npm run boundaries && npm test
```

The Husky pre-commit hook runs lint-staged, typecheck, lint, boundaries and the tests. Because the tests need Postgres, `docker compose up -d` must be running before you can commit.

## Architecture

- `src/app`: routes and layout. The only API route is the Auth.js handler; everything else is Server Actions.
- `src/features/{auth,events}`: feature modules with a small public surface at the root (`index.ts`, `actions.ts`) and private `lib/`, `ui/`, `tests/`. Inside a feature: Server Action (session and input validation) -> service (business rules) -> repository (the only code that touches Prisma).
- `src/shared`: config validation, `Result` type, Ukrainian strings, the db client, theme.

Decisions are recorded in `docs/adr/`:

- [0001](docs/adr/0001-feature-modules-with-layers.md): feature modules with action, service, repository layers
- [0002](docs/adr/0002-server-actions-only-and-jwt-sessions.md): Server Actions only, JWT sessions
- [0003](docs/adr/0003-authjs-v5-beta-pinned.md): Auth.js v5 beta, pinned
- [0004](docs/adr/0004-no-automatic-account-linking.md): no automatic account linking

Domain vocabulary (Event, Owner, Importance, Calendar view, List view) is in [GLOSSARY.md](GLOSSARY.md). Stack research and the results of the scaffold risk checks are in `docs/research/`.

## Known limitations

Accounts and auth:

- **No email verification.** Registration does not prove ownership of the email. This is why accounts are never linked automatically (ADR 0004).
- **No account linking.** If a Google sign-in and a password account share an email, sign-in is refused with a message naming the method to use. There is no "connect Google" flow.
- **No password reset** and no "change password".
- **No rate limiting** on sign-in, registration or any Server Action.
- **Auth.js v5 is beta** (`next-auth@5.0.0-beta.32`, pinned exactly). The Auth.js project has joined Better Auth and only promises security fixes, so a future migration is likely; all auth code lives in `src/features/auth` to keep that contained (ADR 0003).
- The Google sign-in round trip is not covered by automated tests (it needs real OAuth credentials); the adapter calls it makes are covered by a smoke test against Postgres. The unused `Session` and `VerificationToken` tables exist because Auth.js's Prisma schema includes them; sessions are JWTs.

Events and calendar:

- **Server Actions run one at a time** (a Next.js behaviour). The calendar therefore ignores stale responses, so fast navigation can briefly show the previous range's data until the latest request returns. The first request after `next dev` starts is slow while the action compiles.
- **Calendar range is capped at 100 days** per request (a six-week month grid is 42 days); larger ranges are rejected.
- **Calendar view, date and filters live in the URL via the browser History API** (`pushState` / `replaceState`) instead of Next navigation, to avoid a server round trip. Links with these query parameters are shareable, but the code does not use the Next router for them.
- **No API for other clients.** Server Actions are not a REST contract; a mobile client would need an API layer on top of the services (ADR 0002).
- Time is shown in the browser's time zone; there is no per-user time zone setting. Recurring Events, reminders and sharing are not implemented.

Development environment:

- **Docker Postgres is needed to commit**, because the pre-commit hook runs the tests.
- `next start` needs `AUTH_TRUST_HOST=true` outside Vercel.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` are optional, but must be set together.
