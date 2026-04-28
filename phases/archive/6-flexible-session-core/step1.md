# Step 1: nullable-teacher-migration

## Read First
- `src/lib/db/schema.ts`
- `drizzle/meta/_journal.json`

## Task
Start by adding or updating a failing test that proves sessions without `teacherId` are rejected by the current flow.

Then make `sessions.teacher_id` nullable in Drizzle schema and add a migration that drops the NOT NULL constraint.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the schema change and pass afterward.

## Forbidden Actions
- Do not create placeholder teacher rows. Reason: unassigned sessions are represented by null.
