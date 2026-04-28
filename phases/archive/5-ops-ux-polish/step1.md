# Step 1: back-navigation

## Read First
- `src/components/ops/users-screen.tsx`
- `src/components/records/record-detail.tsx`

## Task
Start by adding or updating a failing component test that proves operators do not yet have the required back-navigation affordance.

Then add operator back navigation to `/users` and `/records/[sessionId]` using the existing rounded back-link pattern.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The navigation test must fail before the UI change and pass afterward.

## Forbidden Actions
- Do not change auth routing. Reason: this is a navigation polish step.
