# Construction Project Tracker

A production-ready construction project tracking dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, and Auth.js.

## Features

- Role-based authentication (Admin / User) with credentials login
- Dashboard with stats, status/monthly charts, overdue alerts, upcoming deadlines
- Project CRUD with cascading Province → District → Municipality → Ward location fields, image gallery, follow-up timeline, and status history
- Contractor directory linked to projects
- Admin-only user management, settings, and CSV import/export
- English / Nepali language switcher (`EN | नेपाली`)
- Local file storage for uploaded images (swappable for S3 — see `lib/storage.ts`)

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

The seed script also creates 4 sample contractors, 9 sample construction projects across different statuses/provinces, and a handful of follow-up notes.

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
  (auth)/login/            Login page (public)
  (app)/                   Authenticated app shell (sidebar + top nav)
    dashboard/
    projects/  [new, [id], [id]/edit]
    contractors/  [new, [id], [id]/edit]
    users/  [new, [id]/edit]           Admin only
    settings/  [import]                Admin only
    profile/
  api/
    auth/[...nextauth]/     Auth.js route handlers
    export/{projects,contractors}/  CSV export route handlers
components/                Reusable UI, layout, and feature components
lib/
  actions/                 Server Actions (create/update/delete/status/CSV import)
  validations/             Zod schemas
  data/                    Read-side query helpers (dashboard, project list)
  i18n/                    Locale resolution + dictionary loading
  storage.ts               Local file storage (swap for S3 by re-implementing StorageProvider)
  locations.ts             Sample Nepal province/district/municipality data
prisma/
  schema.prisma
  seed.ts
messages/{en,ne}.json       Translation dictionaries
public/uploads/             Uploaded project images and follow-up proof images (dev storage)
public/samples/             CSV import templates
```

## Authorization Model

- `proxy.ts` (Next.js 16's route-protection convention, formerly `middleware.ts`) redirects unauthenticated requests to `/login` and blocks non-admins from `/users` and `/settings` at the routing layer.
- Every Server Action independently re-checks the session via `requireUser()` / `requireAdmin()` in `lib/auth-helpers.ts` — route-level checks alone are not treated as sufficient, since Server Action calls can bypass proxy matchers.
- Only admins can delete projects, manage users, access Settings, and import CSV files, enforced server-side, not just via hidden buttons.

## Notes on Image Storage

Images are stored under `public/uploads/{projects,followups}` in development, with metadata (path, MIME type, size, caption) recorded in the database. To move to S3 or another provider, implement the `StorageProvider` interface in `lib/storage.ts` and swap the exported `storage` instance — no calling code changes.

## Notes on Location Data

`lib/locations.ts` ships a representative sample of Nepal's Province → District → Municipality hierarchy (enough to exercise the cascading selectors end-to-end). Replace the `NEPAL_LOCATIONS` array with a complete dataset when available; the shape (`Province[]` with nested `districts`/`municipalities`) is unchanged.
