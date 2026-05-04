import { and, asc, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  classes,
  programs,
  sessionParticipantSnapshots,
  sessions,
  teacherAssignments,
  users,
  villages,
} from "@/lib/db/schema";

type SessionClassRecord = {
  id: string;
  organizationId: string;
  name: string;
  programId: string | null;
  villageId: string | null;
};

type SessionParticipantRecord = {
  id: string;
  organizationId: string;
  fullName: string;
  note: string | null;
};

type SessionTeacherAssignmentRecord = {
  classId: string;
  userId: string;
};

type TeacherSessionRecord = {
  id: string;
  teacherId: string | null;
  sessionDate: string;
  className: string;
  villageName: string;
  programName: string;
  submittedAt: Date | null;
};

type TeacherSessionSnapshotRecord = {
  id: string;
  fullName: string;
  note: string | null;
  rosterOrder: number;
};

type SessionRepository = {
  findClassRecord(
    organizationId: string,
    classId: string,
  ): Promise<SessionClassRecord | null>;
  hasVillageRecord(organizationId: string, villageId: string): Promise<boolean>;
  hasProgramRecord(organizationId: string, programId: string): Promise<boolean>;
  findTeacherAssignment(
    organizationId: string,
    classId: string,
    teacherId: string,
  ): Promise<SessionTeacherAssignmentRecord | null>;
  insertSession(
    values: typeof sessions.$inferInsert,
  ): Promise<{ id: string; organizationId: string }>;
  insertSessionParticipantSnapshots(
    values: Array<typeof sessionParticipantSnapshots.$inferInsert>,
  ): Promise<void>;
};

type TeacherSessionRepository = {
  listOrganizationSessions(organizationId: string): Promise<TeacherSessionRecord[]>;
  findOrganizationSessionById(
    organizationId: string,
    sessionId: string,
  ): Promise<TeacherSessionRecord | null>;
  listSessionSnapshots(
    organizationId: string,
    sessionId: string,
  ): Promise<TeacherSessionSnapshotRecord[]>;
};

function createSessionRepository(): SessionRepository {
  const db = getDb();

  return {
    async findClassRecord(organizationId, classId) {
      const [classRecord] = await db
        .select({
          id: classes.id,
          organizationId: classes.organizationId,
          name: classes.name,
          programId: classes.programId,
          villageId: classes.villageId,
        })
        .from(classes)
        .where(
          and(
            eq(classes.organizationId, organizationId),
            eq(classes.id, classId),
          ),
        )
        .limit(1);

      return classRecord ?? null;
    },
    async hasVillageRecord(organizationId, villageId) {
      const [village] = await db
        .select({ id: villages.id })
        .from(villages)
        .where(
          and(
            eq(villages.organizationId, organizationId),
            eq(villages.id, villageId),
          ),
        )
        .limit(1);

      return Boolean(village);
    },
    async hasProgramRecord(organizationId, programId) {
      const [program] = await db
        .select({ id: programs.id })
        .from(programs)
        .where(
          and(
            eq(programs.organizationId, organizationId),
            eq(programs.id, programId),
          ),
        )
        .limit(1);

      return Boolean(program);
    },
    async findTeacherAssignment(organizationId, classId, teacherId) {
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
    async insertSession(values) {
      const [session] = await db.insert(sessions).values(values).returning({
        id: sessions.id,
        organizationId: sessions.organizationId,
      });

      return session;
    },
    async insertSessionParticipantSnapshots(values) {
      if (!values.length) {
        return;
      }

      await db.insert(sessionParticipantSnapshots).values(values);
    },
  };
}

function createTeacherSessionRepository(): TeacherSessionRepository {
  const db = getDb();

  return {
    async listOrganizationSessions(organizationId) {
      return db
        .select({
          id: sessions.id,
          teacherId: sessions.teacherId,
          sessionDate: sessions.sessionDate,
          className: classes.name,
          villageName: villages.name,
          programName: programs.name,
          submittedAt: sessions.submittedAt,
        })
        .from(sessions)
        .innerJoin(classes, eq(sessions.classId, classes.id))
        .innerJoin(villages, eq(sessions.villageId, villages.id))
        .innerJoin(programs, eq(sessions.programId, programs.id))
        .where(eq(sessions.organizationId, organizationId))
        .orderBy(desc(sessions.sessionDate));
    },
    async findOrganizationSessionById(organizationId, sessionId) {
      const [session] = await db
        .select({
          id: sessions.id,
          teacherId: sessions.teacherId,
          sessionDate: sessions.sessionDate,
          className: classes.name,
          villageName: villages.name,
          programName: programs.name,
          submittedAt: sessions.submittedAt,
        })
        .from(sessions)
        .innerJoin(classes, eq(sessions.classId, classes.id))
        .innerJoin(villages, eq(sessions.villageId, villages.id))
        .innerJoin(programs, eq(sessions.programId, programs.id))
        .where(
          and(
            eq(sessions.organizationId, organizationId),
            eq(sessions.id, sessionId),
          ),
        )
        .limit(1);

      return session ?? null;
    },
    async listSessionSnapshots(organizationId, sessionId) {
      return db
        .select({
          id: sessionParticipantSnapshots.id,
          fullName: sessionParticipantSnapshots.fullName,
          note: sessionParticipantSnapshots.note,
          rosterOrder: sessionParticipantSnapshots.rosterOrder,
        })
        .from(sessionParticipantSnapshots)
        .where(
          and(
            eq(sessionParticipantSnapshots.organizationId, organizationId),
            eq(sessionParticipantSnapshots.sessionId, sessionId),
          ),
        )
        .orderBy(asc(sessionParticipantSnapshots.rosterOrder));
    },
  };
}

export function buildSessionParticipantSnapshots(
  sessionId: string,
  organizationId: string,
  participantRows: SessionParticipantRecord[],
) {
  return participantRows.map((participant, index) => ({
    sessionId,
    organizationId,
    participantId: participant.id,
    rosterOrder: index,
    fullName: participant.fullName,
    note: participant.note,
  }));
}

export function filterTeacherAssignedSessions(
  teacherId: string,
  sessionRows: TeacherSessionRecord[],
) {
  return sessionRows.filter((session) => session.teacherId === teacherId);
}

export async function createSessionRecord(
  input: {
    organizationId: string;
    villageId: string;
    programId: string;
    classId: string;
    teacherId?: string | null;
    sessionDate: string;
  },
  repository: SessionRepository = createSessionRepository(),
) {
  const [hasVillage, hasProgram, classRecord] =
    await Promise.all([
      repository.hasVillageRecord(input.organizationId, input.villageId),
      repository.hasProgramRecord(input.organizationId, input.programId),
      repository.findClassRecord(input.organizationId, input.classId),
    ]);

  if (!hasVillage) {
    throw new Error("선택한 마을 정보를 찾을 수 없습니다.");
  }

  if (!hasProgram) {
    throw new Error("선택한 사업 정보를 찾을 수 없습니다.");
  }

  if (!classRecord) {
    throw new Error("선택한 수업 정보를 찾을 수 없습니다.");
  }

  if (!classRecord.programId) {
    throw new Error("선택한 수업에 사업 연결이 없어 세션을 만들 수 없습니다.");
  }

  if (!classRecord.villageId) {
    throw new Error("선택한 수업에 마을 연결이 없어 세션을 만들 수 없습니다.");
  }

  if (classRecord.programId !== input.programId) {
    throw new Error("선택한 수업과 사업 조합이 맞지 않습니다.");
  }

  if (classRecord.villageId !== input.villageId) {
    throw new Error("선택한 수업과 마을 조합이 맞지 않습니다.");
  }

  if (input.teacherId) {
    const teacherAssignment = await repository.findTeacherAssignment(
      input.organizationId,
      input.classId,
      input.teacherId,
    );

    if (!teacherAssignment) {
      throw new Error("선택한 강사가 이 수업에 배정되어 있지 않습니다.");
    }
  }

  const session = await repository.insertSession({
    organizationId: input.organizationId,
    villageId: input.villageId,
    programId: input.programId,
    classId: input.classId,
    teacherId: input.teacherId || null,
    sessionDate: input.sessionDate,
  });

  return {
    sessionId: session.id,
    snapshotCount: 0,
  };
}

export async function listSessionDashboardData(organizationId: string) {
  const db = getDb();

  const [
    villageRows,
    programRows,
    classRows,
    teacherAssignmentRows,
    recentSessionRows,
  ] = await Promise.all([
    db
      .select({
        id: villages.id,
        name: villages.name,
      })
      .from(villages)
      .where(eq(villages.organizationId, organizationId))
      .orderBy(asc(villages.name)),
    db
      .select({
        id: programs.id,
        name: programs.name,
      })
      .from(programs)
      .where(eq(programs.organizationId, organizationId))
      .orderBy(asc(programs.name)),
    db
      .select({
        id: classes.id,
        name: classes.name,
        programId: classes.programId,
        villageId: classes.villageId,
        programName: programs.name,
        villageName: villages.name,
      })
      .from(classes)
      .leftJoin(programs, eq(classes.programId, programs.id))
      .leftJoin(villages, eq(classes.villageId, villages.id))
      .where(eq(classes.organizationId, organizationId))
      .orderBy(asc(classes.name)),
    db
      .select({
        classId: teacherAssignments.classId,
        className: classes.name,
        teacherId: users.id,
        teacherName: users.displayName,
        teacherEmail: users.email,
      })
      .from(teacherAssignments)
      .innerJoin(classes, eq(teacherAssignments.classId, classes.id))
      .innerJoin(users, eq(teacherAssignments.userId, users.id))
      .where(eq(teacherAssignments.organizationId, organizationId))
      .orderBy(asc(classes.name), asc(users.email)),
    db
      .select({
        id: sessions.id,
        sessionDate: sessions.sessionDate,
        className: classes.name,
        villageName: villages.name,
        programName: programs.name,
        teacherName: users.displayName,
        teacherEmail: users.email,
        snapshotCount:
          sql<number>`count(${sessionParticipantSnapshots.id})`.mapWith(Number),
        submittedAt: sessions.submittedAt,
      })
      .from(sessions)
      .innerJoin(classes, eq(sessions.classId, classes.id))
      .innerJoin(villages, eq(sessions.villageId, villages.id))
      .innerJoin(programs, eq(sessions.programId, programs.id))
        .leftJoin(users, eq(sessions.teacherId, users.id))
      .leftJoin(
        sessionParticipantSnapshots,
        eq(sessionParticipantSnapshots.sessionId, sessions.id),
      )
      .where(eq(sessions.organizationId, organizationId))
      .groupBy(
        sessions.id,
        sessions.sessionDate,
        sessions.submittedAt,
        classes.name,
        villages.name,
        programs.name,
        users.displayName,
        users.email,
      )
      .orderBy(desc(sessions.sessionDate))
      .limit(8),
  ]);

  return {
    villages: villageRows,
    programs: programRows,
    classes: classRows,
    teacherAssignments: teacherAssignmentRows,
    recentSessions: recentSessionRows,
  };
}

export async function listTeacherSessionCards(
  organizationId: string,
  teacherId: string,
  repository: TeacherSessionRepository = createTeacherSessionRepository(),
) {
  const sessionRows = await repository.listOrganizationSessions(organizationId);

  return filterTeacherAssignedSessions(teacherId, sessionRows);
}

export async function getTeacherSessionWorkspace(
  organizationId: string,
  teacherId: string,
  sessionId: string,
  repository: TeacherSessionRepository = createTeacherSessionRepository(),
) {
  const session = await repository.findOrganizationSessionById(
    organizationId,
    sessionId,
  );

  if (!session || session.teacherId !== teacherId) {
    return null;
  }

  const snapshots = await repository.listSessionSnapshots(organizationId, sessionId);

  return {
    ...session,
    snapshots,
  };
}
