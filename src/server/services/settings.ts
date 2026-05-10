import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { classes, participants, programs, villages } from "@/lib/db/schema";

type SettingsRepository = {
  insertVillage(values: typeof villages.$inferInsert): Promise<void>;
  insertProgram(values: typeof programs.$inferInsert): Promise<void>;
  insertClass(values: typeof classes.$inferInsert): Promise<void>;
  insertParticipant(values: typeof participants.$inferInsert): Promise<void>;
  deleteParticipant(participantId: string, organizationId: string): Promise<void>;
};

function createSettingsRepository(): SettingsRepository {
  const db = getDb();

  return {
    async insertVillage(values) {
      await db.insert(villages).values(values);
    },
    async insertProgram(values) {
      await db.insert(programs).values(values);
    },
    async insertClass(values) {
      await db.insert(classes).values(values);
    },
    async insertParticipant(values) {
      await db.insert(participants).values(values);
    },
    async deleteParticipant(participantId, organizationId) {
      await db
        .delete(participants)
        .where(
          and(
            eq(participants.id, participantId),
            eq(participants.organizationId, organizationId),
          ),
        );
    },
  };
}

export function normalizeOptionalForeignKey(value?: string | null) {
  return value ? value : null;
}

export async function createVillageRecord(
  input: { organizationId: string; name: string },
  repository: SettingsRepository = createSettingsRepository(),
) {
  await repository.insertVillage({
    organizationId: input.organizationId,
    name: input.name.trim(),
  });
}

export async function createProgramRecord(
  input: { organizationId: string; name: string; description?: string | null },
  repository: SettingsRepository = createSettingsRepository(),
) {
  await repository.insertProgram({
    organizationId: input.organizationId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
  });
}

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

export async function deleteParticipantRecord(
  input: {
    organizationId: string;
    participantId: string;
  },
  repository: SettingsRepository = createSettingsRepository(),
) {
  await repository.deleteParticipant(input.participantId, input.organizationId);
}

export async function listSettingsOverview(organizationId: string) {
  const db = getDb();

  const [villageRows, programRows, classRows, participantRows] = await Promise.all(
    [
      db
        .select()
        .from(villages)
        .where(eq(villages.organizationId, organizationId))
        .orderBy(asc(villages.name)),
      db
        .select()
        .from(programs)
        .where(eq(programs.organizationId, organizationId))
        .orderBy(asc(programs.name)),
      db
        .select({
          id: classes.id,
          name: classes.name,
          description: classes.description,
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
          id: participants.id,
          fullName: participants.fullName,
          note: participants.note,
          villageName: villages.name,
        })
        .from(participants)
        .leftJoin(villages, eq(participants.villageId, villages.id))
        .where(eq(participants.organizationId, organizationId))
        .orderBy(asc(participants.fullName)),
    ],
  );

  return {
    villages: villageRows,
    programs: programRows,
    classes: classRows,
    participants: participantRows,
  };
}
