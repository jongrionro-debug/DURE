# Step 0: update-smoke-doc

## Read First
- `docs/LOCAL_SMOKE_TEST.md`
- `docs/ENV_SETUP.md`
- `docs/PRD.md`

## Task
Update the local smoke path to require a Supabase-backed local environment, `npm run db:migrate` before app startup, and a real `npm run dev` or `npm run dev:local` walkthrough.

The checklist must cover create-first sessions, later teacher assignment, participant addition, blocked empty-roster submission, successful submission after roster setup, post-submission participant addition, and teacher correction. Make the expected blocked states explicit so operators can distinguish product policy from regressions.

## Acceptance Criteria
```bash
npm run db:migrate
npm run test
npm run lint
npm run build
```

## Verification
- Start the app with `npm run dev` or `npm run dev:local` and complete the documented smoke checklist against working Supabase credentials.
- The smoke doc must explicitly name required environment variables and when migrations must run before dev.

## Forbidden Actions
- Do not make real email or deployment part of the smoke path. Reason: local MVP excludes them.
