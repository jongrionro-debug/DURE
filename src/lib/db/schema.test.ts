import {
  buildOrganizationBootstrapRecords,
  createSlug,
} from "@/lib/db/onboarding-bootstrap";
import {
  attachments,
  attendanceRecords,
  attendanceStatusEnum,
  lessonJournals,
  organizationInvites,
  organizationRoleEnum,
  participants,
  participantsRelations,
  sessionParticipantSnapshots,
  sessions,
  teacherAssignments,
} from "@/lib/db/schema";

describe("db schema helpers", () => {
  it("exposes the expected organization roles", () => {
    expect(organizationRoleEnum.enumValues).toEqual([
      "platform_admin",
      "organization_admin",
      "teacher",
    ]);
    expect(attendanceStatusEnum.enumValues).toEqual([
      "present",
      "absent",
      "late",
      "excused",
    ]);
  });

  it("builds onboarding bootstrap records with a shared organization id", () => {
    const records = buildOrganizationBootstrapRecords({
      userId: "46a87e1a-9918-4ea1-872f-999999999999",
      organizationName: "다도리인 교육 센터",
      firstVillageName: "동네 배움터",
    });

    expect(records.organization.id).toBe(records.firstVillage.organizationId);
    expect(records.organization.id).toBe(records.membership.organizationId);
    expect(records.membership.role).toBe("organization_admin");
    expect(records.firstVillage.isPrimary).toBe(true);
  });

  it("creates a stable slug for organization names", () => {
    expect(createSlug("  Dadoryin Education Hub  ")).toBe(
      "dadoryin-education-hub",
    );
  });

  it("keeps invite, assignment, and session tables organization-scoped", () => {
    expect(teacherAssignments.organizationId.name).toBe("organization_id");
    expect(organizationInvites.organizationId.name).toBe("organization_id");
    expect(sessions.organizationId.name).toBe("organization_id");
    expect(sessionParticipantSnapshots.organizationId.name).toBe(
      "organization_id",
    );
    expect(attendanceRecords.organizationId.name).toBe("organization_id");
    expect(lessonJournals.organizationId.name).toBe("organization_id");
    expect(attachments.organizationId.name).toBe("organization_id");
  });

  it("stores participants by village while keeping class compatibility", () => {
    expect(participants.villageId.name).toBe("village_id");
    expect(participants.classId.name).toBe("class_id");
    expect(participantsRelations).toBeDefined();
  });
});
