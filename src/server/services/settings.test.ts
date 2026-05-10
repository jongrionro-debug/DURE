import {
  createClassRecord,
  createParticipantRecord,
  createProgramRecord,
  createVillageRecord,
  deleteParticipantRecord,
  normalizeOptionalForeignKey,
} from "@/server/services/settings";

describe("settings services", () => {
  it("normalizes blank foreign keys to null", () => {
    expect(normalizeOptionalForeignKey("")).toBeNull();
    expect(normalizeOptionalForeignKey(undefined)).toBeNull();
    expect(normalizeOptionalForeignKey("class-1")).toBe("class-1");
  });

  it("creates an organization-scoped village record", async () => {
    const inserted: unknown[] = [];
    await createVillageRecord(
      {
        organizationId: "org-1",
        name: "동네 배움터",
      },
      {
        insertVillage: async (values) => {
          inserted.push(values);
        },
        insertProgram: async () => undefined,
        insertClass: async () => undefined,
        insertParticipant: async () => undefined,
        deleteParticipant: async () => undefined,
      },
    );

    expect(inserted).toEqual([
      {
        organizationId: "org-1",
        name: "동네 배움터",
      },
    ]);
  });

  it("creates class records with nullable program links", async () => {
    const classesInserted: unknown[] = [];

    const repository = {
      insertVillage: async () => undefined,
      insertProgram: async () => undefined,
      insertClass: async (values: unknown) => {
        classesInserted.push(values);
      },
      insertParticipant: async () => undefined,
      deleteParticipant: async () => undefined,
    };

    await createClassRecord(
      {
        organizationId: "org-1",
        name: "기초 문해 수업",
        description: "",
        programId: "",
      },
      repository,
    );

    expect(classesInserted).toEqual([
      {
        organizationId: "org-1",
        name: "기초 문해 수업",
        description: null,
        programId: null,
        villageId: null,
      },
    ]);
  });

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

  it("creates a program record with trimmed description", async () => {
    const inserted: unknown[] = [];

    await createProgramRecord(
      {
        organizationId: "org-1",
        name: "문해 사업",
        description: "  설명  ",
      },
      {
        insertVillage: async () => undefined,
        insertProgram: async (values) => {
          inserted.push(values);
        },
        insertClass: async () => undefined,
        insertParticipant: async () => undefined,
        deleteParticipant: async () => undefined,
      },
    );

    expect(inserted).toEqual([
      {
        organizationId: "org-1",
        name: "문해 사업",
        description: "설명",
      },
    ]);
  });

  it("deletes a participant within the organization scope", async () => {
    const deleted: Array<{ participantId: string; organizationId: string }> = [];

    await deleteParticipantRecord(
      {
        organizationId: "org-1",
        participantId: "7bf616e7-3912-46db-9dd0-bdf1ef00d10d",
      },
      {
        insertVillage: async () => undefined,
        insertProgram: async () => undefined,
        insertClass: async () => undefined,
        insertParticipant: async () => undefined,
        deleteParticipant: async (participantId, organizationId) => {
          deleted.push({ participantId, organizationId });
        },
      },
    );

    expect(deleted).toEqual([
      {
        participantId: "7bf616e7-3912-46db-9dd0-bdf1ef00d10d",
        organizationId: "org-1",
      },
    ]);
  });
});
