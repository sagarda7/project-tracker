# Construction Project Tracker

A production-ready construction project tracking dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, and Auth.js.

## Features

- Public marketing site (`/`) with a Nepali-language homepage, About Us, and Contact pages
- **Gunaso (complaint) module**: anyone can publicly file a complaint with photo/document attachments and Nepal-address fields, receive a 5-character tracking code, and check its status/notes later at `/gunaso/track` — no login required
- Internal "Gunaso" dashboard section (login required) to review complaints, update status (Pending → Accepted → In Action → Forwarded → Resolved), and add staff notes
- Role-based authentication (Admin / User) with credentials login
- Dashboard with stats, status/monthly charts, overdue alerts, upcoming deadlines
- Project CRUD with cascading Province → District → Municipality → Ward location fields, image gallery, follow-up timeline, and status history
- Contractor directory linked to projects
- Admin-only user management, settings, and CSV import/export
- English / Nepali language switcher (`EN | नेपाली`) in the internal dashboard
- Local file storage for uploaded images and complaint attachments (swappable for S3 — see `lib/storage.ts`)

## Tech Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Prisma · SQLite · Auth.js (NextAuth v5) · Zod · React Hook Form · Lucide React · react-day-picker · Recharts · PapaParse

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> Prefer yarn? `yarn install && npx prisma migrate dev && npm run db:seed && yarn dev` — the Prisma CLI is invoked with `npx` either way since it isn't a long-running dev dependency you'd want yarn-managed globally.

### Default accounts (seeded)

| Role  | Email             | Password  |
| ----- | ------------------ | --------- |
| Admin | admin@example.com | admin123  |
| User  | user@example.com  | user123   |

The seed script also creates 4 sample contractors, 9 sample construction projects across different statuses/provinces, a handful of follow-up notes, and 3 sample Gunaso complaints across different statuses.

## Environment Variables

Copy `.env.example` to `.env` (already present for local dev) and adjust as needed:

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-string"   # required in production
NEXTAUTH_URL="http://localhost:3000"
```

Generate a strong `AUTH_SECRET` with `npx auth secret` or `openssl rand -base64 32`.

## Database Scripts

```bash
npm run db:migrate   # create/apply a migration (prisma migrate dev)
npm run db:seed      # run prisma/seed.ts
npm run db:reset      # drop, recreate, migrate, and reseed the database
npm run db:studio     # open Prisma Studio to browse data
```

## Project Structure

```
app/
  (public)/                Public site, no login required — Nepali-only, no i18n switcher
    page.tsx                 Homepage ("/")
    about/, contact/
    gunaso/                   Public complaint submission form
    gunaso/track/             Public tracking lookup by code
  (auth)/login/            Login page
  (app)/                   Authenticated app shell (sidebar + top nav)
    dashboard/
    projects/  [new, [id], [id]/edit]
    complaints/  [id]        Internal "Gunaso" review — status updates, staff notes
    contractors/  [new, [id], [id]/edit]
    users/  [new, [id]/edit]           Admin only
    settings/  [import]                Admin only
    profile/
  api/
    auth/[...nextauth]/     Auth.js route handlers
    export/{projects,contractors}/  CSV export route handlers
components/                Reusable UI, layout, and feature components
  public/                   Public-site-only header/footer/forms (plain Nepali text, no i18n)
  complaints/               Internal Gunaso review components (status update, notes, history)
lib/
  actions/                 Server Actions (create/update/delete/status/CSV import/complaints)
  validations/             Zod schemas
  data/                    Read-side query helpers (dashboard, project list)
  i18n/                    Locale resolution + dictionary loading (internal dashboard only)
  storage.ts               Local file storage (swap for S3 by re-implementing StorageProvider)
  tracking-code.ts         5-character complaint tracking code generator
  locations.ts             Sample Nepal province/district/municipality data
prisma/
  schema.prisma
  seed.ts
messages/{en,ne}.json       Translation dictionaries (internal dashboard only)
public/uploads/             Uploaded project images, follow-up proofs, and complaint attachments (dev storage)
public/samples/             CSV import templates
public/rsp_banner.svg       Public homepage hero image
```

## Authorization Model

- `proxy.ts` (Next.js 16's route-protection convention, formerly `middleware.ts`) allows unauthenticated access to the public site (`/`, `/about`, `/contact`, `/gunaso*`, `/login`, static assets), redirects everything else to `/login` when unauthenticated, and blocks non-admins from `/users` and `/settings` at the routing layer.
- Every Server Action independently re-checks the session via `requireUser()` / `requireAdmin()` in `lib/auth-helpers.ts` — route-level checks alone are not treated as sufficient, since Server Action calls can bypass proxy matchers. Public complaint submission/tracking actions (`submitComplaintAction`, `trackComplaintAction`) intentionally skip this check; all other complaint actions (status updates, staff notes) require a signed-in session.
- Only admins can delete projects, manage users, access Settings, and import CSV files, enforced server-side, not just via hidden buttons.

## Notes on Image Storage

Images are stored under `public/uploads/{projects,followups}` in development, with metadata (path, MIME type, size, caption) recorded in the database. To move to S3 or another provider, implement the `StorageProvider` interface in `lib/storage.ts` and swap the exported `storage` instance — no calling code changes.

## Notes on Location Data

`lib/locations.ts` ships a representative sample of Nepal's Province → District → Municipality hierarchy (enough to exercise the cascading selectors end-to-end). Replace the `NEPAL_LOCATIONS` array with a complete dataset when available; the shape (`Province[]` with nested `districts`/`municipalities`) is unchanged.

## Docker Deployment (MySQL)

Local development stays on SQLite; Docker runs the app against **MySQL/MariaDB** for staging and production, connecting to an **existing** MySQL server rather than bundling its own — this setup assumes you already run one (e.g. a shared `mariadb` container alongside other sites). This needs two Prisma schema files because Prisma's datasource `provider` must be a literal string — one schema can't target both databases:

- `prisma/schema.prisma` — SQLite, used for local dev (`npm run dev`, `db:migrate`, `db:seed`, `db:studio`). Unchanged.
- `prisma/schema.mysql.prisma` — MySQL, used only inside the Docker build. Same models, plus `@db.Text` on free-form fields (descriptions, notes, comments) that would otherwise be truncated by MySQL's default 191-character `VARCHAR`, and `binaryTargets` covering the Alpine (musl) runtime. **Keep both files in sync by hand when you change a model.**

### Layout

```
docker/
  production/
    Dockerfile               Alpine, multi-stage, Next standalone output
    docker-compose.yml       Single "app" service, joins your existing shared network
    .env.production          Real values — gitignored, never committed
    .env.production.example  Committed placeholder
  staging/
    (same shape, separate container/port/database)
Makefile                     make build/start/stop/logs-{staging,production}, db-push/db-seed
```

Each environment builds its own image and runs as a single `app` container — no MySQL container is created; it joins the Docker network your existing MariaDB/MySQL container is already on.

### 1. Find your shared network name

```bash
docker network ls
```

Look for the network your existing `mariadb` stack created (its compose project name + `_shared_network`). Put that value into `SHARED_NETWORK_NAME` in `docker/production/.env.production` (and `docker/staging/.env.staging`).

### 2. Make sure the database exists

Prisma will create tables but not the database itself. Create it once (via phpMyAdmin, or `docker exec -it mariadb mysql -uroot -p`):

```sql
CREATE DATABASE rspchitwan;
-- staging should be a separate database so testing can never touch production data:
CREATE DATABASE rspchitwan_staging;
```

Recommended: create a dedicated user scoped to just this app's database(s) instead of using `root` for the app's runtime connection:

```sql
CREATE USER 'rspchitwan_app'@'%' IDENTIFIED BY 'a-strong-password';
GRANT ALL PRIVILEGES ON rspchitwan.* TO 'rspchitwan_app'@'%';
GRANT ALL PRIVILEGES ON rspchitwan_staging.* TO 'rspchitwan_app'@'%';
FLUSH PRIVILEGES;
```

`docker/production/.env.production` currently connects as `root` (carried over from values already set up) — swap in the dedicated user's credentials in `DATABASE_URL` when convenient; `root` access from this app means a compromise of this app is a compromise of every database on that MariaDB instance, including the WordPress sites.

### 3. Configure environment variables

```bash
cp docker/production/.env.production.example docker/production/.env.production   # if it doesn't already exist
cp docker/staging/.env.staging.example docker/staging/.env.staging
```

Fill in `SHARED_NETWORK_NAME`, `DATABASE_URL`, `AUTH_SECRET` (generate with `openssl rand -base64 32`), and `NEXTAUTH_URL` (the real domain this environment will be served from — NextAuth's redirects depend on this being correct).

### 4. Build, sync the schema, and start

```bash
make build-production
make db-push-production   # first run: creates tables in the existing database
make db-seed-production   # optional — inserts default admin/user + sample data; idempotent
make start-production
make logs-production      # follow logs
make stop-production      # stop
```

Same targets exist with `-staging` instead of `-production`. `db-push`/`db-seed` build the Dockerfile's intermediate `builder` stage (which has the full toolchain) into a throwaway image and run one-off `prisma`/seed commands against it — the runtime image itself is a slim Next.js standalone build and doesn't carry the Prisma CLI.

The app listens on port 3001 (production) / 3002 (staging) on the host — put a reverse proxy (nginx, Caddy, etc.) in front for a real domain + HTTPS; that's not set up here since it depends on how the rest of that server is already proxied.

### On `db push` vs. migrations

`db-push-production`/`db-push-staging` use `prisma db push`, which syncs the schema directly without a versioned migration history — simplest for getting this running, but it can accept destructive changes on an existing database if you're not careful about what changed. Once there's real data worth protecting, switch to tracked migrations instead:

```bash
# one-time, from a machine that can reach the database:
npx prisma migrate dev --schema=prisma/schema.mysql.prisma --name init
# commit the generated migrations folder, then use `prisma migrate deploy` in its place.
```

### Local MySQL scripts (outside Docker)

If you want to point your local dev machine at a MySQL instance instead of SQLite for a one-off test:

```bash
npm run db:generate:mysql   # prisma generate --schema=prisma/schema.mysql.prisma
npm run db:push:mysql       # prisma db push --schema=prisma/schema.mysql.prisma
npm run db:studio:mysql     # prisma studio --schema=prisma/schema.mysql.prisma
```

Remember to run `npx prisma generate` (no flag) afterward to switch the generated client back to SQLite for local dev.
