# Step 4: session-management-regression

## Read First
- `src/server/services/session-management.test.ts`
- `src/server/services/sessions.test.ts`
- `src/server/services/submissions.test.ts`

## Task
After steps 0-3 have each started with failing tests, add any remaining regression coverage for nullable teacher assignment, participant addition, duplicate prevention, the empty-roster submission guard, and the direct operator path from unassigned session to session management.

Use this step to close coverage gaps and tighten summaries for later execution context. Do not defer first-pass tests to this step.

## Acceptance Criteria
```bash
npm run test
npm run lint
npm run build
```

## Verification
- The regression suite should only extend coverage that earlier steps already introduced in TDD fashion.

## Forbidden Actions
- Do not weaken existing organization-scope tests. Reason: this feature touches shared operator data.
- Do not treat this as the first place tests are added. Reason: TDD already applies to steps 0-3.
