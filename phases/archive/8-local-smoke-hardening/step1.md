# Step 1: final-regression-pass

## Read First
- `phases/5-ops-ux-polish/index.json`
- `phases/6-flexible-session-core/index.json`
- `phases/7-session-management-dashboard/index.json`
- `phases/8-local-smoke-hardening/index.json`
- `docs/LOCAL_SMOKE_TEST.md`

## Task
Run the regression checks from phases 5-7 and then execute the documented local smoke checklist in a Supabase-connected environment.

Before marking the phase complete, record which commands and manual smoke path were actually executed. Keep phase 5-8 metadata in `pending` state until that evidence exists.

## Acceptance Criteria
```bash
npm run db:migrate
npm run test
npm run lint
npm run build
```

## Verification
- Complete the `docs/LOCAL_SMOKE_TEST.md` path with `npm run dev` or `npm run dev:local` before flipping any phase to `completed`.
- Do not add `completed_at` metadata until the regression and manual smoke evidence are both in hand.

## Forbidden Actions
- Do not mark a step complete without recording useful summary context. Reason: execute.py feeds summaries into later steps.
