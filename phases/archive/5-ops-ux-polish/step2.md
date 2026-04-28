# Step 2: invite-token-copy

## Read First
- `src/components/ops/users-screen.tsx`
- `src/server/services/memberships.ts`

## Task
Start by adding or updating a failing interaction test for the invite token row.

Then show full invite tokens in the invite list, add a client-side copy button, and ensure long tokens wrap inside the card.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The invite-token test must fail before the UI change and pass afterward.

## Forbidden Actions
- Do not add real email delivery. Reason: local-first MVP uses tokens only.
