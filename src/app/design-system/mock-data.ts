export const mockSessionDashboardData = {
  villages: [
    { id: "v1", name: "종로구 마을" },
    { id: "v2", name: "강남구 마을" },
  ],
  programs: [
    { id: "p1", name: "2026 청소년 교육 지원" },
    { id: "p2", name: "디지털 리터러시 캠프" },
  ],
  classes: [
    {
      id: "c1",
      name: "코딩 기초반",
      programId: "p1",
      villageId: "v1",
      programName: "2026 청소년 교육 지원",
      villageName: "종로구 마을",
    },
    {
      id: "c2",
      name: "파이썬 심화",
      programId: "p1",
      villageId: "v2",
      programName: "2026 청소년 교육 지원",
      villageName: "강남구 마을",
    },
  ],
  teacherAssignments: [
    {
      classId: "c1",
      className: "코딩 기초반",
      teacherId: "t1",
      teacherName: "홍길동",
      teacherEmail: "hong@example.com",
    },
    {
      classId: "c2",
      className: "파이썬 심화",
      teacherId: "t2",
      teacherName: "김철수",
      teacherEmail: "kim@example.com",
    },
  ],
  recentSessions: [
    {
      id: "s1",
      sessionDate: "2026-05-10",
      className: "코딩 기초반",
      villageName: "종로구 마을",
      programName: "2026 청소년 교육 지원",
      teacherName: "홍길동",
      teacherEmail: "hong@example.com",
      snapshotCount: 15,
      submittedAt: new Date("2026-05-10T18:00:00Z"),
    },
    {
      id: "s2",
      sessionDate: "2026-05-11",
      className: "파이썬 심화",
      villageName: "강남구 마을",
      programName: "2026 청소년 교육 지원",
      teacherName: null,
      teacherEmail: null,
      snapshotCount: 12,
      submittedAt: null,
    },
  ],
  participants: [
    { id: "pa1", fullName: "학생1", note: "알러지 주의", villageId: "v1" },
    { id: "pa2", fullName: "학생2", note: null, villageId: "v1" },
    { id: "pa3", fullName: "학생3", note: null, villageId: "v2" },
  ],
};

export const mockDashboardQueryData = {
  setupGaps: [],
  recentSubmissions: [
    {
      id: "s1",
      sessionDate: "2026-05-10",
      className: "코딩 기초반",
      villageName: "종로구 마을",
      programName: "2026 청소년 교육 지원",
      teacherName: "홍길동",
      teacherEmail: "hong@example.com",
      submittedAt: new Date("2026-05-10T18:00:00Z"),
      updatedAt: new Date("2026-05-10T18:00:00Z"),
    },
  ],
  recentUpdates: [],
  submissionOverview: {
    totalSessions: 12,
    submittedSessions: 10,
    pendingSessions: 2,
    completionRate: 83.3,
    attendanceCount: 150,
    journalCount: 10,
    attachmentCount: 20,
  },
  pendingSessions: [
    {
      id: "s2",
      sessionDate: "2026-05-11",
      className: "파이썬 심화",
      villageName: "강남구 마을",
      programName: "2026 청소년 교육 지원",
      teacherName: "강사 미배정",
      teacherEmail: null,
      submittedAt: null,
      updatedAt: new Date("2026-05-11T09:00:00Z"),
    },
  ],
};

export const mockUserManagementData = {
  members: [
    {
      membershipId: "m1",
      userId: "u1",
      email: "admin@dure.com",
      displayName: "최고관리자",
      role: "platform_admin" as const,
      approvedAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      membershipId: "m2",
      userId: "u2",
      email: "hong@example.com",
      displayName: "홍길동",
      role: "teacher" as const,
      approvedAt: new Date("2026-02-01T00:00:00Z"),
    },
    {
      membershipId: "m3",
      userId: "u3",
      email: "pending@example.com",
      displayName: "대기자",
      role: "teacher" as const,
      approvedAt: null,
    },
  ],
  invites: [
    {
      id: "i1",
      email: "new_teacher@example.com",
      role: "teacher" as const,
      inviteToken: "TOKEN_123456",
      expiresAt: new Date("2026-12-31T00:00:00Z"),
      acceptedAt: null,
    },
  ],
  assignments: [
    {
      id: "a1",
      className: "코딩 기초반",
      userEmail: "hong@example.com",
    },
  ],
  classes: [
    { id: "c1", name: "코딩 기초반" },
    { id: "c2", name: "파이썬 심화" },
  ],
};

export const mockSessionManagementData = {
  id: "s1",
  sessionDate: "2026-05-10",
  className: "코딩 기초반",
  villageName: "종로구 마을",
  programName: "2026 청소년 교육 지원",
  teacherId: "t1",
  teacherName: "홍길동",
  teacherEmail: "hong@example.com",
  submittedAt: null,
  updatedAt: new Date("2026-05-10T18:00:00Z"),
  teachers: [
    { userId: "t1", email: "hong@example.com", displayName: "홍길동" },
    { userId: "t2", email: "kim@example.com", displayName: "김철수" },
  ],
  participants: [
    { id: "p1", fullName: "학생1", note: "알러지" },
    { id: "p2", fullName: "학생2", note: null },
  ],
  snapshots: [
    {
      id: "snap1",
      participantId: "p1",
      fullName: "학생1",
      note: "알러지",
      rosterOrder: 1,
      attendanceStatus: "present" as const,
    },
    {
      id: "snap2",
      participantId: "p2",
      fullName: "학생2",
      note: null,
      rosterOrder: 2,
      attendanceStatus: "absent" as const,
    },
  ],
};

