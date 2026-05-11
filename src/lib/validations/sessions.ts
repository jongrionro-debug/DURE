import { z } from "zod";

export const sessionCreateSchema = z.object({
  sessionDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "진행일을 선택해 주세요."),
  villageName: z.string().trim().min(2, "마을 이름을 2자 이상 입력해 주세요."),
  programName: z.string().trim().min(2, "사업 이름을 2자 이상 입력해 주세요."),
  className: z.string().trim().min(2, "프로그램 이름을 2자 이상 입력해 주세요."),
  teacherId: z
    .string()
    .uuid("유효한 강사 id가 필요합니다.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  excludedParticipantIds: z
    .array(z.string().uuid("유효한 참여자 id가 필요합니다."))
    .default([]),
});

export const sessionTeacherAssignmentSchema = z.object({
  sessionId: z.string().uuid("유효한 세션 id가 필요합니다."),
  teacherId: z
    .string()
    .uuid("유효한 강사 id가 필요합니다.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export const existingSessionParticipantSchema = z.object({
  sessionId: z.string().uuid("유효한 세션 id가 필요합니다."),
  participantId: z.string().uuid("유효한 참여자 id가 필요합니다."),
});

export const newSessionParticipantSchema = z.object({
  sessionId: z.string().uuid("유효한 세션 id가 필요합니다."),
  fullName: z.string().trim().min(2, "참여자 이름을 2자 이상 입력해 주세요."),
  note: z
    .string()
    .trim()
    .max(300, "메모는 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
});

export const removeSessionParticipantSchema = z.object({
  sessionId: z.string().uuid("유효한 세션 id가 필요합니다."),
  snapshotId: z.string().uuid("유효한 세션 참여자 id가 필요합니다."),
});

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "excused",
]);

export const sessionSubmissionSchema = z.object({
  lessonJournal: z
    .string()
    .trim()
    .min(10, "교육일지는 10자 이상 입력해 주세요."),
  attendance: z
    .array(
      z.object({
        sessionParticipantSnapshotId: z.string().uuid(
          "유효한 출석 대상 id가 필요합니다.",
        ),
        status: attendanceStatusSchema,
      }),
    )
    .min(1, "최소 한 명 이상의 출석 정보가 필요합니다."),
});

export const attachmentMetadataSchema = z.object({
  fileName: z.string().trim().min(1, "파일 이름이 필요합니다."),
  mimeType: z.string().trim().min(1, "파일 타입 정보가 필요합니다."),
  size: z
    .number()
    .int()
    .positive("파일 크기 정보가 필요합니다.")
    .max(10 * 1024 * 1024, "첨부 파일은 10MB 이하로 제한합니다."),
});
