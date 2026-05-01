import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  attachments,
  attendanceRecords,
  lessonJournals,
  sessionParticipantSnapshots,
  sessions,
  users,
  classes,
  villages,
  programs,
} from "@/lib/db/schema";

type RecordStatus = "all" | "submitted" | "pending" | "updated";

type RecordSummaryRow = {
  id: string;
  sessionDate: string;
  className: string;
  villageName: string;
  programName: string;
  teacherName: string | null;
  teacherEmail: string | null;
  submittedAt: Date | null;
  updatedAt: Date;
};

export function applyRecordFilters(
  rows: RecordSummaryRow[],
  filters: {
    search?: string;
    status?: RecordStatus;
    program?: string;
    teacher?: string;
  },
) {
  const query = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.status === "submitted" && !row.submittedAt) {
      return false;
    }

    if (filters.status === "pending" && row.submittedAt) {
      return false;
    }

    if (
      filters.status === "updated" &&
      (!row.submittedAt ||
        new Date(row.updatedAt).getTime() <= new Date(row.submittedAt).getTime())
    ) {
      return false;
    }

    if (filters.program && row.programName !== filters.program) {
      return false;
    }

    if (
      filters.teacher &&
      (row.teacherName ?? row.teacherEmail ?? "강사 미할당") !== filters.teacher
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      row.className,
      row.programName,
      row.villageName,
      row.teacherName ?? "",
      row.teacherEmail ?? "강사 미할당",
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export async function listOperatorRecords(
  organizationId: string,
  filters: {
    search?: string;
    status?: RecordStatus;
    program?: string;
    teacher?: string;
  },
) {
  const db = getDb();

  const rows = await db
    .select({
      id: sessions.id,
      sessionDate: sessions.sessionDate,
      className: classes.name,
      villageName: villages.name,
      programName: programs.name,
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
    .where(eq(sessions.organizationId, organizationId))
    .orderBy(asc(classes.name), asc(sessions.sessionDate));

  return {
    rows: applyRecordFilters(rows, filters),
    filterOptions: {
      programs: Array.from(new Set(rows.map((row) => row.programName))).sort(),
      teachers: Array.from(
        new Set(rows.map((row) => row.teacherName ?? row.teacherEmail ?? "강사 미할당")),
      ).sort(),
    },
  };
}

export async function getOperatorRecordDetail(
  organizationId: string,
  sessionId: string,
) {
  const db = getDb();

  const [session, attendanceRows, journal, attachmentRows] = await Promise.all([
    db
      .select({
        id: sessions.id,
        organizationId: sessions.organizationId,
        sessionDate: sessions.sessionDate,
        className: classes.name,
        villageName: villages.name,
        programName: programs.name,
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
      .where(
        and(
          eq(sessions.organizationId, organizationId),
          eq(sessions.id, sessionId),
        ),
      )
      .limit(1),
    db
      .select({
        snapshotId: sessionParticipantSnapshots.id,
        fullName: sessionParticipantSnapshots.fullName,
        note: sessionParticipantSnapshots.note,
        rosterOrder: sessionParticipantSnapshots.rosterOrder,
        status: attendanceRecords.status,
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
      .orderBy(asc(sessionParticipantSnapshots.rosterOrder)),
    db
      .select({
        body: lessonJournals.body,
      })
      .from(lessonJournals)
      .where(
        and(
          eq(lessonJournals.organizationId, organizationId),
          eq(lessonJournals.sessionId, sessionId),
        ),
      )
      .limit(1),
    db
      .select({
        id: attachments.id,
        fileName: attachments.fileName,
        mimeType: attachments.mimeType,
        size: attachments.size,
        filePath: attachments.filePath,
      })
      .from(attachments)
      .where(
        and(
          eq(attachments.organizationId, organizationId),
          eq(attachments.sessionId, sessionId),
        ),
      )
      .orderBy(asc(attachments.createdAt)),
  ]);

  if (!session[0]) {
    return null;
  }

  return {
    ...session[0],
    attendance: attendanceRows,
    lessonJournal: journal[0]?.body ?? "",
    attachments: attachmentRows,
  };
}
