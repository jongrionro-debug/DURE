# Step 2: session-participant-action

## Read First
- `src/server/services/session-management.ts`
- `src/server/actions/session-management.ts`

## Task
Start by adding or updating a failing action or service test for post-creation participant management.

Then add actions to attach an existing participant to a session or create a new participant in the full roster and attach it to the session snapshot list.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the action change and pass afterward.

## Forbidden Actions
- Do not create attendance records when adding participants after submission. Reason: missing attendance must display as `미입력`.
