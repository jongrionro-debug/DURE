# Domain-First Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild DURE around the new "수업 일정 만들기" domain flow first, then apply the new dark-sidebar operations-console UI from the DURE design spec.

**Architecture:** Phase 1 changes the domain model and service behavior before visual work: participants belong to villages, operators create class schedules from named 사업/마을/프로그램 inputs, and each schedule snapshots village participants. Phase 2 replaces the warm messenger UI with the new console shell and applies it screen-by-screen. Internal table names and routes such as `sessions`, `classes`, and `/dashboard/sessions/[id]` remain for this iteration; user-facing copy changes to `수업 일정`, `프로그램`, and `출석 대상`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Drizzle ORM/Postgres, Zod, Tailwind CSS, Vitest, Testing Library.

---

## Source Inputs

- New design source: `/Users/nojonghyeon/Downloads/DURE-Design-Spec.md`
- Prototype wrapper source: `/Users/nojonghyeon/Downloads/DURE 운영 시스템.html`
- Existing product docs: `docs/PRD.md`, `docs/UI_GUIDE.md`, `docs/ARCHITECTURE.md`
- Current implementation: `src/app`, `src/components`, `src/server`, `src/lib`

The deleted `docs/superpowers/plans/2026-05-09-class-schedule-creation.md` is no longer the execution source. This file supersedes it.

## File Structure

- Modify `src/lib/db/schema.ts`: add `participants.villageId`; keep `participants.classId` nullable for compatibility; add the village relation.
- Generate a Drizzle migration after the schema change: add `participants.villageId`, update `drizzle/meta/_journal.json`, and include the generated `0003_*.sql` and snapshot files.
- Modify `src/lib/validations/sessions.ts`: replace ID-based schedule creation inputs with named `villageName`, `programName`, `className`, plus optional teacher and excluded participant ids.
- Modify `src/server/services/sessions.ts`: add `createClassScheduleRecord`, find-or-create master-data helpers, village participant snapshotting, and dashboard data for participant exclusion.
- Modify `src/server/actions/sessions.ts`: call `createClassScheduleRecord`, redirect to `/dashboard/sessions/[id]`, and update visible messages.
- Modify `src/lib/validations/settings.ts`, `src/server/services/settings.ts`, `src/server/actions/settings.ts`, `src/components/ops/settings-screen.tsx`: make participants village-based and rename class-facing copy to `프로그램`.
- Modify `src/server/services/session-management.ts`: filter available participants by the schedule village and create ad-hoc participants under that village.
- Modify `src/app/globals.css`: replace old warm UI tokens with the new DURE console tokens.
- Create `src/components/ui/app-shell.tsx`: authenticated console shell with fixed 220px sidebar.
- Create or modify shared UI primitives in `src/components/ui/shell.tsx`: card, button, input, status chip, stats card helpers.
- Modify `src/app/(ops)/layout.tsx` and `src/app/(teacher)/layout.tsx`: wrap authenticated screens in the new shell instead of `AuthSessionBar`.
- Modify `src/components/ops/dashboard-screen.tsx`: new operator dashboard layout and schedule creation modal.
- Modify `src/components/ops/session-management-screen.tsx`, `src/components/records/records-browser.tsx`, `src/components/records/record-detail.tsx`, `src/components/ops/users-screen.tsx`: apply console UI and terminology.
- Modify `src/components/teacher/sessions-screen.tsx` and `src/components/teacher/session-workspace.tsx`: `내 수업 일정` list and workspace in the new shell. Do not add a `제출 이력` navigation entry until a real route exists.
- Update focused tests in `src/lib/db/schema.test.ts`, `src/lib/validations/sessions.test.ts`, `src/server/services/*.test.ts`, and component tests.

---

## Phase 1: Domain And Functionality First

### Task 1: Store Participants By Village

**Files:**
- Modify: `src/lib/db/schema.ts`
- Modify: `src/lib/db/schema.test.ts`
- Generate: `drizzle/0003_*.sql`
- Modify: `drizzle/meta/_journal.json`
- Generate: `drizzle/meta/0003_snapshot.json`

- [ ] **Step 1: Add the failing schema test**

Append this test to `src/lib/db/schema.test.ts`.

```ts
import { participants, participantsRelations } from "@/lib/db/schema";

it("stores participants by village while keeping class compatibility", () => {
  expect(participants.villageId.name).toBe("village_id");
  expect(participants.classId.name).toBe("class_id");
  expect(participantsRelations).toBeDefined();
});
```

- [ ] **Step 2: Run the failing test**

Run: `npm test -- src/lib/db/schema.test.ts`

Expected: FAIL because `participants.villageId` does not exist yet.

- [ ] **Step 3: Update the participants schema**

In `src/lib/db/schema.ts`, replace the `participants` table and relation block with village support. Keep the existing `classId`.

```ts
export const participants = pgTable(
  "participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    villageId: uuid("village_id").references(() => villages.id, {
      onDelete: "set null",
    }),
    classId: uuid("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    fullName: text("full_name").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("participants_organization_idx").on(
      table.organizationId,
    ),
    villageIdx: index("participants_village_idx").on(table.villageId),
    classIdx: index("participants_class_idx").on(table.classId),
    organizationNameUnique: uniqueIndex(
      "participants_organization_name_unique",
    ).on(table.organizationId, table.fullName),
  }),
);

export const participantsRelations = relations(participants, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [participants.organizationId],
    references: [organizations.id],
  }),
  village: one(villages, {
    fields: [participants.villageId],
    references: [villages.id],
  }),
  class: one(classes, {
    fields: [participants.classId],
    references: [classes.id],
  }),
  sessionSnapshots: many(sessionParticipantSnapshots),
}));
```

- [ ] **Step 4: Generate migration**

Run Drizzle generate after the schema edit:

```bash
npm run db:generate
```

Expected: Drizzle creates a `drizzle/0003_*.sql` file, updates `drizzle/meta/_journal.json`, and creates `drizzle/meta/0003_snapshot.json`.

- [ ] **Step 5: Add data backfill to generated migration**

Open the generated `drizzle/0003_*.sql` file. Keep Drizzle's generated `ALTER TABLE` and index statements, then add this data backfill after the `village_id` column is added:

```sql
UPDATE "participants"
SET "village_id" = "classes"."village_id"
FROM "classes"
WHERE "participants"."class_id" = "classes"."id"
  AND "participants"."village_id" IS NULL;
```

- [ ] **Step 6: Verify**

Run: `npm test -- src/lib/db/schema.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/schema.test.ts drizzle
git commit -m "feat: store participants by village"
```

### Task 2: Replace ID-Based Session Creation With Class Schedule Creation

**Files:**
- Modify: `src/lib/validations/sessions.ts`
- Modify: `src/lib/validations/sessions.test.ts`
- Modify: `src/server/services/sessions.ts`
- Modify: `src/server/services/sessions.test.ts`

- [ ] **Step 1: Update validation tests**

In `src/lib/validations/sessions.test.ts`, update the create-schema expectations.

```ts
it("accepts named class schedule creation inputs", () => {
  const result = sessionCreateSchema.safeParse({
    sessionDate: "2026-05-20",
    villageName: "다도리",
    programName: "문해 사업",
    className: "스마트폰 기초",
    teacherId: "",
    excludedParticipantIds: ["11111111-1111-4111-8111-111111111111"],
  });

  expect(result.success).toBe(true);
});

it("rejects missing schedule names", () => {
  const result = sessionCreateSchema.safeParse({
    sessionDate: "2026-05-20",
    villageName: "",
    programName: "",
    className: "",
    teacherId: "",
    excludedParticipantIds: [],
  });

  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Run failing validation tests**

Run: `npm test -- src/lib/validations/sessions.test.ts`

Expected: FAIL because the schema still expects ids.

- [ ] **Step 3: Update `sessionCreateSchema`**

Replace the create schema in `src/lib/validations/sessions.ts`.

```ts
export const sessionCreateSchema = z.object({
  sessionDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "진행일을 선택해 주세요."),
  villageName: z.string().trim().min(2, "마을 이름을 2자 이상 입력해 주세요."),
  programName: z.string().trim().min(2, "사업 이름을 2자 이상 입력해 주세요."),
  className: z.string().trim().min(2, "프로그램 이름을 2자 이상 입력해 주세요."),
  teacherId: z
    .string()
    .uuid("유효한 강사 id가 필요합니다.")
    .optional()
    .or(z.literal("")),
  excludedParticipantIds: z
    .array(z.string().uuid("유효한 참여자 id가 필요합니다."))
    .default([]),
});
```

- [ ] **Step 4: Add failing service test**

In `src/server/services/sessions.test.ts`, add a test for the schedule use case.

First update the existing import block:

```ts
import {
  buildSessionParticipantSnapshots,
  createClassScheduleRecord,
  createSessionRecord,
  filterTeacherAssignedSessions,
  getTeacherSessionWorkspace,
} from "@/server/services/sessions";
```

```ts
it("creates a class schedule by reusing master records and snapshotting village participants", async () => {
  const insertedSnapshots: unknown[] = [];
  const repository = {
    findVillageByName: async () => ({ id: "village-1", name: "다도리" }),
    insertVillage: async () => {
      throw new Error("should reuse village");
    },
    findProgramByName: async () => ({ id: "program-1", name: "문해 사업" }),
    insertProgram: async () => {
      throw new Error("should reuse program");
    },
    findClassByName: async () => ({
      id: "class-1",
      name: "스마트폰 기초",
      programId: "program-1",
    }),
    insertClass: async () => {
      throw new Error("should reuse class");
    },
    findApprovedTeacherAssignment: async () => null,
    listVillageParticipants: async () => [
      {
        id: "participant-1",
        organizationId: "org-1",
        fullName: "김영희",
        note: null,
      },
      {
        id: "participant-2",
        organizationId: "org-1",
        fullName: "박미자",
        note: "불참 예정",
      },
    ],
    insertSession: async () => ({ id: "session-1", organizationId: "org-1" }),
    insertSessionParticipantSnapshots: async (values: unknown[]) => {
      insertedSnapshots.push(...values);
    },
  };

  const result = await createClassScheduleRecord(
    {
      organizationId: "org-1",
      sessionDate: "2026-05-20",
      villageName: "다도리",
      programName: "문해 사업",
      className: "스마트폰 기초",
      teacherId: null,
      excludedParticipantIds: ["participant-2"],
    },
    repository,
  );

  expect(result).toEqual({ sessionId: "session-1", snapshotCount: 1 });
  expect(insertedSnapshots).toMatchObject([
    {
      sessionId: "session-1",
      organizationId: "org-1",
      participantId: "participant-1",
      fullName: "김영희",
      rosterOrder: 0,
    },
  ]);
});
```

- [ ] **Step 5: Run failing service test**

Run: `npm test -- src/server/services/sessions.test.ts`

Expected: FAIL because `createClassScheduleRecord` does not exist yet.

- [ ] **Step 6: Implement schedule repository and service**

In `src/server/services/sessions.ts`, import `participants`, add the repository type and implementation near the existing session repository, then export `createClassScheduleRecord`.

```ts
type ClassScheduleRepository = {
  findVillageByName(
    organizationId: string,
    name: string,
  ): Promise<{ id: string; name: string } | null>;
  insertVillage(values: { organizationId: string; name: string }): Promise<{ id: string; name: string }>;
  findProgramByName(
    organizationId: string,
    name: string,
  ): Promise<{ id: string; name: string } | null>;
  insertProgram(values: {
    organizationId: string;
    name: string;
    description: string | null;
  }): Promise<{ id: string; name: string }>;
  findClassByName(
    organizationId: string,
    name: string,
  ): Promise<{ id: string; name: string; programId: string | null } | null>;
  insertClass(values: {
    organizationId: string;
    name: string;
    description: string | null;
    programId: string;
    villageId: null;
  }): Promise<{ id: string; name: string; programId: string | null }>;
  findApprovedTeacherAssignment(
    organizationId: string,
    classId: string,
    teacherId: string,
  ): Promise<SessionTeacherAssignmentRecord | null>;
  listVillageParticipants(
    organizationId: string,
    villageId: string,
  ): Promise<SessionParticipantRecord[]>;
  insertSession(
    values: typeof sessions.$inferInsert,
  ): Promise<{ id: string; organizationId: string }>;
  insertSessionParticipantSnapshots(
    values: Array<typeof sessionParticipantSnapshots.$inferInsert>,
  ): Promise<void>;
};

function normalizeMasterName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createClassScheduleRepository(): ClassScheduleRepository {
  const db = getDb();

  return {
    async findVillageByName(organizationId, name) {
      const [row] = await db
        .select({ id: villages.id, name: villages.name })
        .from(villages)
        .where(and(eq(villages.organizationId, organizationId), eq(villages.name, name)))
        .limit(1);
      return row ?? null;
    },
    async insertVillage(values) {
      const [row] = await db.insert(villages).values(values).returning({
        id: villages.id,
        name: villages.name,
      });
      return row;
    },
    async findProgramByName(organizationId, name) {
      const [row] = await db
        .select({ id: programs.id, name: programs.name })
        .from(programs)
        .where(and(eq(programs.organizationId, organizationId), eq(programs.name, name)))
        .limit(1);
      return row ?? null;
    },
    async insertProgram(values) {
      const [row] = await db.insert(programs).values(values).returning({
        id: programs.id,
        name: programs.name,
      });
      return row;
    },
    async findClassByName(organizationId, name) {
      const [row] = await db
        .select({ id: classes.id, name: classes.name, programId: classes.programId })
        .from(classes)
        .where(and(eq(classes.organizationId, organizationId), eq(classes.name, name)))
        .limit(1);
      return row ?? null;
    },
    async insertClass(values) {
      const [row] = await db.insert(classes).values(values).returning({
        id: classes.id,
        name: classes.name,
        programId: classes.programId,
      });
      return row;
    },
    async findApprovedTeacherAssignment(organizationId, classId, teacherId) {
      const [assignment] = await db
        .select({
          classId: teacherAssignments.classId,
          userId: teacherAssignments.userId,
        })
        .from(teacherAssignments)
        .where(
          and(
            eq(teacherAssignments.organizationId, organizationId),
            eq(teacherAssignments.classId, classId),
            eq(teacherAssignments.userId, teacherId),
          ),
        )
        .limit(1);
      return assignment ?? null;
    },
    async listVillageParticipants(organizationId, villageId) {
      return db
        .select({
          id: participants.id,
          organizationId: participants.organizationId,
          fullName: participants.fullName,
          note: participants.note,
        })
        .from(participants)
        .where(
          and(
            eq(participants.organizationId, organizationId),
            eq(participants.villageId, villageId),
          ),
        )
        .orderBy(asc(participants.fullName));
    },
    async insertSession(values) {
      const [session] = await db.insert(sessions).values(values).returning({
        id: sessions.id,
        organizationId: sessions.organizationId,
      });
      return session;
    },
    async insertSessionParticipantSnapshots(values) {
      if (values.length) {
        await db.insert(sessionParticipantSnapshots).values(values);
      }
    },
  };
}

export async function createClassScheduleRecord(
  input: {
    organizationId: string;
    villageName: string;
    programName: string;
    className: string;
    teacherId?: string | null;
    sessionDate: string;
    excludedParticipantIds?: string[];
  },
  repository: ClassScheduleRepository = createClassScheduleRepository(),
) {
  const villageName = normalizeMasterName(input.villageName);
  const programName = normalizeMasterName(input.programName);
  const className = normalizeMasterName(input.className);

  const village =
    (await repository.findVillageByName(input.organizationId, villageName)) ??
    (await repository.insertVillage({ organizationId: input.organizationId, name: villageName }));
  const program =
    (await repository.findProgramByName(input.organizationId, programName)) ??
    (await repository.insertProgram({
      organizationId: input.organizationId,
      name: programName,
      description: null,
    }));
  const existingClass = await repository.findClassByName(
    input.organizationId,
    className,
  );

  if (existingClass?.programId && existingClass.programId !== program.id) {
    throw new Error("같은 이름의 프로그램이 다른 사업에 이미 연결되어 있습니다.");
  }

  const classRecord =
    existingClass ??
    (await repository.insertClass({
      organizationId: input.organizationId,
      name: className,
      description: null,
      programId: program.id,
      villageId: null,
    }));

  if (input.teacherId) {
    const teacherAssignment = await repository.findApprovedTeacherAssignment(
      input.organizationId,
      classRecord.id,
      input.teacherId,
    );

    if (!teacherAssignment) {
      throw new Error("선택한 강사가 이 프로그램에 배정되어 있지 않습니다.");
    }
  }

  const session = await repository.insertSession({
    organizationId: input.organizationId,
    villageId: village.id,
    programId: program.id,
    classId: classRecord.id,
    teacherId: input.teacherId || null,
    sessionDate: input.sessionDate,
  });

  const excluded = new Set(input.excludedParticipantIds ?? []);
  const participantsForSnapshot = (
    await repository.listVillageParticipants(input.organizationId, village.id)
  ).filter((participant) => !excluded.has(participant.id));

  await repository.insertSessionParticipantSnapshots(
    buildSessionParticipantSnapshots(
      session.id,
      input.organizationId,
      participantsForSnapshot,
    ),
  );

  return {
    sessionId: session.id,
    snapshotCount: participantsForSnapshot.length,
  };
}
```

- [ ] **Step 7: Verify**

Run:

```bash
npm test -- src/lib/validations/sessions.test.ts src/server/services/sessions.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/validations/sessions.ts src/lib/validations/sessions.test.ts src/server/services/sessions.ts src/server/services/sessions.test.ts
git commit -m "feat: create class schedules from named inputs"
```

### Task 3: Redirect After Schedule Creation

**Files:**
- Modify: `src/server/actions/sessions.ts`

- [ ] **Step 1: Update the server action**

Replace the create action with the schedule service and redirect behavior.

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerAuthState } from "@/lib/auth/supabase-server";
import { sessionCreateSchema } from "@/lib/validations/sessions";
import { createClassScheduleRecord } from "@/server/services/sessions";

type SessionActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function requireOrganizationAdmin() {
  const authState = await getServerAuthState();

  if (!authState.isAuthenticated || !authState.organizationId) {
    return {
      error: "기관 운영 영역에 접근하려면 로그인과 기관 소속이 필요합니다.",
    };
  }

  if (!authState.membershipApproved) {
    return {
      error: "운영자 승인 이후에만 수업 일정을 만들 수 있습니다.",
    };
  }

  if (authState.role !== "organization_admin") {
    return {
      error: "수업 일정 만들기는 organization_admin만 수행할 수 있습니다.",
    };
  }

  return {
    organizationId: authState.organizationId,
  };
}

export async function createSessionAction(
  _: SessionActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = sessionCreateSchema.safeParse({
    sessionDate: formData.get("sessionDate"),
    villageName: formData.get("villageName"),
    programName: formData.get("programName"),
    className: formData.get("className"),
    teacherId: formData.get("teacherId"),
    excludedParticipantIds: formData.getAll("excludedParticipantIds"),
  });

  if (!parsed.success) {
    return {
      message: "수업 일정 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let schedule: { sessionId: string };

  try {
    schedule = await createClassScheduleRecord({
      organizationId: access.organizationId,
      sessionDate: parsed.data.sessionDate,
      villageName: parsed.data.villageName,
      programName: parsed.data.programName,
      className: parsed.data.className,
      teacherId: parsed.data.teacherId || null,
      excludedParticipantIds: parsed.data.excludedParticipantIds,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "수업 일정 생성 중 오류가 발생했습니다.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath(`/dashboard/sessions/${schedule.sessionId}`);
  redirect(`/dashboard/sessions/${schedule.sessionId}`);
}
```

- [ ] **Step 2: Verify**

Run: `npm test -- src/server/services/sessions.test.ts`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/server/actions/sessions.ts
git commit -m "feat: redirect after schedule creation"
```

### Task 4: Make Settings Participant Management Village-Based

**Files:**
- Modify: `src/lib/validations/settings.ts`
- Modify: `src/server/services/settings.ts`
- Modify: `src/server/actions/settings.ts`
- Modify: `src/components/ops/settings-screen.tsx`
- Modify: `src/server/services/settings.test.ts`
- Modify: `src/components/ops/settings-screen.test.tsx`

- [ ] **Step 1: Add failing service test**

In `src/server/services/settings.test.ts`, update participant creation expectations.

```ts
it("creates participants under a village", async () => {
  const inserted: unknown[] = [];

  await createParticipantRecord(
    {
      organizationId: "org-1",
      villageId: "village-1",
      fullName: "김영희",
      note: "오전반",
    },
    {
      insertVillage: async () => undefined,
      insertProgram: async () => undefined,
      insertClass: async () => undefined,
      insertParticipant: async (values) => {
        inserted.push(values);
      },
      deleteParticipant: async () => undefined,
    },
  );

  expect(inserted).toEqual([
    {
      organizationId: "org-1",
      villageId: "village-1",
      classId: null,
      fullName: "김영희",
      note: "오전반",
    },
  ]);
});
```

- [ ] **Step 2: Run failing test**

Run: `npm test -- src/server/services/settings.test.ts`

Expected: FAIL because participants still use `classId`.

- [ ] **Step 3: Update validations and service**

Use this shape in `src/lib/validations/settings.ts`.

```ts
export const classSchema = z.object({
  name: z.string().trim().min(2, "프로그램 이름을 2자 이상 입력해 주세요."),
  description: z
    .string()
    .trim()
    .max(300, "설명은 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
  programId: z.string().uuid().optional().or(z.literal("")),
});

export const participantSchema = z.object({
  fullName: z.string().trim().min(2, "참여자 이름을 2자 이상 입력해 주세요."),
  note: z
    .string()
    .trim()
    .max(300, "메모는 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
  villageId: z.string().uuid("참여자가 속한 마을을 선택해 주세요."),
});
```

Update `createClassRecord` and `createParticipantRecord` in `src/server/services/settings.ts`.

```ts
export async function createClassRecord(
  input: {
    organizationId: string;
    name: string;
    description?: string | null;
    programId?: string | null;
  },
  repository: SettingsRepository = createSettingsRepository(),
) {
  await repository.insertClass({
    organizationId: input.organizationId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    programId: normalizeOptionalForeignKey(input.programId),
    villageId: null,
  });
}

export async function createParticipantRecord(
  input: {
    organizationId: string;
    fullName: string;
    note?: string | null;
    villageId: string;
  },
  repository: SettingsRepository = createSettingsRepository(),
) {
  await repository.insertParticipant({
    organizationId: input.organizationId,
    fullName: input.fullName.trim(),
    note: input.note?.trim() || null,
    villageId: input.villageId,
    classId: null,
  });
}
```

- [ ] **Step 4: Update settings action and overview query**

In `src/server/actions/settings.ts`, participant creation must parse `villageId`; class creation must stop parsing `villageId`.

In `listSettingsOverview`, select `villageName` for participants.

```ts
db
  .select({
    id: participants.id,
    fullName: participants.fullName,
    note: participants.note,
    villageName: villages.name,
  })
  .from(participants)
  .leftJoin(villages, eq(participants.villageId, villages.id))
  .where(eq(participants.organizationId, organizationId))
  .orderBy(asc(participants.fullName));
```

- [ ] **Step 5: Update Settings UI copy**

In `src/components/ops/settings-screen.tsx`:

- Rename the `classes` section label from `수업` to `프로그램`.
- Remove the class form's village select.
- Change participant creation to select `villageId`.
- Display `participant.villageName`.

- [ ] **Step 6: Verify**

Run:

```bash
npm test -- src/server/services/settings.test.ts src/components/ops/settings-screen.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/validations/settings.ts src/server/services/settings.ts src/server/actions/settings.ts src/components/ops/settings-screen.tsx src/server/services/settings.test.ts src/components/ops/settings-screen.test.tsx
git commit -m "feat: manage participants by village"
```

### Task 5: Filter Schedule Detail Participants By Village

**Files:**
- Modify: `src/server/services/session-management.ts`
- Modify: `src/server/services/session-management.test.ts`

- [ ] **Step 1: Add failing test**

In `src/server/services/session-management.test.ts`, add:

```ts
it("creates a new participant under the schedule village when adding to a schedule", async () => {
  const insertedParticipants: unknown[] = [];
  const repository = {
    findSession: async () => ({
      id: "session-1",
      organizationId: "org-1",
      classId: "class-1",
      villageId: "village-1",
      submittedAt: null,
    }),
    listSessionSnapshots: async () => [],
    insertParticipant: async (values) => {
      insertedParticipants.push(values);
      return {
        id: "participant-1",
        organizationId: "org-1",
        fullName: values.fullName,
        note: values.note,
      };
    },
    insertSessionSnapshot: async () => undefined,
    touchSession: async () => undefined,
  };

  await createAndAddParticipantToSession(
    {
      organizationId: "org-1",
      sessionId: "session-1",
      fullName: "김영희",
      note: null,
    },
    repository,
  );

  expect(insertedParticipants).toEqual([
    {
      organizationId: "org-1",
      villageId: "village-1",
      classId: null,
      fullName: "김영희",
      note: null,
    },
  ]);
});
```

- [ ] **Step 2: Run failing test**

Run: `npm test -- src/server/services/session-management.test.ts`

Expected: FAIL because `ManagedSession` does not include `villageId`.

- [ ] **Step 3: Update service**

In `src/server/services/session-management.ts`:

- Add `villageId` to `ManagedSession`.
- Select `sessions.villageId` in `findSession`.
- Change `listAvailableParticipants(organizationId)` to `listAvailableParticipants(organizationId, villageId)`.
- Filter available participants by `participants.villageId`.
- Return `villageId` from `findParticipant` and reject existing participants whose village does not match the schedule village. This prevents a forged form post from adding another village's participant to the schedule.
- Insert new ad-hoc participants with `villageId: session.villageId` and `classId: null`.

```ts
type ManagedSession = {
  id: string;
  organizationId: string;
  classId: string;
  villageId: string;
  submittedAt: Date | null;
};
```

Update participant records used by this service to carry their source village.

```ts
type SessionParticipant = {
  id: string;
  organizationId: string;
  villageId: string | null;
  fullName: string;
  note: string | null;
};
```

```ts
async listAvailableParticipants(organizationId, villageId) {
  return db
    .select({
      id: participants.id,
      organizationId: participants.organizationId,
      villageId: participants.villageId,
      fullName: participants.fullName,
      note: participants.note,
    })
    .from(participants)
    .where(
      and(
        eq(participants.organizationId, organizationId),
        eq(participants.villageId, villageId),
      ),
    )
    .orderBy(asc(participants.fullName));
}
```

Update `findParticipant` to select `participants.villageId`, then add this guard in `addExistingParticipantToSession` after both records are loaded:

```ts
if (participant.villageId !== session.villageId) {
  throw new Error("선택한 참여자는 이 수업 일정의 마을에 속해 있지 않습니다.");
}
```

Add this focused regression test to `src/server/services/session-management.test.ts`.

```ts
it("rejects adding an existing participant from another village", async () => {
  const repository = {
    findSession: async () => ({
      id: "session-1",
      organizationId: "org-1",
      classId: "class-1",
      villageId: "village-1",
      submittedAt: null,
    }),
    findParticipant: async () => ({
      id: "participant-1",
      organizationId: "org-1",
      villageId: "village-2",
      fullName: "김영희",
      note: null,
    }),
    listSessionSnapshots: async () => [],
    insertSessionSnapshot: async () => {
      throw new Error("should not add participant from another village");
    },
    touchSession: async () => undefined,
    findApprovedTeacher: async () => null,
    updateSessionTeacher: async () => undefined,
    listApprovedTeachers: async () => [],
    listAvailableParticipants: async () => [],
    insertParticipant: async () => {
      throw new Error("not used");
    },
  };

  await expect(
    addExistingParticipantToSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        participantId: "participant-1",
      },
      repository,
    ),
  ).rejects.toThrow("선택한 참여자는 이 수업 일정의 마을에 속해 있지 않습니다.");
});
```

- [ ] **Step 4: Verify**

Run: `npm test -- src/server/services/session-management.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/session-management.ts src/server/services/session-management.test.ts
git commit -m "feat: filter schedule participants by village"
```

---

## Phase 2: New Console Design System

### Task 6: Replace Global Tokens With DURE Console Tokens

**Files:**
- Modify: `src/app/globals.css`
- Modify: `docs/UI_GUIDE.md`

- [ ] **Step 1: Update global CSS tokens**

Replace the current warm token block in `src/app/globals.css` with:

```css
:root {
  --background: #ebebeb;
  --foreground: #1e212f;
  --surface: #ffffff;
  --surface-alt: #e0e0e0;
  --border: #d4d4d4;
  --accent: #517bf6;
  --accent-surface: rgba(81, 123, 246, 0.1);
  --accent-ink: #ffffff;
  --sidebar: #2a2d3e;
  --sidebar-ink: #8e9096;
  --text-primary: #1e212f;
  --text-secondary: #6b6f7a;
  --success: #1a7f4b;
  --warning: #a06000;
  --danger: #b03030;
}
```

Also extend the existing `@theme inline` block so Tailwind arbitrary color variables used by `AppShell` resolve:

```css
@theme inline {
  --color-sidebar: var(--sidebar);
  --color-sidebar-ink: var(--sidebar-ink);
}
```

Keep the existing `@theme inline` mappings for background, surface, accent, text, status colors, font, and shadow; add these two sidebar mappings alongside them instead of replacing the whole block.

Set `body` font family to the new spec:

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Replace UI guide content**

Replace `docs/UI_GUIDE.md` with this content:

```md
# UI 디자인 가이드

이 문서는 DURE 운영자/강사용 웹 콘솔의 구현 기준이다. 기준 디자인은 `/Users/nojonghyeon/Downloads/DURE-Design-Spec.md`이며, 이전 warm messenger UI 규칙은 더 이상 사용하지 않는다.

## 원칙

1. 운영 콘솔처럼 빠르게 스캔되어야 한다.
2. 인증 후 화면은 고정 사이드바와 회색 작업 영역을 공유한다.
3. 카드와 패널은 그림자보다 보더로 구분한다.
4. Primary action과 active state는 `#517BF6`만 사용한다.
5. 사용자에게 보이는 용어는 `수업 일정`, `사업`, `마을`, `프로그램`, `출석 대상`을 우선한다.

## 색상

| 토큰 | 값 | 용도 |
|---|---|---|
| `--background` | `#EBEBEB` | 메인 작업 영역 배경 |
| `--surface` | `#FFFFFF` | 카드, 패널, 입력, 모달 |
| `--surface-alt` | `#E0E0E0` | 비활성 버튼, 보조 면 |
| `--sidebar` | `#2A2D3E` | 인증 후 좌측 사이드바 |
| `--sidebar-ink` | `#8E9096` | 비활성 사이드바 텍스트 |
| `--accent` | `#517BF6` | CTA, active nav, focus |
| `--text-primary` | `#1E212F` | 제목, 본문 핵심 |
| `--text-secondary` | `#6B6F7A` | 설명, 메타, placeholder |
| `--border` | `#D4D4D4` | 구분선, 카드, 입력 |

상태 색상은 success `#1A7F4B`, warning `#A06000`, danger `#B03030`을 사용한다.

## 타이포그래피

- Font family: `'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif`
- Page title: `22px`, `800`, `line-height: 1.3`
- Section title: `16px`, `700`, `line-height: 1.4`
- Body: `13px`, `500`, `line-height: 1.55`
- Meta: `11px`, `600`, `line-height: 1.4`
- Badge: `10px`, `700`, `letter-spacing: 0.05em`

## Shell

- Sidebar: fixed `220px`, background `#2A2D3E`, padding `16px 10px`.
- Main: background `#EBEBEB`, padding `24px 28px`.
- Section gap: `20px`.
- Card gap: `16px`.

## Components

### Card

```txt
rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]
```

Use shadows only for floating UI such as modals, dropdowns, and toasts.

### Button

```txt
Primary: rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white
Secondary: rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]
Danger: rounded-[10px] border border-[rgba(176,48,48,0.3)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-danger)]
```

### Input

```txt
h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]
```

### Status Chip

```txt
inline-flex rounded-full px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em]
```

Use color plus a clear Korean label. Do not rely on color alone.
```

- [ ] **Step 3: Verify**

Run: `npm test -- src/components/ui/shell.test.tsx`

Expected: PASS or update expected classes if the test asserts old warm tokens.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css docs/UI_GUIDE.md src/components/ui/shell.test.tsx
git commit -m "style: adopt DURE console design tokens"
```

### Task 7: Create Authenticated App Shell

**Files:**
- Create: `src/components/ui/app-shell.tsx`
- Modify: `src/app/(ops)/layout.tsx`
- Modify: `src/app/(teacher)/layout.tsx`
- Modify: `src/components/ui/shell.test.tsx`

- [ ] **Step 1: Create `AppShell`**

Create `src/components/ui/app-shell.tsx`.

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  role: "ops" | "teacher";
  email?: string | null;
  children: ReactNode;
};

const opsNav = [
  { href: "/dashboard", label: "대시보드", icon: "◈" },
  { href: "/records", label: "서류·기록", icon: "◎" },
  { href: "/settings", label: "운영 설정", icon: "◷" },
  { href: "/users", label: "사용자·권한", icon: "◑" },
];

const teacherNav = [
  { href: "/sessions", label: "내 수업 일정", icon: "◈" },
];

export function AppShell({ role, email, children }: AppShellProps) {
  const nav = role === "teacher" ? teacherNav : opsNav;
  const roleLabel = role === "teacher" ? "강사 영역" : "운영자 영역";

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <aside className="flex w-[220px] shrink-0 flex-col bg-[var(--color-sidebar)] px-[10px] py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-[30px] items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[13px] font-extrabold text-white">
            D
          </div>
          <div>
            <p className="text-[13px] font-extrabold leading-tight text-white">
              DURE
            </p>
            <p className="text-[10px] leading-tight text-[var(--color-sidebar-ink)]">
              운영 시스템
            </p>
          </div>
        </div>

        <span className="mx-2 mt-4 inline-flex w-fit rounded-full bg-[rgba(81,123,246,0.16)] px-3 py-1 text-[10px] font-bold text-white">
          {roleLabel}
        </span>

        <nav className="mt-5 flex flex-col gap-0.5" aria-label="주요 메뉴">
          {nav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="flex items-center gap-3 rounded-[14px] px-3 py-[9px] text-[13px] font-medium text-[var(--color-sidebar-ink)] transition-colors hover:bg-[rgba(142,144,150,0.12)]"
            >
              <span className="w-5 text-center text-[18px]" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-[rgba(142,144,150,0.2)] pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="size-[26px] rounded-full bg-[rgba(255,255,255,0.16)]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-white">
                {role === "teacher" ? "강사" : "운영자"}
              </p>
              <p className="truncate text-[10px] text-[var(--color-sidebar-ink)]">
                {email ?? "로그인 사용자"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-7 py-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Wrap layouts**

In `src/app/(ops)/layout.tsx`, replace the fragment containing `AuthSessionBar` with:

```tsx
return (
  <AppShell role="ops" email={authState.user?.email}>
    {children}
  </AppShell>
);
```

In `src/app/(teacher)/layout.tsx`, use:

```tsx
return (
  <AppShell role="teacher" email={authState.user?.email}>
    {children}
  </AppShell>
);
```

- [ ] **Step 3: Verify**

Run: `npm test -- src/components/ui/shell.test.tsx`

Expected: PASS after adding or updating tests to assert sidebar labels.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/app-shell.tsx src/app/(ops)/layout.tsx src/app/(teacher)/layout.tsx src/components/ui/shell.test.tsx
git commit -m "feat: add DURE console app shell"
```

---

## Phase 3: Operator Screens

### Task 8: Rework Operator Dashboard Around Schedule Creation

**Files:**
- Modify: `src/server/services/sessions.ts`
- Modify: `src/components/ops/dashboard-screen.tsx`
- Modify: `src/components/ops/dashboard-screen.test.tsx`

- [ ] **Step 1: Add dashboard participant data**

In `src/server/services/sessions.ts`, add `participants` to the schema import list, then add participant rows for village-based exclusion in `listSessionDashboardData`.

```ts
const participantRows = await db
  .select({
    id: participants.id,
    fullName: participants.fullName,
    note: participants.note,
    villageId: participants.villageId,
  })
  .from(participants)
  .where(eq(participants.organizationId, organizationId))
  .orderBy(asc(participants.fullName));
```

Return `participants: participantRows`.

Update the `SessionDashboardData` type in `src/components/ops/dashboard-screen.tsx` to include the returned participant rows.

```ts
participants: Array<{
  id: string;
  fullName: string;
  note: string | null;
  villageId: string | null;
}>;
```

Use `villageId` to filter the exclusion checklist as the operator chooses or types a village. If the typed village does not match an existing village yet, show the empty-state copy `마을을 선택하면 출석 대상 후보가 표시됩니다.` and submit with no excluded participant ids.

- [ ] **Step 2: Add component expectations**

In `src/components/ops/dashboard-screen.test.tsx`, assert the new creation language.

```tsx
expect(
  screen.getByRole("button", { name: "수업 일정 만들기" }),
).toBeInTheDocument();
fireEvent.click(screen.getByRole("button", { name: "수업 일정 만들기" }));
expect(
  screen.getByText("현재 마을 참여자 명단을 출석 대상으로 고정합니다."),
).toBeInTheDocument();
expect(screen.getByLabelText("진행일")).toBeInTheDocument();
expect(screen.getByLabelText("사업")).toBeInTheDocument();
expect(screen.getByLabelText("마을")).toBeInTheDocument();
expect(screen.getByLabelText("프로그램")).toBeInTheDocument();
```

- [ ] **Step 3: Rebuild dashboard layout**

Change `DashboardScreen` to the new console structure:

- Page header: `안녕하세요, 운영자님`, date, `수업 일정 만들기` primary button.
- Stats grid: 진행 중 사업, 이번 달 일정, 미제출 일지, 누적 참여자.
- Main split: left schedule list, right selected schedule detail.
- Bottom timeline: recent submissions and updates.

Use these visual constraints:

- Background inherited from shell `#EBEBEB`.
- Cards: `rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]`.
- Primary button: `rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white`.

- [ ] **Step 4: Replace creation form fields**

The modal/form must submit:

```tsx
<input type="date" name="sessionDate" aria-label="진행일" />
<input name="programName" list="program-options" aria-label="사업" />
<input name="villageName" list="village-options" aria-label="마을" />
<input name="className" list="class-options" aria-label="프로그램" />
<select name="teacherId" aria-label="담당 강사">
  <option value="">강사 미배정</option>
</select>
```

Add participant exclusion checkboxes named `excludedParticipantIds`.

- [ ] **Step 5: Verify**

Run: `npm test -- src/components/ops/dashboard-screen.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/server/services/sessions.ts src/components/ops/dashboard-screen.tsx src/components/ops/dashboard-screen.test.tsx
git commit -m "feat: rebuild dashboard around schedule creation"
```

### Task 9: Rework Schedule Management Detail Screen

**Files:**
- Modify: `src/components/ops/session-management-screen.tsx`
- Create: `src/components/ops/session-management-screen.test.tsx`

- [ ] **Step 1: Add detail screen test**

Create `src/components/ops/session-management-screen.test.tsx`.

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { SessionManagementScreen } from "@/components/ops/session-management-screen";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/server/actions/session-management", () => ({
  addExistingSessionParticipantAction: vi.fn(),
  assignSessionTeacherAction: vi.fn(),
  createSessionParticipantAction: vi.fn(),
}));

describe("SessionManagementScreen", () => {
  it("uses schedule detail terminology", () => {
    render(
      <SessionManagementScreen
        session={{
          id: "session-1",
          sessionDate: "2026-05-20",
          classId: "class-1",
          className: "스마트폰 기초",
          villageName: "다도리",
          programName: "문해 사업",
          teacherId: null,
          teacherName: null,
          teacherEmail: null,
          submittedAt: null,
          updatedAt: new Date("2026-05-20T09:00:00.000Z"),
          teachers: [],
          participants: [],
          snapshots: [],
        }}
      />,
    );

    expect(screen.getByText("수업 일정 관리")).toBeInTheDocument();
    expect(screen.getByText("수업 일정 상태")).toBeInTheDocument();
    expect(screen.getByText("기존 출석 대상자 추가")).toBeInTheDocument();
    expect(screen.getByText("새 출석 대상자 추가")).toBeInTheDocument();
    expect(screen.queryByText("세션 상태")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Update visible copy**

In `src/components/ops/session-management-screen.tsx`, make these copy changes:

- Eyebrow: `Session management` -> `수업 일정 관리`
- Chip: `참여자 {n}명` -> `출석 대상 {n}명`
- Panel title: `세션 상태` -> `수업 일정 상태`
- Panel description: `제출 여부와 최근 변경 시각을 확인하고 기록 상세로 이동합니다.`
- Panel title: `기존 참여자 추가` -> `기존 출석 대상자 추가`
- Panel description: `마을 참여자 명단에 있는 사람을 이 수업 일정의 출석 대상에 추가합니다.`
- Panel title: `새 참여자 추가` -> `새 출석 대상자 추가`
- Empty text: `아직 참여자가 없습니다.` -> `아직 출석 대상자가 없습니다.`

- [ ] **Step 3: Apply console layout**

In `src/components/ops/session-management-screen.tsx`, keep the existing two-column information architecture, but update styles:

```tsx
const panelClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]";
const inputClassName =
  "h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]";
const primaryButtonClassName =
  "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white";
const secondaryButtonClassName =
  "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]";
```

Remove `shadow-panel`, `rounded-[28px]`, `rounded-full` buttons, and oversized `text-4xl` headings from this screen.

- [ ] **Step 4: Verify**

Run:

Run: `npm test -- src/components/ops/session-management-screen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ops/session-management-screen.tsx src/components/ops/session-management-screen.test.tsx
git commit -m "refactor: rebuild schedule management detail"
```

### Task 10: Rework Records Browser And Record Detail Screens

**Files:**
- Modify: `src/components/records/records-browser.tsx`
- Create: `src/components/records/records-browser.test.tsx`
- Modify: `src/components/records/record-detail.tsx`
- Modify: `src/components/records/record-detail.test.tsx`

- [ ] **Step 1: Add records browser test**

Create `src/components/records/records-browser.test.tsx`.

```tsx
import { render, screen } from "@testing-library/react";

import { RecordsBrowser } from "@/components/records/records-browser";

describe("RecordsBrowser", () => {
  it("uses schedule terminology and keeps search controls visible", () => {
    render(
      <RecordsBrowser
        rows={[
          {
            id: "session-1",
            sessionDate: "2026-05-20",
            className: "스마트폰 기초",
            villageName: "다도리",
            programName: "문해 사업",
            teacherName: "김강사",
            teacherEmail: "teacher@example.com",
            submittedAt: null,
            updatedAt: new Date("2026-05-20T09:00:00.000Z"),
          },
        ]}
        filterOptions={{ programs: ["문해 사업"], teachers: ["김강사"] }}
        filters={{}}
      />,
    );

    expect(screen.getByRole("heading", { name: "서류·기록" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("프로그램, 사업, 마을, 강사 검색")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "수업 일정 관리" })).toHaveAttribute(
      "href",
      "/dashboard/sessions/session-1",
    );
  });
});
```

- [ ] **Step 2: Update records browser copy and layout**

In `src/components/records/records-browser.tsx`:

- Page eyebrow: `Records browser` -> remove the English eyebrow.
- Page title: `서류·기록`
- Description: `수업 일정별 출석, 교육일지, 첨부 문서를 검색하고 검토합니다.`
- Search placeholder: `프로그램, 사업, 마을, 강사 검색`
- Status option: `미제출` remains.
- Link label: `세션 관리` -> `수업 일정 관리`

Use the console card style:

```tsx
"rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]"
```

- [ ] **Step 3: Update record detail test**

In `src/components/records/record-detail.test.tsx`, update expected labels:

```tsx
expect(screen.getByRole("heading", { name: "기록 상세" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "수업 일정 관리" })).toHaveAttribute(
  "href",
  "/dashboard/sessions/session-1",
);
expect(screen.getByText("출석 대상")).toBeInTheDocument();
```

- [ ] **Step 4: Update record detail copy and layout**

In `src/components/records/record-detail.tsx`:

- Heading: `기록 상세`
- Back/action link to schedule detail: `수업 일정 관리`
- Attendance section label: `출석 대상`
- Keep `교육일지` and `첨부 문서`.
- Use status chip colors from the new console tokens: success `#1A7F4B`, warning `#A06000`, danger `#B03030`.
- Remove warm shadow classes and large rounded wrappers; use 18px cards and 10px controls.

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- src/components/records/records-browser.test.tsx src/components/records/record-detail.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/records/records-browser.tsx src/components/records/records-browser.test.tsx src/components/records/record-detail.tsx src/components/records/record-detail.test.tsx
git commit -m "refactor: rebuild records screens for schedules"
```

### Task 11: Rework Settings Screen After Village-Based Participants

**Files:**
- Modify: `src/components/ops/settings-screen.tsx`
- Modify: `src/components/ops/settings-screen.test.tsx`

- [ ] **Step 1: Add/adjust settings expectations**

In `src/components/ops/settings-screen.test.tsx`, assert the new master-data model:

```tsx
expect(screen.getByRole("heading", { name: "운영 설정" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /프로그램/ })).toBeInTheDocument();
expect(screen.getByLabelText("참여자 마을")).toBeInTheDocument();
expect(screen.queryByLabelText("참여자 수업")).not.toBeInTheDocument();
```

- [ ] **Step 2: Update Settings UI model**

In `src/components/ops/settings-screen.tsx`:

- Keep tabs/sections: `마을`, `사업`, `프로그램`, `참여자 명단`.
- Program form fields: `프로그램 이름`, `사업`, `설명`; no village select.
- Participant form fields: `참여자 이름`, `참여자 마을`, `메모`; no class/program select.
- Participant list row meta: show `participant.villageName ?? "마을 미지정"`.
- Empty state copy: `등록된 참여자 명단이 없습니다.`

- [ ] **Step 3: Apply console styles**

Use these classes in Settings:

```tsx
const sectionClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]";
const tabClassName =
  "rounded-[14px] px-3 py-[9px] text-[13px] font-medium";
const activeTabClassName =
  "bg-[var(--color-accent)] text-white";
```

Remove old warm accent classes such as `bg-[var(--color-accent-surface)] text-[var(--color-accent-ink)]` where they assumed yellow accent text.

- [ ] **Step 4: Verify**

Run: `npm test -- src/components/ops/settings-screen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ops/settings-screen.tsx src/components/ops/settings-screen.test.tsx
git commit -m "refactor: rebuild settings for village participants"
```

### Task 12: Rework Users And Permissions Screen

**Files:**
- Modify: `src/components/ops/users-screen.tsx`
- Modify: `src/components/ops/users-screen.test.tsx`

- [ ] **Step 1: Update user screen expectations**

In `src/components/ops/users-screen.test.tsx`, update text that references the old `수업` master type:

```tsx
expect(screen.getByRole("heading", { name: "사용자·권한" })).toBeInTheDocument();
expect(screen.getByText("배정된 프로그램")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "초대 토큰 발급" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "배정하기" })).toBeInTheDocument();
```

- [ ] **Step 2: Update visible copy**

In `src/components/ops/users-screen.tsx`:

- Page heading: `사용자 관리` -> `사용자·권한`
- Invite CTA: `초대 보내기` -> `초대 토큰 발급`
- Metric/copy: `배정된 수업` -> `배정된 프로그램`
- Assignment form select label: `프로그램`
- Keep role labels `플랫폼 관리자`, `기관 관리자`, `강사`.

- [ ] **Step 3: Apply console styles**

Use the same 18px card, 10px input/button, and blue primary button styles. Replace yellow shadows such as `rgba(204,166,0,0.18)` with no shadow.

- [ ] **Step 4: Verify**

Run: `npm test -- src/components/ops/users-screen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ops/users-screen.tsx src/components/ops/users-screen.test.tsx
git commit -m "refactor: rebuild user permissions screen"
```

---

## Phase 4: Teacher Screens

### Task 13: Rework Teacher Schedule List And Workspace

**Files:**
- Modify: `src/components/teacher/sessions-screen.tsx`
- Modify: `src/components/teacher/session-workspace.tsx`
- Create: `src/components/teacher/sessions-screen.test.tsx`
- Create: `src/components/teacher/session-workspace.test.tsx`

- [ ] **Step 1: Update visible list language**

In `src/components/teacher/sessions-screen.tsx`:

- Heading: `내 수업 일정`
- Tabs: `오늘`, `이번주`, `지난 회차`
- Card CTA: `기록하기`
- Empty state: `아직 배정된 수업 일정이 없습니다.`

- [ ] **Step 2: Update workspace language**

In `src/components/teacher/session-workspace.tsx`:

- Eyebrow: `수업 일정 기록`
- Snapshot chip: `출석 대상 {n}명`
- Attendance helper: `수업 일정 생성 시점의 출석 대상 명단을 기준으로 상태를 남깁니다.`
- Submit button: keep `최종 제출` or `수정 저장`; do not add real draft state in this iteration.

- [ ] **Step 3: Apply console card/control styles**

Use the same card, input, and primary button styles from Task 9.

- [ ] **Step 4: Add focused teacher component tests**

Create `src/components/teacher/sessions-screen.test.tsx`.

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { TeacherSessionsScreen } from "@/components/teacher/sessions-screen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("TeacherSessionsScreen", () => {
  it("shows the empty schedule state", () => {
    render(<TeacherSessionsScreen sessions={[]} selectedSession={null} />);

    expect(screen.getByText("내 수업 일정")).toBeInTheDocument();
    expect(
      screen.getByText("아직 배정된 수업 일정이 없습니다."),
    ).toBeInTheDocument();
  });
});
```

Create `src/components/teacher/session-workspace.test.tsx`.

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { TeacherSessionWorkspaceScreen } from "@/components/teacher/session-workspace";

vi.mock("@/server/actions/attachments", () => ({
  uploadTeacherAttachmentAction: vi.fn(),
}));

vi.mock("@/server/actions/submissions", () => ({
  submitTeacherSessionAction: vi.fn(),
}));

describe("TeacherSessionWorkspaceScreen", () => {
  it("shows schedule workspace copy and final submit action", () => {
    render(
      <TeacherSessionWorkspaceScreen
        session={{
          id: "session-1",
          sessionDate: "2026-05-20",
          className: "스마트폰 기초",
          villageName: "다도리",
          programName: "문해 사업",
          submittedAt: null,
          lessonJournal: "",
          attachments: [],
          snapshots: [
            {
              id: "snapshot-1",
              fullName: "김영희",
              note: null,
              rosterOrder: 0,
              attendanceStatus: "present",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("수업 일정 기록")).toBeInTheDocument();
    expect(screen.getByText("출석 대상 1명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "최종 제출" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- src/components/teacher/sessions-screen.test.tsx src/components/teacher/session-workspace.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/teacher
git commit -m "refactor: rebuild teacher schedule workspace"
```

---

## Phase 5: Verification

### Task 14: End-To-End Verification

**Files:**
- No source edits expected unless verification reveals defects.

- [ ] **Step 1: Run focused domain tests**

Run:

```bash
npm test -- src/lib/db/schema.test.ts src/lib/validations/sessions.test.ts src/server/services/sessions.test.ts src/server/services/settings.test.ts src/server/services/session-management.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run component tests**

Run:

```bash
npm test -- src/components/ops/dashboard-screen.test.tsx src/components/ops/session-management-screen.test.tsx src/components/ops/settings-screen.test.tsx src/components/ops/users-screen.test.tsx src/components/records/records-browser.test.tsx src/components/records/record-detail.test.tsx src/components/teacher/sessions-screen.test.tsx src/components/teacher/session-workspace.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run all tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS. If environment variables block the build, record the exact missing variable or error in the implementation notes.

- [ ] **Step 5: Run migration**

Run: `npm run db:migrate`

Expected: migration applies the generated `0003_*.sql` migration and records it in the database migration table.

- [ ] **Step 6: Start local app**

Run: `npm run dev`

Expected: app starts and prints a localhost URL.

- [ ] **Step 7: Manual smoke**

In browser:

1. Log in as an operator.
2. Open `/dashboard`.
3. Confirm the dark sidebar and gray console background render.
4. Click `수업 일정 만들기`.
5. Enter existing or new `사업`, existing `마을`, and existing or new `프로그램`.
6. Confirm the snapshot warning is visible.
7. Exclude one participant.
8. Submit.
9. Confirm redirect to `/dashboard/sessions/[sessionId]`.
10. Confirm the detail screen shows the expected 출석 대상 minus the excluded participant.
11. Log in as a teacher assigned to the schedule.
12. Confirm the teacher sees `내 수업 일정` and can open the workspace.
13. Submit attendance, education journal, and optional attachment.

- [ ] **Step 8: Final commit**

```bash
git status --short
git add src/lib/db/schema.ts src/lib/db/schema.test.ts drizzle src/lib/validations src/server src/components src/app docs/UI_GUIDE.md docs/superpowers/plans/2026-05-10-domain-first-console-redesign.md
git commit -m "feat: implement domain-first console redesign"
```

Do not stage unrelated user changes shown by `git status --short`.

---

## Self-Review

- Spec coverage: The plan covers the agreed order: domain/functionality first, then design. It includes participant village ownership, named schedule creation, village snapshotting, participant exclusion, redirect to schedule detail, Settings changes, terminology cleanup, console shell, operator screens, teacher screens, and verification.
- Placeholder scan: Clean. The plan has concrete files, commands, and implementation snippets.
- Type consistency: The plan keeps internal identifiers `sessions`, `classes`, `className`, `sessionId`, and routes stable while changing visible language to `수업 일정`, `프로그램`, and `출석 대상`.
