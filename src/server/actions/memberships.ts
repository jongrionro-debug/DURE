"use server";

import { revalidatePath } from "next/cache";

import { getServerAuthState } from "@/lib/auth/supabase-server";
import {
  memberRoleUpdateSchema,
  membershipApprovalSchema,
  organizationInviteSchema,
  teacherAssignmentSchema,
} from "@/lib/validations/settings";
import {
  approveOrganizationMembership,
  assignTeacherToClass,
  createInviteRecord,
  updateOrganizationMemberRole,
} from "@/server/services/memberships";

type MembershipActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  token?: string;
};

async function requireOrganizationAdmin() {
  const authState = await getServerAuthState();

  if (!authState.isAuthenticated || !authState.organizationId) {
    return {
      error: "기관 운영 영역에 접근하려면 로그인과 기관 소속이 필요합니다.",
    };
  }

  if (!authState.membershipApproved) {
    return {
      error: "운영자 승인 이후에만 사용자 관리와 초대를 진행할 수 있습니다.",
    };
  }

  if (authState.role !== "organization_admin") {
    return {
      error: "사용자 관리와 초대는 organization_admin만 수행할 수 있습니다.",
    };
  }

  return {
    organizationId: authState.organizationId,
  };
}

export async function createInviteAction(
  _: MembershipActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = organizationInviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      message: "초대 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const invite = await createInviteRecord({
    organizationId: access.organizationId,
    email: parsed.data.email,
    role: parsed.data.role,
  });

  revalidatePath("/users");
  return {
    message: "초대 토큰이 발급되었습니다.",
    token: invite.inviteToken,
  };
}

export async function updateMemberRoleAction(
  _: MembershipActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = memberRoleUpdateSchema.safeParse({
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      message: "역할 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await updateOrganizationMemberRole({
    organizationId: access.organizationId,
    membershipId: parsed.data.membershipId,
    role: parsed.data.role,
  });

  revalidatePath("/users");
  return { message: "역할을 변경했습니다." };
}

export async function approveMemberAction(
  _: MembershipActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = membershipApprovalSchema.safeParse({
    membershipId: formData.get("membershipId"),
  });

  if (!parsed.success) {
    return {
      message: "승인할 멤버 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await approveOrganizationMembership({
    organizationId: access.organizationId,
    membershipId: parsed.data.membershipId,
  });

  revalidatePath("/users");
  revalidatePath("/approval-pending");
  revalidatePath("/dashboard");
  revalidatePath("/sessions");

  return { message: "멤버 접근을 승인했습니다." };
}

export async function assignTeacherAction(
  _: MembershipActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = teacherAssignmentSchema.safeParse({
    userId: formData.get("userId"),
    classId: formData.get("classId"),
  });

  if (!parsed.success) {
    return {
      message: "배정 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await assignTeacherToClass({
      organizationId: access.organizationId,
      userId: parsed.data.userId,
      classId: parsed.data.classId,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "강사 배정 중 오류가 발생했습니다.",
    };
  }

  revalidatePath("/users");
  revalidatePath("/dashboard");
  revalidatePath("/records");
  return { message: "강사를 수업에 배정했습니다." };
}
