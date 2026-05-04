# Public Demo Link Design

## Purpose

This project should be shareable through a public URL so reviewers can open the app and try the core DURE flows without cloning the repository, installing Docker, or receiving local environment files.

The demo experience is for product validation and stakeholder review, not production operations. It should feel like a real app with realistic sample data while keeping credentials, service-role access, email sending, and storage costs controlled.

## Current Context

The app is a Next.js 15 App Router project with Supabase Auth, Supabase/Postgres-compatible database access through Drizzle, and Tailwind UI. The current project documentation describes the MVP as local-first, with Vercel and Supabase already selected as the eventual hosting path.

Today, a new user must clone the repository, create `.env.local`, start PostgreSQL locally, run migrations, and start the dev server. A public demo changes the goal from local onboarding to hosted demo readiness.

## Target Experience

A reviewer receives a Vercel URL and can try the app immediately.

The first screen keeps the existing product landing experience and adds a clear demo entry point. The demo entry point takes the reviewer to a preconfigured demo account flow. After demo login, the reviewer lands in the organization admin dashboard with realistic organization data already present.

The demo account has the `organization_admin` role and belongs to one demo organization. It can view and exercise the main MVP surfaces:

- dashboard
- operations settings
- users and invite management
- session creation and management
- records browsing and detail views
- teacher-facing sessions when using a teacher demo account later

The first implementation will include only the organization admin demo account. A teacher demo account can be added after the admin flow is stable.

## Recommended Architecture

Use Vercel for the Next.js app and a dedicated Supabase project for the public demo environment.

The demo environment has its own Supabase Auth users and its own Postgres database. It must not reuse a developer's local database or a future production database. Vercel stores the public Supabase URL/key and server-only secrets as environment variables.

Seed data is created by a repeatable script. The script creates or updates the demo auth user, app user row, organization, membership, village, program, classes, participants, sessions, attendance records, and lesson journals. Re-running the script should refresh the demo baseline without creating duplicate organizations or duplicate demo users.

## Environment Variables

Required existing variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

New demo variables:

```env
NEXT_PUBLIC_DEMO_ENABLED=
NEXT_PUBLIC_DEMO_EMAIL=
DEMO_PASSWORD=
DEMO_ORGANIZATION_SLUG=
```

`NEXT_PUBLIC_DEMO_ENABLED` controls whether demo UI appears. It should be enabled for the Vercel demo project and disabled or omitted for normal local/product environments.

`NEXT_PUBLIC_DEMO_EMAIL` is public because the demo login UI may display it or use it client-side.

`DEMO_PASSWORD` is server-only where possible. If the first implementation autofills the login form instead of server-side demo login, the password must be treated as a demo-only credential and never reused outside the public demo environment.

`DEMO_ORGANIZATION_SLUG` gives the seed script a stable organization lookup key.

## Demo Login Design

The simplest reliable first version is an assisted login:

1. Home shows `데모로 체험하기` when `NEXT_PUBLIC_DEMO_ENABLED=true`.
2. Clicking it opens `/login?demo=1`.
3. The login form detects `demo=1`, pre-fills the demo email, and displays demo-specific helper copy.
4. The reviewer submits the form using the demo password provided in the UI or copied from a controlled demo note.

If a server-side demo login route is added later, the button can become one-click login without changing the seed data model.

This avoids introducing a server route that handles passwords before the hosted environment and abuse controls are verified.

## Demo Seed Data

The seed script should create a compact but meaningful scenario:

- organization: `DURE Demo Center`
- primary village: `햇살마을`
- programs: `돌봄 문해`, `생활 디지털`
- classes: `문해 기초 A`, `스마트폰 생활반`
- participants: 8-12 realistic participant names across classes
- sessions: a mix of pending and submitted sessions across recent dates
- attendance records: present, absent, late, and excused examples
- lesson journals: short Korean notes for submitted sessions

The data should be enough for dashboards, records, and session details to look populated without requiring a large fixture system.

## Safety And Operations

The public demo must use a dedicated Supabase project.

The service-role key stays only in Vercel server environment variables and local operator `.env.local` files. It is never committed.

Email sending and storage upload should remain disabled unless explicitly configured. If enabled later, demo environments should use sandbox-safe credentials and size limits.

If reviewers modify demo data, maintainers can re-run the seed script to restore the baseline. A destructive reset script is not part of the first version; the seed script should be safe enough to run repeatedly.

## Implementation Boundaries

This design includes:

- demo environment variable support
- demo seed script
- package script for seeding demo data
- home/login demo entry UI
- documentation for Vercel and Supabase setup
- focused tests for demo environment parsing and login prefill behavior

This design does not include:

- a production deployment process
- tenant billing or real customer onboarding
- public write-rate limiting beyond the existing app behavior
- automatic scheduled demo reset
- one-click server-side password login
- teacher demo account

## Testing Strategy

Unit tests should cover demo environment parsing and UI behavior where practical. Existing auth and routing tests continue to protect post-login redirects.

Manual verification should cover:

- demo UI hidden when `NEXT_PUBLIC_DEMO_ENABLED` is omitted
- demo UI shown when `NEXT_PUBLIC_DEMO_ENABLED=true`
- `/login?demo=1` pre-fills the demo email
- demo account reaches `/dashboard` after login
- seeded dashboard, records, settings, users, and sessions pages render populated states

## Deployment Checklist

1. Create a dedicated Supabase project for demo.
2. Add required Supabase and database variables to Vercel.
3. Add demo variables to Vercel.
4. Run migrations against the demo `DATABASE_URL`.
5. Run the demo seed script against the demo environment.
6. Deploy to Vercel.
7. Open the public URL and verify the demo path.
