# EventsOn

Personal Event planner (Next.js 16, MUI, Prisma 7, Auth.js v5, Postgres). Ukrainian UI. See `GLOSSARY.md` and `docs/adr/`.

## Run locally

Requires Node 24 and Docker.

```bash
cp .env.example .env        # fill in AUTH_SECRET and Google credentials
docker compose up -d --wait # Postgres (dev DB `eventson`, test DB `eventson_test`)
npm install                 # also runs `prisma generate`
npm run db:deploy           # apply migrations
npm run dev                 # http://localhost:3000
```

Missing or invalid environment variables stop the server at startup with a message listing them.

## Checks

```bash
npm run typecheck && npm run lint && npm run boundaries && npm test
```

Tests run against the real Postgres `TEST_DATABASE_URL` (migrations are applied automatically). CI runs the same checks with a Postgres service container. Module boundaries (ADR 0001) are enforced by dependency-cruiser (`.dependency-cruiser.cjs`).

## Layout

`src/app` (routes) -> `src/features/{auth,events}` (public entry points at the root, private `lib/`, `ui/`, `tests/`) -> `src/shared` (config, `Result`, i18n, db client, theme).
