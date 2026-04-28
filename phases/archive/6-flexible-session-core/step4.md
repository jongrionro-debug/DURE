# Step 4: submission-empty-roster-guard

## Read First
- `src/server/services/submissions.ts`
- `src/components/teacher/session-workspace.tsx`

## Task
Start by adding or updating a failing submission test that proves an empty-roster session can still be submitted today.

Then prevent teacher submission while a session has zero participant snapshots and show clear guidance to wait for operator participant setup.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the submission guard and pass afterward.

## Forbidden Actions
- Do not relax final submission attendance validation. Reason: submitted records still need attendance rows.
