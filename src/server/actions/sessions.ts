"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerAuthState } from "@/lib/auth/supabase-server";
import { sessionCreateSchema } from "@/lib/validations/sessions";
import { createClassScheduleRecord } from "@/server/services/sessions";

type SessionActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
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
      error: "운영자 승인 이후에만 수업 일정을 만들 수 있습니다.",
    };
  }

  if (authState.role !== "organization_admin") {
    return {
      error: "수업 일정 만들기는 organization_admin만 수행할 수 있습니다.",
    };
  }

  return {
    organizationId: authState.organizationId,
  };
}

export async function createSessionAction(
  _: SessionActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = sessionCreateSchema.safeParse({
    sessionDate: formData.get("sessionDate"),
    villageName: formData.get("villageName"),
    programName: formData.get("programName"),
    className: formData.get("className"),
    teacherId: formData.get("teacherId"),
    excludedParticipantIds: formData.getAll("excludedParticipantIds"),
  });

  if (!parsed.success) {
    return {
      message: "수업 일정 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let schedule: { sessionId: string };

  try {
    schedule = await createClassScheduleRecord({
      organizationId: access.organizationId,
      sessionDate: parsed.data.sessionDate,
      villageName: parsed.data.villageName,
      programName: parsed.data.programName,
      className: parsed.data.className,
      teacherId: parsed.data.teacherId || null,
      excludedParticipantIds: parsed.data.excludedParticipantIds,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "수업 일정 생성 중 오류가 발생했습니다.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath(`/dashboard/sessions/${schedule.sessionId}`);
  redirect(`/dashboard/sessions/${schedule.sessionId}`);
}
