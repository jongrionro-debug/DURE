# Step 3: relax-session-create

## Read First
- `src/lib/validations/sessions.ts`
- `src/server/actions/sessions.ts`
- `src/server/services/sessions.ts`

## Task
Start by adding or updating a failing validation or service test that proves session creation currently requires `teacherId` or at least one participant.

Then allow session creation without `teacherId` and without initial participants. If participants exist, create snapshots; if none exist, create the session with zero snapshots.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the validation change and pass afterward.

## Forbidden Actions
- Do not remove class, village, or business validation. Reason: these still define the session.
- Do not release this step by itself. Reason: operators need the phase 7 session management surface in the same release to complete incomplete sessions safely.
