# Step 0: document-session-policy

## Read First
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ADR.md`
- `phases/7-session-management-dashboard/index.json`

## Task
Document that sessions can be created before teacher and roster details are complete, while teacher submission still requires at least one session participant snapshot.

Also record that phase 6 and phase 7 ship as one release bundle, because operators need a same-release follow-up surface to assign teachers and add participants after create-first session creation.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The documented policy must match `ADR-011` and the local-first workflow in `docs/PRD.md`.

## Forbidden Actions
- Do not document deployment or email delivery as required. Reason: MVP remains local-first.
