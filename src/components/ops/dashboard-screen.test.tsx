import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DashboardScreen } from "@/components/ops/dashboard-screen";

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

vi.mock("@/server/actions/sessions", () => ({
  createSessionAction: vi.fn(),
}));

const baseData = {
  villages: [{ id: "village-1", name: "성내마을" }],
  programs: [{ id: "program-1", name: "문해 사업" }],
  classes: [
    {
      id: "class-1",
      name: "스마트폰 기초",
      programId: "program-1",
      villageId: "village-1",
      programName: "문해 사업",
      villageName: "성내마을",
    },
  ],
  teacherAssignments: [
    {
      classId: "class-1",
      className: "스마트폰 기초",
      teacherId: "teacher-1",
      teacherName: "김강사",
      teacherEmail: "teacher@example.com",
    },
  ],
  recentSessions: [
    {
      id: "session-1",
      sessionDate: "2026-05-01",
      className: "스마트폰 기초",
      villageName: "성내마을",
      programName: "문해 사업",
      teacherName: "김강사",
      teacherEmail: "teacher@example.com",
      snapshotCount: 1,
      submittedAt: null,
    },
  ],
  participants: [
    {
      id: "participant-1",
      fullName: "김영희",
      note: "오전반",
      villageId: "village-1",
    },
  ],
};

const baseDashboard = {
  setupGaps: [],
  recentSubmissions: [],
  recentUpdates: [],
  submissionOverview: {
    totalSessions: 3,
    submittedSessions: 2,
    pendingSessions: 1,
    completionRate: 67,
    attendanceCount: 18,
    journalCount: 2,
    attachmentCount: 1,
  },
  pendingSessions: [],
};

describe("DashboardScreen", () => {
  it("renders the schedule-first operations console", () => {
    render(<DashboardScreen data={baseData} dashboard={baseDashboard} />);

    expect(
      screen.getByRole("heading", { name: "안녕하세요, 운영자님" }),
    ).toBeInTheDocument();
    expect(screen.getByText("진행 중 사업")).toBeInTheDocument();
    expect(screen.getByText("이번 달 일정")).toBeInTheDocument();
    expect(screen.getByText("미제출 일지")).toBeInTheDocument();
    expect(screen.getByText("누적 참여자")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /스마트폰 기초/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link", { name: "수업 일정 관리" })).toHaveAttribute(
      "href",
      "/dashboard/sessions/session-1",
    );
  });

  it("opens schedule creation with named inputs and village participant exclusions", () => {
    render(<DashboardScreen data={baseData} dashboard={baseDashboard} />);

    expect(
      screen.getByRole("button", { name: "수업 일정 만들기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "수업 일정 만들기" }));

    expect(
      screen.getByText("현재 마을 참여자 명단을 출석 대상으로 고정합니다."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("진행일")).toBeInTheDocument();
    expect(screen.getByLabelText("사업")).toBeInTheDocument();
    expect(screen.getByLabelText("마을")).toBeInTheDocument();
    expect(screen.getByLabelText("프로그램")).toBeInTheDocument();
    expect(screen.getByLabelText("담당 강사")).toBeInTheDocument();
    expect(
      screen.getByText("마을을 선택하면 출석 대상 후보가 표시됩니다."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("마을"), {
      target: { value: "성내마을" },
    });

    expect(screen.getByLabelText(/김영희/)).toHaveAttribute(
      "name",
      "excludedParticipantIds",
    );
  });
});
