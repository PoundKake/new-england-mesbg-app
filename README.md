# New England MESBG

A community site for the New England Middle-earth Strategy Battle Game (MESBG)
scene: a home page for finding local groups, an Events page (Google Calendar
embed + a link out to [Table Top Admiral](http://modular.tabletopadmiral.com/)
for brackets/army lists), and a photo Gallery.

See `.claude/plans` history or ask the maintainer for the original design
discussion — the short version: results/photos live in a self-hosted
PostgreSQL database exposed through PostgREST; the Nuxt app reads from it
directly and writes through an admin-only login + forms.

## Architecture at a glance

- **Nuxt 4** app (`app/`) — public pages plus an admin section gated by a
  JWT-based login.
- **PostgreSQL + PostgREST** — the database and its auto-generated REST API.
  Migrations live in `db/migrations/` and run automatically the first time
  the `db` container starts against an empty volume.
- **A few Nuxt server routes** (`server/api/`) for the two things that can't
  happen entirely client-side: signing the admin JWT after PostgREST verifies
  a password, and resizing/serving photo bytes (the `sharp` image library is
  Node-only).
- **Docker Compose** ties it together with **Caddy** as the reverse
  proxy/TLS terminator, plus a `pg-backup` container that periodically dumps
  the database (which holds both tournament history and the photo gallery).

Because results and photos live in a real database rather than static files,
this app needs a persistent server that can run Docker long-term (a small
VPS or home server) — it is not deployable as a static site.

## Local development (without Docker)

```bash
npm install
npm run dev
```

This runs the Nuxt app on `http://localhost:3000` against whatever
`NUXT_API_BASE_INTERNAL` / `NUXT_PUBLIC_API_BASE` point to — for real data you
still need a running Postgres + PostgREST (see below). Without them, public
pages render with empty states rather than crashing (each fetch is wrapped in
`useAsyncData`, which degrades to `null`/`[]` on failure).

## Full stack via Docker Compose

1. Copy `.env.example` to `.env` and fill in real values — in particular:
   - `POSTGRES_PASSWORD` / `AUTHENTICATOR_PASSWORD` — two different strong
     passwords.
   - `JWT_SECRET` — 32+ random bytes, e.g. `openssl rand -base64 48`. This
     must be identical to what PostgREST uses (docker-compose.yml wires the
     same value to both).
   - `DOMAIN` — the public domain Caddy will request a TLS certificate for.
   - `GOOGLE_CALENDAR_ID` — from the calendar's Settings → Integrate
     calendar → Calendar ID. **The calendar must be shared as public** ("See
     all event details") or the Events page embed will show nothing.
2. `docker compose up -d` — brings up Postgres, PostgREST, the Nuxt app,
   Caddy, and the backup job. On first boot, Postgres runs everything in
   `db/migrations/` once against the fresh volume.
3. Create your first admin account (there's no self-service admin sign-up —
   see `db/scripts/create_admin.sql` for why):
   ```bash
   docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
     -v username="'alice'" \
     -v display_name="'Alice Admin'" \
     -v password="'choose-a-strong-password'" \
     -f - < db/scripts/create_admin.sql
   ```
   Re-run with the same username later to rotate that admin's password.
4. Log in at `/admin/login`, create a season at `/admin/seasons`, then add
   event results at `/admin/results/new` and photos at `/admin/photos/new`.

### Schema changes after go-live

There's no migration framework — `db/migrations/` only runs against a fresh
volume. Apply later schema changes by hand:

```bash
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f - < db/migrations/000X_whatever.sql
```

### Content you'll want to fill in

A few placeholders are checked in on purpose, clearly marked, rather than
invented:

- `app/data/clubs.ts` — the home page's club/store directory.
- `app/data/communityLinks.ts` — Discord/Facebook links.
- `app/data/factions.ts` — MESBG legions; a starting list, not authoritative
  (Games Workshop adds/renames legions over time).

## Testing

```bash
npm run test        # Vitest — composables + component tests
npm run typecheck    # nuxt typecheck (vue-tsc)
npm run build        # production build (also run by the app's Dockerfile)
```

`npm run test` runs everything under the Nuxt-aware Vitest environment
(`@nuxt/test-utils`), since most of this app's logic lives in composables and
components that rely on Nuxt auto-imports.

Deliberately not covered by automated tests: full Postgres/PostgREST
integration (verify by hand against `docker compose up db postgrest` — the
SQL views/functions are simple enough to eyeball), and end-to-end browser
tests (no user flow complex enough yet to justify the setup cost).
