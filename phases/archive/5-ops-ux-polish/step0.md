# Step 0: business-copy

## Read First
- `agent.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ADR.md`

## Task
Start by adding or updating a failing UI test that proves the visible Korean copy is still `프로그램` in the targeted operator screens.

Then change visible UI copy from `프로그램` to `사업` while keeping internal database and code identifiers such as `programs` and `programId`.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The new or updated test must fail before the copy change and pass afterward.

## Forbidden Actions
- Do not rename DB tables or code identifiers. Reason: this step is copy-only.
