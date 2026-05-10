import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { SessionManagementScreen } from "@/components/ops/session-management-screen";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/server/actions/session-management", () => ({
  addExistingSessionParticipantAction: vi.fn(),
  assignSessionTeacherAction: vi.fn(),
  createSessionParticipantAction: vi.fn(),
}));

describe("SessionManagementScreen", () => {
  it("uses schedule detail terminology", () => {
    render(
      <SessionManagementScreen
        session={{
          id: "session-1",
          sessionDate: "2026-05-20",
          className: "스마트폰 기초",
          villageName: "다도리",
          programName: "문해 사업",
          teacherId: null,
          teacherName: null,
          teacherEmail: null,
          submittedAt: null,
          updatedAt: new Date("2026-05-20T09:00:00.000Z"),
          teachers: [],
          participants: [],
          snapshots: [],
        }}
      />,
    );

    expect(screen.getByText("수업 일정 관리")).toBeInTheDocument();
    expect(screen.getByText("수업 일정 상태")).toBeInTheDocument();
    expect(screen.getAllByText("기존 출석 대상자 추가").length).toBeGreaterThan(0);
    expect(screen.getAllByText("새 출석 대상자 추가").length).toBeGreaterThan(0);
    expect(screen.queryByText("세션 상태")).not.toBeInTheDocument();
  });
});
