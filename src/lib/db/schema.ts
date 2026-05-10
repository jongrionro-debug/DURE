import { relations } from "drizzle-orm";
import {
  date,
  boolean,
  integer,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const organizationRoleEnum = pgEnum("organization_role", [
  "platform_admin",
  "organization_admin",
  "teacher",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("organizations_slug_unique").on(table.slug),
  }),
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationRoleEnum("role").notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("organization_memberships_organization_idx").on(
      table.organizationId,
    ),
    organizationUserUnique: uniqueIndex(
      "organization_memberships_organization_user_unique",
    ).on(table.organizationId, table.userId),
    userSingleOrganizationUnique: uniqueIndex(
      "organization_memberships_user_single_org_unique",
    ).on(table.userId),
  }),
);

export const villages = pgTable(
  "villages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("villages_organization_idx").on(table.organizationId),
    organizationNameUnique: uniqueIndex("villages_organization_name_unique").on(
      table.organizationId,
      table.name,
    ),
  }),
);

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("programs_organization_idx").on(table.organizationId),
    organizationNameUnique: uniqueIndex("programs_organization_name_unique").on(
      table.organizationId,
      table.name,
    ),
  }),
);

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    programId: uuid("program_id").references(() => programs.id, {
      onDelete: "set null",
    }),
    villageId: uuid("village_id").references(() => villages.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("classes_organization_idx").on(table.organizationId),
    organizationNameUnique: uniqueIndex("classes_organization_name_unique").on(
      table.organizationId,
      table.name,
    ),
    programIdx: index("classes_program_idx").on(table.programId),
    villageIdx: index("classes_village_idx").on(table.villageId),
  }),
);

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

export const teacherAssignments = pgTable(
  "teacher_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("teacher_assignments_organization_idx").on(
      table.organizationId,
    ),
    classIdx: index("teacher_assignments_class_idx").on(table.classId),
    userIdx: index("teacher_assignments_user_idx").on(table.userId),
    classUserUnique: uniqueIndex("teacher_assignments_class_user_unique").on(
      table.classId,
      table.userId,
    ),
  }),
);

export const organizationInvites = pgTable(
  "organization_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: organizationRoleEnum("role").notNull(),
    inviteToken: text("invite_token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("organization_invites_organization_idx").on(
      table.organizationId,
    ),
    tokenUnique: uniqueIndex("organization_invites_token_unique").on(
      table.inviteToken,
    ),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    villageId: uuid("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "restrict" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    teacherId: uuid("teacher_id")
      .references(() => users.id, { onDelete: "restrict" }),
    sessionDate: date("session_date").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("sessions_organization_idx").on(table.organizationId),
    classIdx: index("sessions_class_idx").on(table.classId),
    teacherIdx: index("sessions_teacher_idx").on(table.teacherId),
    sessionDateIdx: index("sessions_session_date_idx").on(table.sessionDate),
  }),
);

export const sessionParticipantSnapshots = pgTable(
  "session_participant_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id").references(() => participants.id, {
      onDelete: "set null",
    }),
    rosterOrder: integer("roster_order").notNull(),
    fullName: text("full_name").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("session_participant_snapshots_organization_idx").on(
      table.organizationId,
    ),
    sessionIdx: index("session_participant_snapshots_session_idx").on(
      table.sessionId,
    ),
    participantIdx: index("session_participant_snapshots_participant_idx").on(
      table.participantId,
    ),
  }),
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    sessionParticipantSnapshotId: uuid("session_participant_snapshot_id")
      .notNull()
      .references(() => sessionParticipantSnapshots.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("attendance_records_organization_idx").on(
      table.organizationId,
    ),
    sessionIdx: index("attendance_records_session_idx").on(table.sessionId),
    snapshotUnique: uniqueIndex("attendance_records_session_snapshot_unique").on(
      table.sessionParticipantSnapshotId,
    ),
  }),
);

export const lessonJournals = pgTable(
  "lesson_journals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("lesson_journals_organization_idx").on(
      table.organizationId,
    ),
    sessionUnique: uniqueIndex("lesson_journals_session_unique").on(
      table.sessionId,
    ),
  }),
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    filePath: text("file_path").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdx: index("attachments_organization_idx").on(
      table.organizationId,
    ),
    sessionIdx: index("attachments_session_idx").on(table.sessionId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMemberships),
  teachingSessions: many(sessions),
  attachments: many(attachments),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(organizationMemberships),
  villages: many(villages),
  programs: many(programs),
  classes: many(classes),
  participants: many(participants),
  teacherAssignments: many(teacherAssignments),
  invites: many(organizationInvites),
  sessions: many(sessions),
  sessionParticipantSnapshots: many(sessionParticipantSnapshots),
  attendanceRecords: many(attendanceRecords),
  lessonJournals: many(lessonJournals),
  attachments: many(attachments),
}));

export const organizationMembershipsRelations = relations(
  organizationMemberships,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMemberships.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMemberships.userId],
      references: [users.id],
    }),
  }),
);

export const villagesRelations = relations(villages, ({ one }) => ({
  organization: one(organizations, {
    fields: [villages.organizationId],
    references: [organizations.id],
  }),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [programs.organizationId],
    references: [organizations.id],
  }),
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [classes.organizationId],
    references: [organizations.id],
  }),
  program: one(programs, {
    fields: [classes.programId],
    references: [programs.id],
  }),
  village: one(villages, {
    fields: [classes.villageId],
    references: [villages.id],
  }),
  participants: many(participants),
  teacherAssignments: many(teacherAssignments),
  sessions: many(sessions),
}));

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

export const teacherAssignmentsRelations = relations(
  teacherAssignments,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [teacherAssignments.organizationId],
      references: [organizations.id],
    }),
    class: one(classes, {
      fields: [teacherAssignments.classId],
      references: [classes.id],
    }),
    user: one(users, {
      fields: [teacherAssignments.userId],
      references: [users.id],
    }),
  }),
);

export const organizationInvitesRelations = relations(
  organizationInvites,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationInvites.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sessions.organizationId],
    references: [organizations.id],
  }),
  village: one(villages, {
    fields: [sessions.villageId],
    references: [villages.id],
  }),
  program: one(programs, {
    fields: [sessions.programId],
    references: [programs.id],
  }),
  class: one(classes, {
    fields: [sessions.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [sessions.teacherId],
    references: [users.id],
  }),
  participantSnapshots: many(sessionParticipantSnapshots),
  attendanceRecords: many(attendanceRecords),
  lessonJournal: many(lessonJournals),
  attachments: many(attachments),
}));

export const sessionParticipantSnapshotsRelations = relations(
  sessionParticipantSnapshots,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [sessionParticipantSnapshots.organizationId],
      references: [organizations.id],
    }),
    session: one(sessions, {
      fields: [sessionParticipantSnapshots.sessionId],
      references: [sessions.id],
    }),
    participant: one(participants, {
      fields: [sessionParticipantSnapshots.participantId],
      references: [participants.id],
    }),
    attendanceRecords: many(attendanceRecords),
  }),
);

export const attendanceRecordsRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [attendanceRecords.organizationId],
      references: [organizations.id],
    }),
    session: one(sessions, {
      fields: [attendanceRecords.sessionId],
      references: [sessions.id],
    }),
    sessionParticipantSnapshot: one(sessionParticipantSnapshots, {
      fields: [attendanceRecords.sessionParticipantSnapshotId],
      references: [sessionParticipantSnapshots.id],
    }),
  }),
);

export const lessonJournalsRelations = relations(lessonJournals, ({ one }) => ({
  organization: one(organizations, {
    fields: [lessonJournals.organizationId],
    references: [organizations.id],
  }),
  session: one(sessions, {
    fields: [lessonJournals.sessionId],
    references: [sessions.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  organization: one(organizations, {
    fields: [attachments.organizationId],
    references: [organizations.id],
  }),
  session: one(sessions, {
    fields: [attachments.sessionId],
    references: [sessions.id],
  }),
  uploadedByUser: one(users, {
    fields: [attachments.uploadedByUserId],
    references: [users.id],
  }),
}));

export type OrganizationRole = (typeof organizationRoleEnum.enumValues)[number];
