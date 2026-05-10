"use server";

import { revalidatePath } from "next/cache";

import { getServerAuthState } from "@/lib/auth/supabase-server";
import {
  classSchema,
  participantDeleteSchema,
  participantSchema,
  programSchema,
  villageSchema,
} from "@/lib/validations/settings";
import {
  createClassRecord,
  createParticipantRecord,
  createProgramRecord,
  createVillageRecord,
  deleteParticipantRecord,
} from "@/server/services/settings";

type SettingsActionState = {
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
      error: "운영자 승인 이후에만 운영 기본정보를 수정할 수 있습니다.",
    };
  }

  if (authState.role !== "organization_admin") {
    return {
      error: "운영 기본정보는 organization_admin만 수정할 수 있습니다.",
    };
  }

  return {
    organizationId: authState.organizationId,
  };
}

export async function createVillageAction(
  _: SettingsActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = villageSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      message: "마을 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createVillageRecord({
    organizationId: access.organizationId,
    name: parsed.data.name,
  });

  revalidatePath("/settings");
  return { message: "마을을 추가했습니다." };
}

export async function createProgramAction(
  _: SettingsActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = programSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      message: "사업 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createProgramRecord({
    organizationId: access.organizationId,
    name: parsed.data.name,
    description: parsed.data.description,
  });

  revalidatePath("/settings");
  return { message: "사업을 추가했습니다." };
}

export async function createClassAction(
  _: SettingsActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    programId: formData.get("programId"),
  });

  if (!parsed.success) {
    return {
      message: "프로그램 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createClassRecord({
    organizationId: access.organizationId,
    name: parsed.data.name,
    description: parsed.data.description,
    programId: parsed.data.programId,
  });

  revalidatePath("/settings");
  return { message: "프로그램을 추가했습니다." };
}

export async function createParticipantAction(
  _: SettingsActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = participantSchema.safeParse({
    fullName: formData.get("fullName"),
    note: formData.get("note"),
    villageId: formData.get("villageId"),
  });

  if (!parsed.success) {
    return {
      message: "참여자 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createParticipantRecord({
    organizationId: access.organizationId,
    fullName: parsed.data.fullName,
    note: parsed.data.note,
    villageId: parsed.data.villageId,
  });

  revalidatePath("/settings");
  return { message: "참여자를 추가했습니다." };
}

export async function deleteParticipantAction(
  _: SettingsActionState,
  formData: FormData,
) {
  const access = await requireOrganizationAdmin();
  if ("error" in access) {
    return { message: access.error };
  }

  const parsed = participantDeleteSchema.safeParse({
    participantId: formData.get("participantId"),
  });

  if (!parsed.success) {
    return {
      message: "삭제할 참여자 정보를 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await deleteParticipantRecord({
    organizationId: access.organizationId,
    participantId: parsed.data.participantId,
  });

  revalidatePath("/settings");
  return { message: "참여자를 삭제했습니다." };
}
