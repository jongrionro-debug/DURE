# Step 3: session-management-ui

## Read First
- `src/components/ops/dashboard-screen.tsx`
- `src/components/ops/session-management-screen.tsx`
- `src/app/(ops)/dashboard/sessions/[sessionId]/page.tsx`
- `src/components/records/record-detail.tsx`

## Task
Start by adding or updating a failing screen or route test that proves operators do not yet have a direct path to complete create-first sessions.

Then add `/dashboard/sessions/[sessionId]` for operator session management and link to it from dashboard and records surfaces.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the UI change and pass afterward.
- This step is the release-closing counterpart to phase 6. Keep both phases in the same rollout window.

## Forbidden Actions
- Do not merge operator management with the teacher submission workspace. Reason: the roles have different permissions.
