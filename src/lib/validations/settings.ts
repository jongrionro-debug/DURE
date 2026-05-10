import { z } from "zod";

export const villageSchema = z.object({
  name: z.string().trim().min(2, "마을 이름을 2자 이상 입력해 주세요."),
});

export const programSchema = z.object({
  name: z.string().trim().min(2, "사업 이름을 2자 이상 입력해 주세요."),
  description: z
    .string()
    .trim()
    .max(300, "설명은 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
});

export const classSchema = z.object({
  name: z.string().trim().min(2, "프로그램 이름을 2자 이상 입력해 주세요."),
  description: z
    .string()
    .trim()
    .max(300, "설명은 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
  programId: z.string().uuid().optional().or(z.literal("")),
});

export const participantSchema = z.object({
  fullName: z.string().trim().min(2, "참여자 이름을 2자 이상 입력해 주세요."),
  note: z
    .string()
    .trim()
    .max(300, "메모는 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
  villageId: z.string().uuid("참여자가 속한 마을을 선택해 주세요."),
});

export const participantDeleteSchema = z.object({
  participantId: z.string().uuid("유효한 참여자 id가 필요합니다."),
});

export const organizationInviteSchema = z.object({
  email: z.string().trim().email("올바른 이메일 주소를 입력해 주세요."),
  role: z.enum(["organization_admin", "teacher"]),
});

export const memberRoleUpdateSchema = z.object({
  membershipId: z.string().uuid("유효한 membership id가 필요합니다."),
  role: z.enum(["organization_admin", "teacher"]),
});

export const membershipApprovalSchema = z.object({
  membershipId: z.string().uuid("유효한 membership id가 필요합니다."),
});

export const teacherAssignmentSchema = z.object({
  userId: z.string().uuid("유효한 사용자 id가 필요합니다."),
  classId: z.string().uuid("유효한 수업 id가 필요합니다."),
});
