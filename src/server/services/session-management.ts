import { and, asc, eq, isNotNull } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  attendanceRecords,
  classes,
  organizationMemberships,
  participants,
  programs,
  sessionParticipantSnapshots,
  sessions,
  users,
  villages,
} from "@/lib/db/schema";

type ApprovedTeacher = {
  userId: string;
  email: string;
  displayName: string | null;
};

type ManagedSession = {
  id: string;
  organizationId: string;
  classId: string;
  villageId: string;
  submittedAt: Date | null;
};

type SessionParticipant = {
  id: string;
  organizationId: string;
  villageId: string | null;
  fullName: string;
  note: string | null;
};

type SessionSnapshot = {
  id: string;
  participantId: string | null;
  fullName: string;
  note: string | null;
  rosterOrder: number;
  attendanceStatus: "present" | "absent" | "late" | "excused" | null;
};

export type SessionManagementRepository = {
  findSession(
    organizationId: string,
    sessionId: string,
  ): Promise<ManagedSession | null>;
  findApprovedTeacher(
    organizationId: string,
    teacherId: string,
  ): Promise<ApprovedTeacher | null>;
  updateSessionTeacher(values: {
    organizationId: string;
    sessionId: string;
    teacherId: string | null;
  }): Promise<void>;
  listApprovedTeachers(organizationId: string): Promise<ApprovedTeacher[]>;
  listAvailableParticipants(
    organizationId: string,
    villageId: string,
  ): Promise<SessionParticipant[]>;
  findParticipant(
    organizationId: string,
    participantId: string,
  ): Promise<SessionParticipant | null>;
  insertParticipant(values: {
    organizationId: string;
    villageId: string | null;
    classId: string | null;
    fullName: string;
    note: string | null;
  }): Promise<SessionParticipant>;
  listSessionSnapshots(
    organizationId: string,
    sessionId: string,
  ): Promise<SessionSnapshot[]>;
  insertSessionSnapshot(values: {
    organizationId: string;
    sessionId: string;
    participantId: string;
    fullName: string;
    note: string | null;
    rosterOrder: number;
  }): Promise<void>;
  deleteSessionSnapshot?(values: {
    organizationId: string;
    sessionId: string;
    snapshotId: string;
  }): Promise<void>;
  touchSession(organizationId: string, sessionId: string): Promise<void>;
};

function createSessionManagementRepository(): SessionManagementRepository {
  const db = getDb();

  return {
    async findSession(organizationId, sessionId) {
      const [session] = await db
        .select({
          id: sessions.id,
          organizationId: sessions.organizationId,
          classId: sessions.classId,
          villageId: sessions.villageId,
          submittedAt: sessions.submittedAt,
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.organizationId, organizationId),
            eq(sessions.id, sessionId),
          ),
        )
        .limit(1);

      return session ?? null;
    },
    async findApprovedTeacher(organizationId, teacherId) {
      const [teacher] = await db
        .select({
          userId: users.id,
          email: users.email,
          displayName: users.displayName,
        })
        .from(organizationMemberships)
        .innerJoin(users, eq(organizationMemberships.userId, users.id))
        .where(
          and(
            eq(organizationMemberships.organizationId, organizationId),
            eq(organizationMemberships.userId, teacherId),
            eq(organizationMemberships.role, "teacher"),
            isNotNull(organizationMemberships.approvedAt),
          ),
        )
        .limit(1);

      return teacher ?? null;
    },
    async updateSessionTeacher(values) {
      await db
        .update(sessions)
        .set({
          teacherId: values.teacherId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sessions.organizationId, values.organizationId),
            eq(sessions.id, values.sessionId),
          ),
        );
    },
    async listApprovedTeachers(organizationId) {
      return db
        .select({
          userId: users.id,
          email: users.email,
          displayName: users.displayName,
        })
        .from(organizationMemberships)
        .innerJoin(users, eq(organizationMemberships.userId, users.id))
        .where(
          and(
            eq(organizationMemberships.organizationId, organizationId),
            eq(organizationMemberships.role, "teacher"),
            isNotNull(organizationMemberships.approvedAt),
          ),
        )
        .orderBy(asc(users.email));
    },
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
    },
    async findParticipant(organizationId, participantId) {
      const [participant] = await db
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
            eq(participants.id, participantId),
          ),
        )
        .limit(1);

      return participant ?? null;
    },
    async insertParticipant(values) {
      const [participant] = await db
        .insert(participants)
        .values(values)
        .returning({
          id: participants.id,
          organizationId: participants.organizationId,
          villageId: participants.villageId,
          fullName: participants.fullName,
          note: participants.note,
        });

      return participant;
    },
    async listSessionSnapshots(organizationId, sessionId) {
      return db
        .select({
          id: sessionParticipantSnapshots.id,
          participantId: sessionParticipantSnapshots.participantId,
          fullName: sessionParticipantSnapshots.fullName,
          note: sessionParticipantSnapshots.note,
          rosterOrder: sessionParticipantSnapshots.rosterOrder,
          attendanceStatus: attendanceRecords.status,
        })
        .from(sessionParticipantSnapshots)
        .leftJoin(
          attendanceRecords,
          eq(
            attendanceRecords.sessionParticipantSnapshotId,
            sessionParticipantSnapshots.id,
          ),
        )
        .where(
          and(
            eq(sessionParticipantSnapshots.organizationId, organizationId),
            eq(sessionParticipantSnapshots.sessionId, sessionId),
          ),
        )
        .orderBy(asc(sessionParticipantSnapshots.rosterOrder));
    },
    async insertSessionSnapshot(values) {
      await db.insert(sessionParticipantSnapshots).values(values);
    },
    async deleteSessionSnapshot(values) {
      await db
        .delete(sessionParticipantSnapshots)
        .where(
          and(
            eq(sessionParticipantSnapshots.organizationId, values.organizationId),
            eq(sessionParticipantSnapshots.sessionId, values.sessionId),
            eq(sessionParticipantSnapshots.id, values.snapshotId),
          ),
        );
    },
    async touchSession(organizationId, sessionId) {
      await db
        .update(sessions)
        .set({ updatedAt: new Date() })
        .where(
          and(
            eq(sessions.organizationId, organizationId),
            eq(sessions.id, sessionId),
          ),
        );
    },
  };
}

function nextRosterOrder(snapshots: SessionSnapshot[]) {
  if (!snapshots.length) {
    return 0;
  }

  return Math.max(...snapshots.map((snapshot) => snapshot.rosterOrder)) + 1;
}

export async function assignTeacherToSession(
  input: {
    organizationId: string;
    sessionId: string;
    teacherId: string | null;
  },
  repository: SessionManagementRepository = createSessionManagementRepository(),
) {
  const session = await repository.findSession(
    input.organizationId,
    input.sessionId,
  );

  if (!session) {
    throw new Error("선택한 세션을 찾을 수 없습니다.");
  }

  if (input.teacherId) {
    const teacher = await repository.findApprovedTeacher(
      input.organizationId,
      input.teacherId,
    );

    if (!teacher) {
      throw new Error("승인된 강사만 세션에 배정할 수 있습니다.");
    }
  }

  await repository.updateSessionTeacher({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    teacherId: input.teacherId,
  });
}

export async function addExistingParticipantToSession(
  input: {
    organizationId: string;
    sessionId: string;
    participantId: string;
  },
  repository: SessionManagementRepository = createSessionManagementRepository(),
) {
  const [session, participant, snapshots] = await Promise.all([
    repository.findSession(input.organizationId, input.sessionId),
    repository.findParticipant(input.organizationId, input.participantId),
    repository.listSessionSnapshots(input.organizationId, input.sessionId),
  ]);

  if (!session) {
    throw new Error("선택한 세션을 찾을 수 없습니다.");
  }

  if (!participant) {
    throw new Error("선택한 참여자를 찾을 수 없습니다.");
  }

  if (participant.villageId !== session.villageId) {
    throw new Error("선택한 참여자는 이 수업 일정의 마을에 속해 있지 않습니다.");
  }

  if (
    snapshots.some((snapshot) => snapshot.participantId === input.participantId)
  ) {
    return { added: false };
  }

  await repository.insertSessionSnapshot({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    participantId: participant.id,
    fullName: participant.fullName,
    note: participant.note,
    rosterOrder: nextRosterOrder(snapshots),
  });
  await repository.touchSession(input.organizationId, input.sessionId);

  return { added: true };
}

export async function createAndAddParticipantToSession(
  input: {
    organizationId: string;
    sessionId: string;
    fullName: string;
    note?: string | null;
  },
  repository: SessionManagementRepository = createSessionManagementRepository(),
) {
  const [session, snapshots] = await Promise.all([
    repository.findSession(input.organizationId, input.sessionId),
    repository.listSessionSnapshots(input.organizationId, input.sessionId),
  ]);

  if (!session) {
    throw new Error("선택한 세션을 찾을 수 없습니다.");
  }

  const participant = await repository.insertParticipant({
    organizationId: input.organizationId,
    villageId: session.villageId,
    classId: null,
    fullName: input.fullName.trim(),
    note: input.note?.trim() || null,
  });

  await repository.insertSessionSnapshot({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    participantId: participant.id,
    fullName: participant.fullName,
    note: participant.note,
    rosterOrder: nextRosterOrder(snapshots),
  });
  await repository.touchSession(input.organizationId, input.sessionId);

  return { participantId: participant.id };
}

export async function removeParticipantFromSession(
  input: {
    organizationId: string;
    sessionId: string;
    snapshotId: string;
  },
  repository: SessionManagementRepository = createSessionManagementRepository(),
) {
  const session = await repository.findSession(
    input.organizationId,
    input.sessionId,
  );

  if (!session) {
    throw new Error("선택한 세션을 찾을 수 없습니다.");
  }

  if (!repository.deleteSessionSnapshot) {
    throw new Error("세션 참여자 제거 기능을 사용할 수 없습니다.");
  }

  await repository.deleteSessionSnapshot({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    snapshotId: input.snapshotId,
  });
  await repository.touchSession(input.organizationId, input.sessionId);
}

export async function getOperatorSessionManagement(
  organizationId: string,
  sessionId: string,
) {
  const db = getDb();

  const [session] = await db
    .select({
      id: sessions.id,
      sessionDate: sessions.sessionDate,
      classId: sessions.classId,
      villageId: sessions.villageId,
      className: classes.name,
      villageName: villages.name,
      programName: programs.name,
      teacherId: sessions.teacherId,
      teacherName: users.displayName,
      teacherEmail: users.email,
      submittedAt: sessions.submittedAt,
      updatedAt: sessions.updatedAt,
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(villages, eq(sessions.villageId, villages.id))
    .innerJoin(programs, eq(sessions.programId, programs.id))
    .leftJoin(users, eq(sessions.teacherId, users.id))
    .where(and(eq(sessions.organizationId, organizationId), eq(sessions.id, sessionId)))
    .limit(1);

  if (!session) {
    return null;
  }

  const repository = createSessionManagementRepository();
  const [teachers, participantsList, snapshots] = await Promise.all([
    repository.listApprovedTeachers(organizationId),
    repository.listAvailableParticipants(organizationId, session.villageId),
    repository.listSessionSnapshots(organizationId, sessionId),
  ]);
  const snapshotParticipantIds = new Set(
    snapshots
      .map((snapshot) => snapshot.participantId)
      .filter((participantId): participantId is string => Boolean(participantId)),
  );

  return {
    ...session,
    teachers,
    participants: participantsList.filter(
      (participant) => !snapshotParticipantIds.has(participant.id),
    ),
    snapshots,
  };
}
