# FixMyBaramati

FixMyBaramati is a mobile-first civic issue reporting platform for citizens of Baramati, Maharashtra.

## Current implemented scope

The project currently includes:
- Next.js App Router frontend
- Prisma-based PostgreSQL models for users, reports, and sessions
- user registration and login flows
- server-side session authentication
- protected dashboard and report submission pages
- public report listing and report details
- optional report photo uploads backed by a real object-storage abstraction

## Technology stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes
- Database: PostgreSQL via Prisma ORM
- Session auth: custom server-side session cookie flow using Prisma + bcryptjs
- Photo storage: Vercel Blob-compatible abstraction via `@vercel/blob`

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL database
- Vercel Blob token if photo uploads are enabled in your environment

## Environment variables

Create a local `.env.local` file from `.env.example` and fill in the required values.

Required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fixmybaramati?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="your_vercel_blob_read_write_token"
UPLOAD_MAX_BYTES="5242880"
NODE_ENV="development"
```

Notes:
- `.env`, `.env.local`, and `.env.*.local` are ignored by Git.
- Do not commit real secrets or production credentials.
- Report photos use Vercel Blob object storage; they are not written to the local filesystem or stored as base64 in PostgreSQL.
- Photo uploads are limited to 5 MB. `UPLOAD_MAX_BYTES` can lower the limit but cannot raise it.
- If `BLOB_READ_WRITE_TOKEN` is missing, photo submission returns a configuration error and does not create a report. Text-only reports remain available.
- The Blob integration is implemented, but live upload has not been verified in this environment because `BLOB_READ_WRITE_TOKEN` is unavailable. No production deployment is claimed.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000` in the browser.

## Languages

The interface supports English and Marathi. Use the language selector in the navigation to change languages; the preference is saved in the browser's local storage and does not require an account. Keep UI copy in the centralized dictionaries and translation helpers in `src/lib/i18n.tsx`. Citizen-entered report content and database/API status values are not translated.

## Prisma

```bash
npx prisma generate
npx prisma migrate deploy
```

For local database setup, make sure PostgreSQL is running and that `DATABASE_URL` points to a valid database.

## Production deployment prerequisites

For production deployment, the project needs:
- a managed PostgreSQL database
- a valid `DATABASE_URL`
- a real object-storage provider for uploaded report photos
- a valid `BLOB_READ_WRITE_TOKEN` or equivalent provider credentials
- a production-safe app URL via `NEXT_PUBLIC_APP_URL`

## Security and product notes

This project currently includes:
- bcrypt password hashing
- hashed session tokens in the database
- server-side session checks for protected routes
- image validation for supported upload types
- authenticated report creation based on the server session

This project does not claim to include:
- admin/authority dashboard
- role-based access control
- fake upvotes or simulated persistence
- pseudoproduct demo-only storage behavior
- production-ready deployment without the required infrastructure

## Commands

```bash
npm run dev
npm run build
npm run lint
npx prisma validate
```
