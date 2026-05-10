import {
  attachmentMetadataSchema,
  sessionCreateSchema,
  sessionSubmissionSchema,
} from "@/lib/validations/sessions";

describe("session validations", () => {
  it("accepts named class schedule creation inputs", () => {
    const result = sessionCreateSchema.safeParse({
      sessionDate: "2026-05-20",
      villageName: "다도리",
      programName: "문해 사업",
      className: "스마트폰 기초",
      teacherId: "",
      excludedParticipantIds: ["11111111-1111-4111-8111-111111111111"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing schedule names", () => {
    const result = sessionCreateSchema.safeParse({
      sessionDate: "2026-05-20",
      villageName: "",
      programName: "",
      className: "",
      teacherId: "",
      excludedParticipantIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts required attendance rows and lesson journal content", () => {
    expect(
      sessionSubmissionSchema.safeParse({
        lessonJournal: "오늘은 읽기 활동과 짝 토론을 진행했습니다.",
        attendance: [
          {
            sessionParticipantSnapshotId:
              "46a87e1a-9918-4ea1-872f-999999999999",
            status: "present",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("validates attachment metadata limits", () => {
    expect(
      attachmentMetadataSchema.safeParse({
        fileName: "attendance-photo.jpg",
        mimeType: "image/jpeg",
        size: 1024,
      }).success,
    ).toBe(true);
    expect(
      attachmentMetadataSchema.safeParse({
        fileName: "",
        mimeType: "",
        size: 0,
      }).success,
    ).toBe(false);
  });
});
