# Step 0: session-management-service

## Read First
- `src/lib/db/schema.ts`
- `src/server/services/sessions.ts`
- `src/server/services/records.ts`

## Task
Start by adding or updating failing service tests that define the required organization-scoped session management contract.

Then add organization-scoped service functions for operator session management, including session metadata, approved teachers, available participants, and session snapshots with attendance status.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated tests must fail before the service change and pass afterward.

## Forbidden Actions
- Do not read or write data without `organization_id` scope. Reason: multi-organization separation is critical.
