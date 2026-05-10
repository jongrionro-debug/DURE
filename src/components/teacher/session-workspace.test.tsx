import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { TeacherSessionWorkspaceScreen } from "@/components/teacher/session-workspace";

vi.mock("@/server/actions/attachments", () => ({
  uploadTeacherAttachmentAction: vi.fn(),
}));

vi.mock("@/server/actions/submissions", () => ({
  submitTeacherSessionAction: vi.fn(),
}));

describe("TeacherSessionWorkspaceScreen", () => {
  it("shows schedule workspace copy and final submit action", () => {
    render(
      <TeacherSessionWorkspaceScreen
        session={{
          id: "session-1",
          sessionDate: "2026-05-20",
          className: "스마트폰 기초",
          villageName: "다도리",
          programName: "문해 사업",
          submittedAt: null,
          lessonJournal: "",
          attachments: [],
          snapshots: [
            {
              id: "snapshot-1",
              fullName: "김영희",
              note: null,
              rosterOrder: 0,
              attendanceStatus: "present",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("수업 일정 기록")).toBeInTheDocument();
    expect(screen.getByText("출석 대상 1명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "최종 제출" })).toBeInTheDocument();
  });
});
