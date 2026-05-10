import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { TeacherSessionsScreen } from "@/components/teacher/sessions-screen";

vi.mock("@/server/actions/attachments", () => ({
  uploadTeacherAttachmentAction: vi.fn(),
}));

vi.mock("@/server/actions/submissions", () => ({
  submitTeacherSessionAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("TeacherSessionsScreen", () => {
  it("shows the empty schedule state", () => {
    render(<TeacherSessionsScreen sessions={[]} selectedSession={null} />);

    expect(screen.getByText("내 수업 일정")).toBeInTheDocument();
    expect(
      screen.getByText("아직 배정된 수업 일정이 없습니다."),
    ).toBeInTheDocument();
  });

  it("shows schedule tabs, cards, and the record action", () => {
    render(
      <TeacherSessionsScreen
        sessions={[
          {
            id: "session-1",
            sessionDate: "2026-05-20",
            className: "스마트폰 기초",
            villageName: "다도리",
            programName: "문해 사업",
            submittedAt: null,
          },
        ]}
        selectedSession={{
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

    expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이번주" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지난 회차" })).toBeInTheDocument();
    expect(screen.getByText("출석 대상 1명")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "기록하기" })[0]).toHaveAttribute(
      "href",
      "/sessions/session-1",
    );
  });
});
