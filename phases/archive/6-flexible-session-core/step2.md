# Step 2: unassigned-session-queries

## Read First
- `src/server/services/dashboard.ts`
- `src/server/services/records.ts`
- `src/server/services/sessions.ts`

## Task
Start by adding or updating a failing query/service test that proves unassigned sessions are hidden or mislabeled today.

Then use nullable teacher handling in operator session queries so sessions without teachers remain visible. Display missing teachers as `강사 미할당`.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the query change and pass afterward.

## Forbidden Actions
- Do not hide unassigned sessions from operator views. Reason: operators need to complete them later.
