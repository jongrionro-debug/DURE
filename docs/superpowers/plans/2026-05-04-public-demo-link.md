# Public Demo Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vercel/Supabase-backed public demo path with repeatable demo seed data and a visible demo entry point.

**Architecture:** Keep the app monolithic and reuse existing Supabase Auth plus Drizzle/Postgres access. Add small demo-specific environment helpers, assisted demo login UI, and an idempotent seed script that prepares a dedicated demo organization and admin account.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase JS, Drizzle ORM, PostgreSQL, Vitest, Testing Library.

---

## File Structure

- Modify `src/lib/env.ts`: add demo env schema and `getDemoEnv()`.
- Modify `src/lib/env.test.ts`: test demo env parsing and disabled defaults.
- Modify `src/test/setup.ts`: add stable optional demo env defaults for UI tests.
- Create `src/components/auth/auth-form.test.tsx`: test `/login?demo=1` prefill and normal login behavior.
- Modify `src/components/auth/auth-form.tsx`: read search params and prefill demo email when enabled.
- Create `src/components/demo/demo-entry-link.tsx`: isolate demo CTA visibility logic for the home page.
- Create `src/components/demo/demo-entry-link.test.tsx`: test visible/hidden demo CTA states.
- Modify `src/app/page.tsx`: render the demo CTA under the existing start button.
- Create `scripts/seed-demo.ts`: prepare demo auth user and app data.
- Modify `package.json`: add `db:seed:demo`.
- Modify `docs/ENV_SETUP.md`: document demo deployment variables and commands.
- Modify `README.md`: add a short public demo deployment section.

## Task 1: Demo Environment Helpers

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `src/lib/env.test.ts`

- [ ] **Step 1: Write failing tests for disabled and enabled demo env**

Add these imports and tests in `src/lib/env.test.ts`:

```ts
import { getDemoEnv, getLocalMvpEnvStatus, getServerEnv } from "@/lib/env";

it("treats demo mode as disabled by default", () => {
  expect(getDemoEnv({})).toEqual({
    enabled: false,
    email: null,
    organizationSlug: "dure-demo",
  });
});

it("parses enabled public demo settings", () => {
  expect(
    getDemoEnv({
      NEXT_PUBLIC_DEMO_ENABLED: "true",
      NEXT_PUBLIC_DEMO_EMAIL: "demo@example.com",
      DEMO_ORGANIZATION_SLUG: "public-demo",
    }),
  ).toEqual({
    enabled: true,
    email: "demo@example.com",
    organizationSlug: "public-demo",
  });
});

it("requires a demo email when demo mode is enabled", () => {
  expect(() =>
    getDemoEnv({
      NEXT_PUBLIC_DEMO_ENABLED: "true",
    }),
  ).toThrowError(/NEXT_PUBLIC_DEMO_EMAIL is required when demo mode is enabled/);
});
```

- [ ] **Step 2: Run the focused env test and confirm it fails**

Run: `npm test -- src/lib/env.test.ts`

Expected: FAIL with an import error or reference error for `getDemoEnv`.

- [ ] **Step 3: Implement `getDemoEnv()`**

Add this schema and function to `src/lib/env.ts`:

```ts
const demoEnvSchema = z.object({
  NEXT_PUBLIC_DEMO_ENABLED: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_DEMO_EMAIL: z.string().email().optional(),
  DEMO_ORGANIZATION_SLUG: z.string().min(1).optional(),
});

export function getDemoEnv(source: EnvSource = process.env) {
  const parsed = demoEnvSchema.parse({
    NEXT_PUBLIC_DEMO_ENABLED: source.NEXT_PUBLIC_DEMO_ENABLED,
    NEXT_PUBLIC_DEMO_EMAIL: source.NEXT_PUBLIC_DEMO_EMAIL,
    DEMO_ORGANIZATION_SLUG: source.DEMO_ORGANIZATION_SLUG,
  });

  const enabled = parsed.NEXT_PUBLIC_DEMO_ENABLED === "true";

  if (enabled && !parsed.NEXT_PUBLIC_DEMO_EMAIL) {
    throw new Error(
      "NEXT_PUBLIC_DEMO_EMAIL is required when demo mode is enabled.",
    );
  }

  return {
    enabled,
    email: parsed.NEXT_PUBLIC_DEMO_EMAIL ?? null,
    organizationSlug: parsed.DEMO_ORGANIZATION_SLUG ?? "dure-demo",
  };
}
```

- [ ] **Step 4: Run the focused env test and confirm it passes**

Run: `npm test -- src/lib/env.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/env.ts src/lib/env.test.ts
git commit -m "feat: add demo environment helpers"
```

## Task 2: Assisted Demo Login UI

**Files:**
- Modify: `src/test/setup.ts`
- Modify: `src/components/auth/auth-form.tsx`
- Create: `src/components/auth/auth-form.test.tsx`

- [ ] **Step 1: Add test defaults for demo env**

Add to `src/test/setup.ts`:

```ts
process.env.NEXT_PUBLIC_DEMO_ENABLED ??= "false";
process.env.NEXT_PUBLIC_DEMO_EMAIL ??= "demo@example.com";
process.env.DEMO_ORGANIZATION_SLUG ??= "dure-demo";
```

- [ ] **Step 2: Write failing tests for demo login prefill**

Create `src/components/auth/auth-form.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";

const replace = vi.fn();
const refresh = vi.fn();

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    refresh,
  }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/lib/auth/supabase-browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  }),
}));

describe("AuthForm demo mode", () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    searchParams = new URLSearchParams();
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "false";
    process.env.NEXT_PUBLIC_DEMO_EMAIL = "demo@example.com";
  });

  it("does not prefill the login email outside demo mode", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });

  it("prefills the demo email on /login?demo=1 when demo mode is enabled", () => {
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "true";
    searchParams = new URLSearchParams("demo=1");

    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("E-mail")).toHaveValue("demo@example.com");
    expect(
      screen.getByText("데모 계정으로 제품 흐름을 바로 확인할 수 있습니다."),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the auth form test and confirm it fails**

Run: `npm test -- src/components/auth/auth-form.test.tsx`

Expected: FAIL because `useSearchParams` is not used and the email input has no accessible label text.

- [ ] **Step 4: Implement demo prefill in the auth form**

Update `src/components/auth/auth-form.tsx`:

```tsx
import { useRouter, useSearchParams } from "next/navigation";
import { getDemoEnv } from "@/lib/env";
```

Inside `AuthForm` before `useState` calls:

```tsx
const searchParams = useSearchParams();
const demoEnv = getDemoEnv();
const isDemoLogin =
  mode === "login" && demoEnv.enabled && searchParams.get("demo") === "1";
```

Change email state initialization:

```tsx
const [email, setEmail] = useState(isDemoLogin ? demoEnv.email ?? "" : "");
```

Make the email input accessible:

```tsx
<input
  aria-label="E-mail"
  ...
/>
```

Render helper copy above the submit button:

```tsx
{isDemoLogin ? (
  <p className="mt-5 rounded-[18px] bg-[#fff7b8] px-5 py-3 text-[15px] leading-6 text-[#555555]">
    데모 계정으로 제품 흐름을 바로 확인할 수 있습니다.
  </p>
) : null}
```

- [ ] **Step 5: Run the auth form test and confirm it passes**

Run: `npm test -- src/components/auth/auth-form.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run the existing logout test to catch auth mock regressions**

Run: `npm test -- src/components/auth/logout-button.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/test/setup.ts src/components/auth/auth-form.tsx src/components/auth/auth-form.test.tsx
git commit -m "feat: add assisted demo login"
```

## Task 3: Home Page Demo Entry CTA

**Files:**
- Create: `src/components/demo/demo-entry-link.tsx`
- Create: `src/components/demo/demo-entry-link.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write failing tests for the demo CTA**

Create `src/components/demo/demo-entry-link.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { DemoEntryLink } from "@/components/demo/demo-entry-link";

describe("DemoEntryLink", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "false";
    process.env.NEXT_PUBLIC_DEMO_EMAIL = "demo@example.com";
  });

  it("hides the demo link when demo mode is disabled", () => {
    render(<DemoEntryLink />);

    expect(
      screen.queryByRole("link", { name: "데모로 체험하기" }),
    ).not.toBeInTheDocument();
  });

  it("shows the demo link when demo mode is enabled", () => {
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "true";

    render(<DemoEntryLink />);

    expect(screen.getByRole("link", { name: "데모로 체험하기" })).toHaveAttribute(
      "href",
      "/login?demo=1",
    );
  });
});
```

- [ ] **Step 2: Run the demo CTA test and confirm it fails**

Run: `npm test -- src/components/demo/demo-entry-link.test.tsx`

Expected: FAIL because `DemoEntryLink` does not exist.

- [ ] **Step 3: Implement the demo CTA component**

Create `src/components/demo/demo-entry-link.tsx`:

```tsx
import Link from "next/link";

import { getDemoEnv } from "@/lib/env";

export function DemoEntryLink() {
  const demoEnv = getDemoEnv();

  if (!demoEnv.enabled) {
    return null;
  }

  return (
    <Link
      href="/login?demo=1"
      className="mt-4 inline-flex h-12 min-w-[190px] items-center justify-center rounded-[18px] border border-[#111111] bg-[#fffdf8] px-5 text-[17px] font-extrabold text-black transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
    >
      데모로 체험하기
    </Link>
  );
}
```

- [ ] **Step 4: Render the CTA on the home page**

Add this import to `src/app/page.tsx`:

```tsx
import { DemoEntryLink } from "@/components/demo/demo-entry-link";
```

Render it immediately after the existing `/login` start link:

```tsx
<DemoEntryLink />
```

- [ ] **Step 5: Run the demo CTA test and confirm it passes**

Run: `npm test -- src/components/demo/demo-entry-link.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/demo/demo-entry-link.tsx src/components/demo/demo-entry-link.test.tsx src/app/page.tsx
git commit -m "feat: add public demo entry link"
```

## Task 4: Demo Seed Script

**Files:**
- Create: `scripts/seed-demo.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the package script**

In `package.json`, add:

```json
"db:seed:demo": "tsx scripts/seed-demo.ts"
```

Because `tsx` is not currently a dependency, add it to `devDependencies`:

```json
"tsx": "^4.20.6"
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` updates and `tsx` appears in the lockfile.

- [ ] **Step 3: Create the seed script**

Create `scripts/seed-demo.ts` with this structure:

```ts
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";

import {
  attendanceRecords,
  classes,
  lessonJournals,
  organizationMemberships,
  organizations,
  participants,
  programs,
  sessionParticipantSnapshots,
  sessions,
  users,
  villages,
} from "../src/lib/db/schema";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to seed demo data.`);
  }
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const databaseUrl = requireEnv("DATABASE_URL");
const demoEmail = requireEnv("NEXT_PUBLIC_DEMO_EMAIL");
const demoPassword = requireEnv("DEMO_PASSWORD");
const organizationSlug = process.env.DEMO_ORGANIZATION_SLUG ?? "dure-demo";

const supabase = createClient(supabaseUrl, serviceRoleKey);
const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function ensureDemoAuthUser() {
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        display_name: "데모 운영자",
      },
    });

  if (created.user) {
    return created.user;
  }

  if (!createError?.message.toLowerCase().includes("already")) {
    throw createError;
  }

  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    throw error;
  }

  const existing = data.users.find((user) => user.email === demoEmail);
  if (!existing) {
    throw new Error(`Demo user ${demoEmail} exists but could not be found.`);
  }

  await supabase.auth.admin.updateUserById(existing.id, {
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      display_name: "데모 운영자",
    },
  });

  return existing;
}

async function upsertDemoData() {
  const authUser = await ensureDemoAuthUser();
  const now = new Date();

  await db
    .insert(users)
    .values({
      id: authUser.id,
      email: demoEmail,
      displayName: "데모 운영자",
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: demoEmail,
        displayName: "데모 운영자",
        updatedAt: now,
      },
    });

  const [organization] = await db
    .insert(organizations)
    .values({
      name: "DURE Demo Center",
      slug: organizationSlug,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: organizations.slug,
      set: {
        name: "DURE Demo Center",
        updatedAt: now,
      },
    })
    .returning();

  await db
    .insert(organizationMemberships)
    .values({
      organizationId: organization.id,
      userId: authUser.id,
      role: "organization_admin",
      approvedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: organizationMemberships.userId,
      set: {
        organizationId: organization.id,
        role: "organization_admin",
        approvedAt: now,
        updatedAt: now,
      },
    });

  await db.delete(lessonJournals).where(eq(lessonJournals.organizationId, organization.id));
  await db.delete(attendanceRecords).where(eq(attendanceRecords.organizationId, organization.id));
  await db
    .delete(sessionParticipantSnapshots)
    .where(eq(sessionParticipantSnapshots.organizationId, organization.id));
  await db.delete(sessions).where(eq(sessions.organizationId, organization.id));
  await db.delete(participants).where(eq(participants.organizationId, organization.id));
  await db.delete(classes).where(eq(classes.organizationId, organization.id));
  await db.delete(programs).where(eq(programs.organizationId, organization.id));
  await db.delete(villages).where(eq(villages.organizationId, organization.id));

  const [village] = await db
    .insert(villages)
    .values({
      organizationId: organization.id,
      name: "햇살마을",
      isPrimary: true,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [villages.organizationId, villages.name],
      set: {
        isPrimary: true,
        updatedAt: now,
      },
    })
    .returning();

  const [program] = await db
    .insert(programs)
    .values({
      organizationId: organization.id,
      name: "돌봄 문해",
      description: "기초 문해와 일상 소통을 돕는 데모 사업입니다.",
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [programs.organizationId, programs.name],
      set: {
        description: "기초 문해와 일상 소통을 돕는 데모 사업입니다.",
        updatedAt: now,
      },
    })
    .returning();

  const [demoClass] = await db
    .insert(classes)
    .values({
      organizationId: organization.id,
      villageId: village.id,
      programId: program.id,
      name: "문해 기초 A",
      description: "공개 데모용 샘플 수업입니다.",
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [classes.organizationId, classes.name],
      set: {
        villageId: village.id,
        programId: program.id,
        description: "공개 데모용 샘플 수업입니다.",
        updatedAt: now,
      },
    })
    .returning();

  const participantNames = ["김경원", "이복순", "박영자", "최정희"];

  const seededParticipants = [];
  for (const fullName of participantNames) {
    const [participant] = await db
      .insert(participants)
      .values({
        organizationId: organization.id,
        classId: demoClass.id,
        fullName,
        note: "데모 참여자",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [participants.organizationId, participants.fullName],
        set: {
          classId: demoClass.id,
          note: "데모 참여자",
          updatedAt: now,
        },
      })
      .returning();
    seededParticipants.push(participant);
  }

  const [session] = await db
    .insert(sessions)
    .values({
      organizationId: organization.id,
      villageId: village.id,
      programId: program.id,
      classId: demoClass.id,
      teacherId: authUser.id,
      sessionDate: "2026-05-04",
      submittedAt: now,
      updatedAt: now,
    })
    .returning();

  for (const [index, participant] of seededParticipants.entries()) {
    const [snapshot] = await db
      .insert(sessionParticipantSnapshots)
      .values({
        organizationId: organization.id,
        sessionId: session.id,
        participantId: participant.id,
        rosterOrder: index,
        fullName: participant.fullName,
        note: participant.note,
      })
      .returning();

    await db.insert(attendanceRecords).values({
      organizationId: organization.id,
      sessionId: session.id,
      sessionParticipantSnapshotId: snapshot.id,
      status: index === 1 ? "late" : "present",
      updatedAt: now,
    });
  }

  await db.insert(lessonJournals).values({
    organizationId: organization.id,
    sessionId: session.id,
    body: "오늘은 이름 쓰기와 생활 문장을 함께 연습했습니다.",
    updatedAt: now,
  });

  console.log(`Seeded demo organization ${organization.slug} for ${demoEmail}.`);
}

upsertDemoData()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
```

- [ ] **Step 4: Build-check the seed script**

Run: `npm run build`

Expected: PASS, or FAIL only for pre-existing unrelated build issues. Fix any TypeScript error introduced by `scripts/seed-demo.ts` before continuing.

- [ ] **Step 5: Run the seed script only against a prepared local/demo env**

Run: `npm run db:seed:demo`

Expected: If demo env keys are missing, FAIL with `DEMO_PASSWORD is required to seed demo data.` If keys are present and DB/Auth are reachable, PASS and print `Seeded demo organization`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/seed-demo.ts
git commit -m "feat: add demo seed script"
```

## Task 5: Deployment Documentation

**Files:**
- Modify: `docs/ENV_SETUP.md`
- Modify: `README.md`

- [ ] **Step 1: Add demo env docs**

Append this section to `docs/ENV_SETUP.md`:

````md
## 공개 데모 링크 환경

공개 체험 링크는 로컬 Docker DB가 아니라 Vercel과 전용 Supabase 프로젝트를 사용한다.

Vercel Demo 프로젝트 필수 값:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_DEMO_ENABLED=true
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
DEMO_PASSWORD=
DEMO_ORGANIZATION_SLUG=dure-demo
```

배포 준비 순서:

1. Supabase에서 데모 전용 프로젝트를 만든다.
2. Vercel 프로젝트에 위 환경변수를 등록한다.
3. 같은 값이 들어 있는 로컬 운영자 `.env.local`에서 `npm run db:migrate`를 실행한다.
4. `npm run db:seed:demo`로 데모 계정과 샘플 데이터를 만든다.
5. Vercel 배포 URL에서 `데모로 체험하기`를 눌러 로그인 흐름을 확인한다.

주의: 공개 데모는 실제 운영 데이터나 프로덕션 Supabase 프로젝트를 공유하지 않는다.
````

- [ ] **Step 2: Add a short README pointer**

Add this section near the operations/deployment area in `README.md`:

````md
## 공개 데모 링크 배포

링크만으로 체험 가능한 데모는 Vercel + 전용 Supabase 프로젝트 조합으로 운영한다.

핵심 순서:

```bash
npm run db:migrate
npm run db:seed:demo
```

필요한 demo 환경변수와 세부 절차는 `docs/ENV_SETUP.md`의 `공개 데모 링크 환경` 섹션을 따른다.
````

- [ ] **Step 3: Check markdown snippets**

Run: `rg "공개 데모 링크|NEXT_PUBLIC_DEMO_ENABLED|db:seed:demo" README.md docs/ENV_SETUP.md`

Expected: The new README pointer and full env setup section are present.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/ENV_SETUP.md
git commit -m "docs: document public demo deployment"
```

## Task 6: Full Verification

**Files:**
- No new files. Verify all changed behavior.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- src/lib/env.test.ts src/components/auth/auth-form.test.tsx src/components/demo/demo-entry-link.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: PASS. If it fails because `next lint` script is unavailable, do not change lint tooling in this task; record the exact build failure and fix only demo-related TypeScript/runtime issues.

- [ ] **Step 4: Verify hidden demo UI by default**

Run: `NEXT_PUBLIC_DEMO_ENABLED=false npm test -- src/components/demo/demo-entry-link.test.tsx`

Expected: PASS and the hidden-state test confirms no public demo link renders.

- [ ] **Step 5: Commit final fixes if verification required changes**

```bash
git add src lib scripts docs README.md package.json package-lock.json
git commit -m "fix: stabilize public demo verification"
```

Only run this commit if Step 1-4 required additional code or doc edits after the earlier task commits.

## Self-Review Notes

- Spec coverage: demo env parsing is Task 1; assisted login is Task 2; home entry CTA is Task 3; repeatable seed data is Task 4; Vercel/Supabase docs are Task 5; verification is Task 6.
- Scope: this plan intentionally excludes one-click server-side login, scheduled reset, teacher demo account, production deployment, and rate limiting, matching the design boundaries.
- Risk: the seed script touches live demo data, so it deletes and recreates only records scoped to the configured demo organization before inserting the baseline sample set.
