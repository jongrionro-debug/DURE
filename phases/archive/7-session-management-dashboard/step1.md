# Step 1: session-teacher-action

## Read First
- `src/server/services/session-management.ts`
- `src/server/actions/memberships.ts`

## Task
Start by adding or updating a failing action or service test for session-level teacher assignment.

Then add a server action that assigns or clears a session teacher. Only approved teachers in the same organization may be assigned.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the action change and pass afterward.

## Forbidden Actions
- Do not require class-level teacher assignment for session-level assignment. Reason: this flow supports late assignment.
