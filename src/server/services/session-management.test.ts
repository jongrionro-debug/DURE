import {
  addExistingParticipantToSession,
  assignTeacherToSession,
  createAndAddParticipantToSession,
  removeParticipantFromSession,
} from "@/server/services/session-management";

describe("session management services", () => {
  it("clears a session teacher assignment when the operator saves an empty teacher", async () => {
    const updates: unknown[] = [];

    await assignTeacherToSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        teacherId: null,
      },
      {
        findApprovedTeacher: async () => {
          throw new Error("approved teacher lookup should not run");
        },
        updateSessionTeacher: async (values) => {
          updates.push(values);
        },
        findSession: async () => ({
          id: "session-1",
          organizationId: "org-1",
          classId: "class-1",
          villageId: "village-1",
          submittedAt: null,
        }),
        listSessionSnapshots: async () => [],
        listApprovedTeachers: async () => [],
        listAvailableParticipants: async () => [],
        insertParticipant: async () => {
          throw new Error("not used");
        },
        findParticipant: async () => null,
        insertSessionSnapshot: async () => undefined,
        touchSession: async () => undefined,
      },
    );

    expect(updates).toEqual([
      {
        organizationId: "org-1",
        sessionId: "session-1",
        teacherId: null,
      },
    ]);
  });

  it("assigns only approved organization teachers to a session", async () => {
    const updates: unknown[] = [];

    await assignTeacherToSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        teacherId: "teacher-1",
      },
      {
        findApprovedTeacher: async () => ({
          userId: "teacher-1",
          email: "teacher@example.com",
          displayName: "김선생",
        }),
        updateSessionTeacher: async (values) => {
          updates.push(values);
        },
        findSession: async () => ({
          id: "session-1",
          organizationId: "org-1",
          classId: "class-1",
          villageId: "village-1",
          submittedAt: null,
        }),
        listSessionSnapshots: async () => [],
        listApprovedTeachers: async () => [],
        listAvailableParticipants: async () => [],
        insertParticipant: async () => {
          throw new Error("not used");
        },
        findParticipant: async () => null,
        insertSessionSnapshot: async () => undefined,
        touchSession: async () => undefined,
      },
    );

    expect(updates).toEqual([
      {
        organizationId: "org-1",
        sessionId: "session-1",
        teacherId: "teacher-1",
      },
    ]);
  });

  it("rejects session teacher assignment outside approved teacher scope", async () => {
    await expect(
      assignTeacherToSession(
        {
          organizationId: "org-1",
          sessionId: "session-1",
          teacherId: "teacher-2",
        },
        {
          findApprovedTeacher: async () => null,
          updateSessionTeacher: async () => undefined,
          findSession: async () => ({
            id: "session-1",
            organizationId: "org-1",
            classId: "class-1",
            villageId: "village-1",
            submittedAt: null,
          }),
          listSessionSnapshots: async () => [],
          listApprovedTeachers: async () => [],
          listAvailableParticipants: async () => [],
          insertParticipant: async () => {
            throw new Error("not used");
          },
          findParticipant: async () => null,
          insertSessionSnapshot: async () => undefined,
          touchSession: async () => undefined,
        },
      ),
    ).rejects.toThrow("승인된 강사만 세션에 배정할 수 있습니다.");
  });

  it("adds an existing participant to a session snapshot once", async () => {
    const snapshots: unknown[] = [];

    const result = await addExistingParticipantToSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        participantId: "participant-2",
      },
      {
        findSession: async () => ({
          id: "session-1",
          organizationId: "org-1",
          classId: "class-1",
          villageId: "village-1",
          submittedAt: new Date("2026-04-10T09:00:00.000Z"),
        }),
        findParticipant: async () => ({
          id: "participant-2",
          organizationId: "org-1",
          villageId: "village-1",
          fullName: "박학생",
          note: "늦게 합류",
        }),
        listSessionSnapshots: async () => [
          {
            id: "snapshot-1",
            participantId: "participant-1",
            fullName: "홍길동",
            note: null,
            rosterOrder: 0,
            attendanceStatus: "present",
          },
        ],
        insertSessionSnapshot: async (values) => {
          snapshots.push(values);
        },
        touchSession: async () => undefined,
        findApprovedTeacher: async () => null,
        updateSessionTeacher: async () => undefined,
        listApprovedTeachers: async () => [],
        listAvailableParticipants: async () => [],
        insertParticipant: async () => {
          throw new Error("not used");
        },
      },
    );

    expect(result).toEqual({ added: true });
    expect(snapshots).toEqual([
      {
        organizationId: "org-1",
        sessionId: "session-1",
        participantId: "participant-2",
        fullName: "박학생",
        note: "늦게 합류",
        rosterOrder: 1,
      },
    ]);
  });

  it("does not duplicate an existing session participant snapshot", async () => {
    const result = await addExistingParticipantToSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        participantId: "participant-1",
      },
      {
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
          villageId: "village-1",
          fullName: "홍길동",
          note: null,
        }),
        listSessionSnapshots: async () => [
          {
            id: "snapshot-1",
            participantId: "participant-1",
            fullName: "홍길동",
            note: null,
            rosterOrder: 0,
            attendanceStatus: null,
          },
        ],
        insertSessionSnapshot: async () => {
          throw new Error("should not insert a duplicate snapshot");
        },
        touchSession: async () => undefined,
        findApprovedTeacher: async () => null,
        updateSessionTeacher: async () => undefined,
        listApprovedTeachers: async () => [],
        listAvailableParticipants: async () => [],
        insertParticipant: async () => {
          throw new Error("not used");
        },
      },
    );

    expect(result).toEqual({ added: false });
  });

  it("creates a participant in the full roster before adding it to the session", async () => {
    const insertedParticipants: unknown[] = [];
    const insertedSnapshots: unknown[] = [];

    const result = await createAndAddParticipantToSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        fullName: "새학생",
        note: "현장 추가",
      },
      {
        findSession: async () => ({
          id: "session-1",
          organizationId: "org-1",
          classId: "class-1",
          villageId: "village-1",
          submittedAt: null,
        }),
        insertParticipant: async (values) => {
          insertedParticipants.push(values);
          return {
            id: "participant-new",
            organizationId: "org-1",
            villageId: "village-1",
            fullName: "새학생",
            note: "현장 추가",
          };
        },
        listSessionSnapshots: async () => [],
        insertSessionSnapshot: async (values) => {
          insertedSnapshots.push(values);
        },
        touchSession: async () => undefined,
        findApprovedTeacher: async () => null,
        updateSessionTeacher: async () => undefined,
        listApprovedTeachers: async () => [],
        listAvailableParticipants: async () => [],
        findParticipant: async () => null,
      },
    );

    expect(result).toEqual({ participantId: "participant-new" });
    expect(insertedParticipants).toEqual([
      {
        organizationId: "org-1",
        villageId: "village-1",
        classId: null,
        fullName: "새학생",
        note: "현장 추가",
      },
    ]);
    expect(insertedSnapshots).toEqual([
      {
        organizationId: "org-1",
        sessionId: "session-1",
        participantId: "participant-new",
        fullName: "새학생",
        note: "현장 추가",
        rosterOrder: 0,
      },
    ]);
  });

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
      insertParticipant: async (values: {
        organizationId: string;
        villageId: string | null;
        classId: string | null;
        fullName: string;
        note: string | null;
      }) => {
        insertedParticipants.push(values);
        return {
          id: "participant-1",
          organizationId: "org-1",
          villageId: values.villageId,
          fullName: values.fullName,
          note: values.note,
        };
      },
      insertSessionSnapshot: async () => undefined,
      touchSession: async () => undefined,
      findApprovedTeacher: async () => null,
      updateSessionTeacher: async () => undefined,
      listApprovedTeachers: async () => [],
      listAvailableParticipants: async () => [],
      findParticipant: async () => null,
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
    ).rejects.toThrow(
      "선택한 참여자는 이 수업 일정의 마을에 속해 있지 않습니다.",
    );
  });

  it("removes a participant snapshot from a session and touches the session", async () => {
    const deleted: unknown[] = [];
    const touched: unknown[] = [];

    await removeParticipantFromSession(
      {
        organizationId: "org-1",
        sessionId: "session-1",
        snapshotId: "snapshot-1",
      },
      {
        findSession: async () => ({
          id: "session-1",
          organizationId: "org-1",
          classId: "class-1",
          villageId: "village-1",
          submittedAt: null,
        }),
        deleteSessionSnapshot: async (values) => {
          deleted.push(values);
        },
        touchSession: async (organizationId, sessionId) => {
          touched.push({ organizationId, sessionId });
        },
        findApprovedTeacher: async () => null,
        updateSessionTeacher: async () => undefined,
        listApprovedTeachers: async () => [],
        listAvailableParticipants: async () => [],
        findParticipant: async () => null,
        insertParticipant: async () => {
          throw new Error("not used");
        },
        listSessionSnapshots: async () => [],
        insertSessionSnapshot: async () => undefined,
      },
    );

    expect(deleted).toEqual([
      {
        organizationId: "org-1",
        sessionId: "session-1",
        snapshotId: "snapshot-1",
      },
    ]);
    expect(touched).toEqual([
      { organizationId: "org-1", sessionId: "session-1" },
    ]);
  });
});
