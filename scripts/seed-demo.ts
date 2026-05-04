import { createClient } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

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

type SeededParticipant = typeof participants.$inferSelect;

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
    throw createError ?? new Error(`Could not create demo user ${demoEmail}.`);
  }

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  const existing = data.users.find((user) => user.email === demoEmail);

  if (!existing) {
    throw new Error(`Demo user ${demoEmail} exists but could not be found.`);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    existing.id,
    {
      password: demoPassword,
      user_metadata: {
        display_name: "데모 운영자",
      },
    },
  );

  if (updateError) {
    throw updateError;
  }

  return existing;
}

async function resetOrganizationData(organizationId: string) {
  await db.delete(lessonJournals).where(eq(lessonJournals.organizationId, organizationId));
  await db.delete(attendanceRecords).where(eq(attendanceRecords.organizationId, organizationId));
  await db
    .delete(sessionParticipantSnapshots)
    .where(eq(sessionParticipantSnapshots.organizationId, organizationId));
  await db.delete(sessions).where(eq(sessions.organizationId, organizationId));
  await db.delete(participants).where(eq(participants.organizationId, organizationId));
  await db.delete(classes).where(eq(classes.organizationId, organizationId));
  await db.delete(programs).where(eq(programs.organizationId, organizationId));
  await db.delete(villages).where(eq(villages.organizationId, organizationId));
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

  await resetOrganizationData(organization.id);

  const [primaryVillage] = await db
    .insert(villages)
    .values({
      organizationId: organization.id,
      name: "햇살마을",
      isPrimary: true,
      updatedAt: now,
    })
    .returning();

  const [secondaryVillage] = await db
    .insert(villages)
    .values({
      organizationId: organization.id,
      name: "도란마을",
      isPrimary: false,
      updatedAt: now,
    })
    .returning();

  const [literacyProgram] = await db
    .insert(programs)
    .values({
      organizationId: organization.id,
      name: "돌봄 문해",
      description: "기초 문해와 일상 소통을 돕는 데모 사업입니다.",
      updatedAt: now,
    })
    .returning();

  const [digitalProgram] = await db
    .insert(programs)
    .values({
      organizationId: organization.id,
      name: "생활 디지털",
      description: "스마트폰과 생활 앱 사용을 연습하는 데모 사업입니다.",
      updatedAt: now,
    })
    .returning();

  const [literacyClass] = await db
    .insert(classes)
    .values({
      organizationId: organization.id,
      villageId: primaryVillage.id,
      programId: literacyProgram.id,
      name: "문해 기초 A",
      description: "공개 데모용 문해 수업입니다.",
      updatedAt: now,
    })
    .returning();

  const [digitalClass] = await db
    .insert(classes)
    .values({
      organizationId: organization.id,
      villageId: secondaryVillage.id,
      programId: digitalProgram.id,
      name: "스마트폰 생활반",
      description: "공개 데모용 디지털 생활 수업입니다.",
      updatedAt: now,
    })
    .returning();

  const participantSeeds = [
    { fullName: "김경원", classId: literacyClass.id, note: "읽기 자신감 향상 중" },
    { fullName: "이복순", classId: literacyClass.id, note: "받아쓰기 연습 필요" },
    { fullName: "박영자", classId: literacyClass.id, note: "출석 안정적" },
    { fullName: "최정희", classId: literacyClass.id, note: "큰 글씨 자료 선호" },
    { fullName: "정미숙", classId: literacyClass.id, note: "동시 읽기 적극 참여" },
    { fullName: "오금자", classId: digitalClass.id, note: "카카오톡 사진 전송 연습" },
    { fullName: "한순덕", classId: digitalClass.id, note: "터치 조작 보조 필요" },
    { fullName: "유말순", classId: digitalClass.id, note: "지도 앱 사용 관심" },
    { fullName: "장옥희", classId: digitalClass.id, note: "복습 알림 선호" },
    { fullName: "서분희", classId: digitalClass.id, note: "문자 입력 연습 중" },
  ];

  const seededParticipants: SeededParticipant[] = [];

  for (const participantSeed of participantSeeds) {
    const [participant] = await db
      .insert(participants)
      .values({
        organizationId: organization.id,
        classId: participantSeed.classId,
        fullName: participantSeed.fullName,
        note: participantSeed.note,
        updatedAt: now,
      })
      .returning();

    seededParticipants.push(participant);
  }

  const literacyParticipants = seededParticipants.filter(
    (participant) => participant.classId === literacyClass.id,
  );
  const digitalParticipants = seededParticipants.filter(
    (participant) => participant.classId === digitalClass.id,
  );

  async function createSession(values: {
    classId: string;
    villageId: string;
    programId: string;
    sessionDate: string;
    submitted: boolean;
    journal?: string;
    roster: typeof seededParticipants;
  }) {
    const [session] = await db
      .insert(sessions)
      .values({
        organizationId: organization.id,
        villageId: values.villageId,
        programId: values.programId,
        classId: values.classId,
        teacherId: authUser.id,
        sessionDate: values.sessionDate,
        submittedAt: values.submitted ? now : null,
        updatedAt: now,
      })
      .returning();

    for (const [index, participant] of values.roster.entries()) {
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

      if (!values.submitted) {
        continue;
      }

      const status = ["present", "absent", "late", "excused"][
        index % 4
      ] as "present" | "absent" | "late" | "excused";

      await db.insert(attendanceRecords).values({
        organizationId: organization.id,
        sessionId: session.id,
        sessionParticipantSnapshotId: snapshot.id,
        status,
        updatedAt: now,
      });
    }

    if (values.submitted && values.journal) {
      await db.insert(lessonJournals).values({
        organizationId: organization.id,
        sessionId: session.id,
        body: values.journal,
        updatedAt: now,
      });
    }
  }

  await createSession({
    classId: literacyClass.id,
    villageId: primaryVillage.id,
    programId: literacyProgram.id,
    sessionDate: "2026-04-27",
    submitted: true,
    roster: literacyParticipants,
    journal: "오늘은 이름 쓰기와 생활 문장을 함께 연습했습니다.",
  });

  await createSession({
    classId: digitalClass.id,
    villageId: secondaryVillage.id,
    programId: digitalProgram.id,
    sessionDate: "2026-04-29",
    submitted: true,
    roster: digitalParticipants,
    journal: "사진 보내기와 알림 확인을 반복해서 실습했습니다.",
  });

  await createSession({
    classId: literacyClass.id,
    villageId: primaryVillage.id,
    programId: literacyProgram.id,
    sessionDate: "2026-05-04",
    submitted: false,
    roster: literacyParticipants,
  });

  const [membership] = await db
    .select({ id: organizationMemberships.id })
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.organizationId, organization.id),
        eq(organizationMemberships.userId, authUser.id),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("Demo membership was not created.");
  }

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
