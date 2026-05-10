import {
  buildSessionParticipantSnapshots,
  createClassScheduleRecord,
  createSessionRecord,
  filterTeacherAssignedSessions,
  getTeacherSessionWorkspace,
} from "@/server/services/sessions";

describe("session services", () => {
  it("builds frozen-in-time participant snapshots from the current roster", () => {
    const roster = [
      {
        id: "participant-1",
        organizationId: "org-1",
        fullName: "김선생",
        note: "첫 줄",
      },
      {
        id: "participant-2",
        organizationId: "org-1",
        fullName: "박학생",
        note: null,
      },
    ];

    const snapshots = buildSessionParticipantSnapshots(
      "session-1",
      "org-1",
      roster,
    );

    roster[0].fullName = "바뀐 이름";
    roster[0].note = "바뀐 메모";

    expect(snapshots).toEqual([
      {
        sessionId: "session-1",
        organizationId: "org-1",
        participantId: "participant-1",
        rosterOrder: 0,
        fullName: "김선생",
        note: "첫 줄",
      },
      {
        sessionId: "session-1",
        organizationId: "org-1",
        participantId: "participant-2",
        rosterOrder: 1,
        fullName: "박학생",
        note: null,
      },
    ]);
  });

  it("creates a scoped session with no participant snapshots by default", async () => {
    const insertedSessions: unknown[] = [];
    const insertedSnapshots: unknown[] = [];

    const result = await createSessionRecord(
      {
        organizationId: "org-1",
        villageId: "village-1",
        programId: "program-1",
        classId: "class-1",
        teacherId: "teacher-1",
        sessionDate: "2026-04-15",
      },
      {
        findClassRecord: async () => ({
          id: "class-1",
          organizationId: "org-1",
          name: "기초 문해 수업",
          programId: "program-1",
          villageId: "village-1",
        }),
        hasVillageRecord: async () => true,
        hasProgramRecord: async () => true,
        findTeacherAssignment: async () => ({
          classId: "class-1",
          userId: "teacher-1",
        }),
        insertSession: async (values) => {
          insertedSessions.push(values);
          return {
            id: "session-1",
            organizationId: "org-1",
          };
        },
        insertSessionParticipantSnapshots: async (values) => {
          insertedSnapshots.push(values);
        },
      },
    );

    expect(result).toEqual({
      sessionId: "session-1",
      snapshotCount: 0,
    });
    expect(insertedSessions).toEqual([
      {
        organizationId: "org-1",
        villageId: "village-1",
        programId: "program-1",
        classId: "class-1",
        teacherId: "teacher-1",
        sessionDate: "2026-04-15",
      },
    ]);
    expect(insertedSnapshots).toEqual([]);
  });

  it("creates a session without a teacher and without roster snapshots", async () => {
    const insertedSessions: unknown[] = [];
    const insertedSnapshots: unknown[] = [];

    const result = await createSessionRecord(
      {
        organizationId: "org-1",
        villageId: "village-1",
        programId: "program-1",
        classId: "class-1",
        teacherId: null,
        sessionDate: "2026-04-15",
      },
      {
        findClassRecord: async () => ({
          id: "class-1",
          organizationId: "org-1",
          name: "기초 문해 수업",
          programId: "program-1",
          villageId: "village-1",
        }),
        hasVillageRecord: async () => true,
        hasProgramRecord: async () => true,
        findTeacherAssignment: async () => {
          throw new Error("teacher assignment should not be checked");
        },
        insertSession: async (values) => {
          insertedSessions.push(values);
          return {
            id: "session-1",
            organizationId: "org-1",
          };
        },
        insertSessionParticipantSnapshots: async (values) => {
          insertedSnapshots.push(values);
        },
      },
    );

    expect(result).toEqual({
      sessionId: "session-1",
      snapshotCount: 0,
    });
    expect(insertedSessions).toEqual([
      {
        organizationId: "org-1",
        villageId: "village-1",
        programId: "program-1",
        classId: "class-1",
        teacherId: null,
        sessionDate: "2026-04-15",
      },
    ]);
    expect(insertedSnapshots).toEqual([]);
  });

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

  it("rejects session creation when the teacher assignment is outside scope", async () => {
    await expect(
      createSessionRecord(
        {
          organizationId: "org-1",
          villageId: "village-1",
          programId: "program-1",
          classId: "class-1",
          teacherId: "teacher-2",
          sessionDate: "2026-04-15",
        },
        {
          findClassRecord: async () => ({
            id: "class-1",
            organizationId: "org-1",
            name: "기초 문해 수업",
            programId: "program-1",
            villageId: "village-1",
          }),
          hasVillageRecord: async () => true,
          hasProgramRecord: async () => true,
          findTeacherAssignment: async () => null,
          insertSession: async () => ({
            id: "session-1",
            organizationId: "org-1",
          }),
          insertSessionParticipantSnapshots: async () => undefined,
        },
      ),
    ).rejects.toThrow("선택한 강사가 이 수업에 배정되어 있지 않습니다.");
  });

  it("fails clearly when required master data is missing", async () => {
    await expect(
      createSessionRecord(
        {
          organizationId: "org-1",
          villageId: "village-1",
          programId: "program-1",
          classId: "class-1",
          teacherId: "teacher-1",
          sessionDate: "2026-04-15",
        },
        {
          findClassRecord: async () => ({
            id: "class-1",
            organizationId: "org-1",
            name: "기초 문해 수업",
            programId: "program-1",
            villageId: null,
          }),
          hasVillageRecord: async () => true,
          hasProgramRecord: async () => true,
          findTeacherAssignment: async () => ({
            classId: "class-1",
            userId: "teacher-1",
          }),
          insertSession: async () => ({
            id: "session-1",
            organizationId: "org-1",
          }),
          insertSessionParticipantSnapshots: async () => undefined,
        },
      ),
    ).rejects.toThrow("선택한 수업에 마을 연결이 없어 세션을 만들 수 없습니다.");
  });

  it("filters teacher session cards down to assigned sessions only", () => {
    expect(
      filterTeacherAssignedSessions("teacher-1", [
        {
          id: "session-1",
          teacherId: "teacher-1",
          sessionDate: "2026-04-15",
          className: "A반",
          villageName: "동네 배움터",
          programName: "문해",
          submittedAt: null,
        },
        {
          id: "session-2",
          teacherId: "teacher-2",
          sessionDate: "2026-04-16",
          className: "B반",
          villageName: "바다 마을",
          programName: "생활",
          submittedAt: null,
        },
        {
          id: "session-3",
          teacherId: null,
          sessionDate: "2026-04-17",
          className: "C반",
          villageName: "숲 마을",
          programName: "기초",
          submittedAt: null,
        },
      ]),
    ).toEqual([
      {
        id: "session-1",
        teacherId: "teacher-1",
        sessionDate: "2026-04-15",
        className: "A반",
        villageName: "동네 배움터",
        programName: "문해",
        submittedAt: null,
      },
    ]);
  });

  it("blocks teacher workspace access by direct url when assignment does not match", async () => {
    const workspace = await getTeacherSessionWorkspace(
      "org-1",
      "teacher-1",
      "session-2",
      {
        listOrganizationSessions: async () => [],
        findOrganizationSessionById: async () => ({
          id: "session-2",
          teacherId: "teacher-2",
          sessionDate: "2026-04-16",
          className: "B반",
          villageName: "바다 마을",
          programName: "생활",
          submittedAt: null,
        }),
        listSessionSnapshots: async () => [
          {
            id: "snapshot-1",
            fullName: "홍길동",
            note: null,
            rosterOrder: 0,
          },
        ],
      },
    );

    expect(workspace).toBeNull();
  });
});
