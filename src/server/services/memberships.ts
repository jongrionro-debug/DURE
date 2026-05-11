import { randomUUID } from "node:crypto";

import { and, asc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  classes,
  organizationInvites,
  organizationMemberships,
  sessions,
  teacherAssignments,
  users,
} from "@/lib/db/schema";

type OrganizationInviteRecord = {
  id: string;
  organizationId: string;
  email: string;
  role: "platform_admin" | "organization_admin" | "teacher";
  expiresAt: Date;
  acceptedAt: Date | null;
};

type MembershipRepository = {
  insertInvite(values: typeof organizationInvites.$inferInsert): Promise<void>;
  ensureUserExists(userId: string): Promise<boolean>;
  findInviteByToken(inviteToken: string): Promise<OrganizationInviteRecord | null>;
  acceptInvite(values: {
    inviteId: string;
    organizationId: string;
    userId: string;
    role: "organization_admin" | "teacher";
    acceptedAt: Date;
  }): Promise<void>;
  approveMembership(membershipId: string, organizationId: string): Promise<void>;
  updateMembershipRole(
    membershipId: string,
    organizationId: string,
    role: "organization_admin" | "teacher",
  ): Promise<void>;
  findOrganizationMembership(
    userId: string,
    organizationId: string,
  ): Promise<{
    role: "platform_admin" | "organization_admin" | "teacher";
    approvedAt: Date | null;
  } | null>;
  insertTeacherAssignment(
    values: typeof teacherAssignments.$inferInsert,
  ): Promise<void>;
  updateUnassignedSessionsTeacher(
    organizationId: string,
    classId: string,
    teacherId: string,
  ): Promise<void>;
};

function createMembershipRepository(): MembershipRepository {
  const db = getDb();

  return {
    async insertInvite(values) {
      await db.insert(organizationInvites).values(values);
    },
    async ensureUserExists(userId) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return Boolean(user);
    },
    async findInviteByToken(inviteToken) {
      const [invite] = await db
        .select({
          id: organizationInvites.id,
          organizationId: organizationInvites.organizationId,
          email: organizationInvites.email,
          role: organizationInvites.role,
          expiresAt: organizationInvites.expiresAt,
          acceptedAt: organizationInvites.acceptedAt,
        })
        .from(organizationInvites)
        .where(eq(organizationInvites.inviteToken, inviteToken))
        .limit(1);

      return invite ?? null;
    },
    async acceptInvite(values) {
      await db.transaction(async (tx) => {
        await tx.insert(organizationMemberships).values({
          organizationId: values.organizationId,
          userId: values.userId,
          role: values.role,
          approvedAt: null,
        });

        await tx
          .update(organizationInvites)
          .set({
            acceptedAt: values.acceptedAt,
          })
          .where(eq(organizationInvites.id, values.inviteId));
      });
    },
    async updateMembershipRole(membershipId, organizationId, role) {
      await db
        .update(organizationMemberships)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(organizationMemberships.id, membershipId),
            eq(organizationMemberships.organizationId, organizationId),
          ),
        );
    },
    async approveMembership(membershipId, organizationId) {
      await db
        .update(organizationMemberships)
        .set({
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(organizationMemberships.id, membershipId),
            eq(organizationMemberships.organizationId, organizationId),
          ),
        );
    },
    async findOrganizationMembership(userId, organizationId) {
      const [membership] = await db
        .select({
          role: organizationMemberships.role,
          approvedAt: organizationMemberships.approvedAt,
        })
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.userId, userId),
            eq(organizationMemberships.organizationId, organizationId),
          ),
        )
        .limit(1);

      return membership ?? null;
    },
    async insertTeacherAssignment(values) {
      await db.insert(teacherAssignments).values(values);
    },
    async updateUnassignedSessionsTeacher(organizationId, classId, teacherId) {
      await db
        .update(sessions)
        .set({
          teacherId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sessions.organizationId, organizationId),
            eq(sessions.classId, classId),
            isNull(sessions.teacherId),
          ),
        );
    },
  };
}

export async function createInviteRecord(
  input: {
    organizationId: string;
    email: string;
    role: "organization_admin" | "teacher";
  },
  repository: MembershipRepository = createMembershipRepository(),
) {
  const inviteToken = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await repository.insertInvite({
    organizationId: input.organizationId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    inviteToken,
    expiresAt,
  });

  return {
    inviteToken,
    expiresAt,
  };
}

export async function acceptOrganizationInvite(
  input: {
    userId: string;
    email: string;
    inviteToken: string;
  },
  repository: MembershipRepository = createMembershipRepository(),
) {
  const userExists = await repository.ensureUserExists(input.userId);

  if (!userExists) {
    throw new Error("회원 정보가 아직 준비되지 않았습니다. 다시 로그인해 주세요.");
  }

  const invite = await repository.findInviteByToken(input.inviteToken.trim());

  if (!invite) {
    throw new Error("유효한 초대 토큰을 찾지 못했습니다.");
  }

  if (invite.acceptedAt) {
    throw new Error("이미 사용된 초대 토큰입니다.");
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error("만료된 초대 토큰입니다.");
  }

  if (invite.email !== input.email.trim().toLowerCase()) {
    throw new Error("초대받은 이메일로 로그인한 뒤 다시 시도해 주세요.");
  }

  if (invite.role === "platform_admin") {
    throw new Error("현재 초대 토큰 역할은 지원되지 않습니다.");
  }

  const acceptedAt = new Date();

  await repository.acceptInvite({
    inviteId: invite.id,
    organizationId: invite.organizationId,
    userId: input.userId,
    role: invite.role,
    acceptedAt,
  });

  return {
    organizationId: invite.organizationId,
    role: invite.role,
    acceptedAt,
  };
}

export async function updateOrganizationMemberRole(
  input: {
    organizationId: string;
    membershipId: string;
    role: "organization_admin" | "teacher";
  },
  repository: MembershipRepository = createMembershipRepository(),
) {
  await repository.updateMembershipRole(
    input.membershipId,
    input.organizationId,
    input.role,
  );
}

export async function approveOrganizationMembership(
  input: {
    organizationId: string;
    membershipId: string;
  },
  repository: MembershipRepository = createMembershipRepository(),
) {
  await repository.approveMembership(input.membershipId, input.organizationId);
}

export async function assignTeacherToClass(
  input: {
    organizationId: string;
    userId: string;
    classId: string;
  },
  repository: MembershipRepository = createMembershipRepository(),
) {
  const membership = await repository.findOrganizationMembership(
    input.userId,
    input.organizationId,
  );

  if (!membership || membership.role !== "teacher") {
    throw new Error("teacher 역할 사용자만 수업에 배정할 수 있습니다.");
  }

  if (!membership.approvedAt) {
    throw new Error("운영자 승인이 끝난 teacher만 수업에 배정할 수 있습니다.");
  }

  await repository.insertTeacherAssignment({
    organizationId: input.organizationId,
    userId: input.userId,
    classId: input.classId,
  });

  await repository.updateUnassignedSessionsTeacher(
    input.organizationId,
    input.classId,
    input.userId,
  );
}

export async function listMembershipOverview(organizationId: string) {
  const db = getDb();

  const [members, invites, assignmentRows, classRows] = await Promise.all([
    db
      .select({
        membershipId: organizationMemberships.id,
        userId: users.id,
        email: users.email,
        displayName: users.displayName,
        role: organizationMemberships.role,
        approvedAt: organizationMemberships.approvedAt,
      })
      .from(organizationMemberships)
      .innerJoin(users, eq(organizationMemberships.userId, users.id))
      .where(eq(organizationMemberships.organizationId, organizationId))
      .orderBy(asc(users.email)),
    db
      .select({
        id: organizationInvites.id,
        email: organizationInvites.email,
        role: organizationInvites.role,
        inviteToken: organizationInvites.inviteToken,
        expiresAt: organizationInvites.expiresAt,
        acceptedAt: organizationInvites.acceptedAt,
      })
      .from(organizationInvites)
      .where(eq(organizationInvites.organizationId, organizationId))
      .orderBy(asc(organizationInvites.email)),
    db
      .select({
        id: teacherAssignments.id,
        className: classes.name,
        userEmail: users.email,
      })
      .from(teacherAssignments)
      .innerJoin(classes, eq(teacherAssignments.classId, classes.id))
      .innerJoin(users, eq(teacherAssignments.userId, users.id))
      .where(eq(teacherAssignments.organizationId, organizationId))
      .orderBy(asc(classes.name)),
    db
      .select({
        id: classes.id,
        name: classes.name,
      })
      .from(classes)
      .where(eq(classes.organizationId, organizationId))
      .orderBy(asc(classes.name)),
  ]);

  return {
    members,
    invites,
    assignments: assignmentRows,
    classes: classRows,
  };
}
