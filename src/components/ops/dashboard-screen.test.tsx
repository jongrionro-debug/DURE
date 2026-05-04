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

vi.mock("@/server/actions/session-management", () => ({
  addExistingSessionParticipantAction: vi.fn(),
  assignSessionTeacherAction: vi.fn(),
  createSessionParticipantAction: vi.fn(),
  removeSessionParticipantAction: vi.fn(),
}));

const baseData = {
  villages: [{ id: "village-1", name: "성내마을" }],
  programs: [{ id: "program-1", name: "문해 사업" }],
  classes: [
    {
      id: "class-1",
      name: "기초 문해 수업",
      programId: "program-1",
      villageId: "village-1",
      programName: "문해 사업",
      villageName: "성내마을",
    },
  ],
  teacherAssignments: [
    {
      classId: "class-1",
      className: "기초 문해 수업",
      teacherId: "teacher-1",
      teacherName: "김강사",
      teacherEmail: "teacher@example.com",
    },
  ],
  recentSessions: [
    {
      id: "session-1",
      sessionDate: "2026-05-01",
      className: "예시 수업",
      villageName: "예시 마을",
      programName: "예시 사업",
      teacherName: "예시선생",
      teacherEmail: "teacher@example.com",
      snapshotCount: 1,
      submittedAt: null,
    },
    {
      id: "session-2",
      sessionDate: "2026-05-02",
      className: "두번째 수업",
      villageName: "성내마을",
      programName: "문해 사업",
      teacherName: null,
      teacherEmail: null,
      snapshotCount: 0,
      submittedAt: new Date("2026-05-02T01:21:00.000Z"),
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

const sessionManagementRecords = [
  {
    id: "session-1",
    sessionDate: "2026-05-01",
    classId: "class-1",
    className: "예시 수업",
    villageName: "예시 마을",
    programName: "예시 사업",
    teacherId: "teacher-1",
    teacherName: "예시선생",
    teacherEmail: "teacher@example.com",
    submittedAt: null,
    updatedAt: new Date("2026-05-02T01:21:00.000Z"),
    teachers: [
      {
        userId: "teacher-1",
        email: "teacher@example.com",
        displayName: "예시선생",
      },
    ],
    participants: [
      {
        id: "participant-7",
        fullName: "추가대상",
        note: "대기",
      },
    ],
    snapshots: [
      {
        id: "snapshot-1",
        participantId: "participant-1",
        fullName: "김경원",
        note: null,
        rosterOrder: 0,
        attendanceStatus: null,
      },
    ],
  },
];

describe("DashboardScreen", () => {
  it("renders the Figma next-action dashboard with route buttons", () => {
    render(<DashboardScreen data={baseData} dashboard={baseDashboard} />);

    expect(
      screen.getByRole("heading", { name: "운영자 대시보드" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "다음 액션" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "상태 요약" })).toHaveAttribute(
      "href",
      "/dashboard/status",
    );
    expect(screen.getByRole("link", { name: "사업 만들기" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(screen.getByRole("link", { name: "수업 연결하기" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(screen.getByRole("link", { name: "강사 배정하기" })).toHaveAttribute(
      "href",
      "/users",
    );
    const createSessionButton = screen.getByRole("button", {
      name: "세션 만들기",
    });
    expect(createSessionButton).toHaveClass("bg-white");
    expect(createSessionButton).toHaveClass("hover:bg-[#ffec1d]");
    expect(
      screen.getByText("운영자가 세션을 만들면 강사 작업공간이 바로 열립니다."),
    ).toBeInTheDocument();
  });

  it("derives session village, program, and teacher choices from the selected class", () => {
    const { container } = render(
      <DashboardScreen
        data={{
          ...baseData,
          villages: [
            { id: "village-1", name: "성내마을" },
            { id: "village-2", name: "동해마을" },
          ],
          programs: [
            { id: "program-1", name: "문해 사업" },
            { id: "program-2", name: "건강 사업" },
          ],
          classes: [
            ...baseData.classes,
            {
              id: "class-2",
              name: "건강 체조 수업",
              programId: "program-2",
              villageId: "village-2",
              programName: "건강 사업",
              villageName: "동해마을",
            },
          ],
          teacherAssignments: [
            ...baseData.teacherAssignments,
            {
              classId: "class-2",
              className: "건강 체조 수업",
              teacherId: "teacher-2",
              teacherName: "박강사",
              teacherEmail: "teacher2@example.com",
            },
          ],
        }}
        dashboard={baseDashboard}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "세션 만들기" }));
    fireEvent.change(screen.getByRole("combobox", { name: "수업" }), {
      target: { value: "class-2" },
    });

    expect(screen.queryByRole("combobox", { name: "마을" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "사업" })).not.toBeInTheDocument();
    expect(screen.getByText("동해마을")).toBeInTheDocument();
    expect(screen.getByText("건강 사업")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "강사" })).toHaveValue("teacher-2");
    expect(screen.queryByText("김강사")).not.toBeInTheDocument();
    expect(container.querySelector('input[name="villageId"]')).toHaveValue(
      "village-2",
    );
    expect(container.querySelector('input[name="programId"]')).toHaveValue(
      "program-2",
    );
  });

  it("renders the Figma status summary around selectable lesson blocks", () => {
    render(
      <DashboardScreen
        data={baseData}
        dashboard={baseDashboard}
        sessionManagementRecords={sessionManagementRecords}
        activeView="status"
      />,
    );

    expect(screen.getByText("세션 총 3개")).toBeInTheDocument();

    const selectedLesson = screen.getByRole("button", { name: /예시 수업/ });
    expect(selectedLesson).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2026.05.01(금) · 예시 사업 · 예시 마을")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "강사 할당" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "강사 선택" })).toHaveValue(
      "teacher-1",
    );
    expect(screen.getByRole("button", { name: "강사 저장" })).toBeInTheDocument();
    expect(screen.getByText("아직 제출 전")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록 상세 보기" })).toHaveAttribute(
      "href",
      "/records/session-1",
    );
    expect(screen.getByRole("heading", { name: "세션 참여자" })).toBeInTheDocument();
    expect(screen.getByText("김경원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김경원 제거" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("snapshot-1")).toHaveAttribute(
      "name",
      "snapshotId",
    );

    fireEvent.click(screen.getByRole("button", { name: "참여자 추가" }));

    expect(screen.getByRole("combobox", { name: "기존 참여자 선택" })).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("button", { name: "기존 참여자 추가" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("예: 홍길동")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "새 참여자 추가" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /두번째 수업/ }));

    expect(screen.getByRole("button", { name: /두번째 수업/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("2026.05.02(토) · 문해 사업 · 성내마을")).toBeInTheDocument();
  });

  it("shows an empty participant state instead of example names for real empty sessions", () => {
    render(
      <DashboardScreen
        data={baseData}
        dashboard={baseDashboard}
        sessionManagementRecords={[
          {
            ...sessionManagementRecords[0],
            snapshots: [],
          },
        ]}
        activeView="status"
      />,
    );

    expect(screen.getByText("아직 세션 참여자가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByText("김경원")).not.toBeInTheDocument();
    expect(screen.queryByText("김영희")).not.toBeInTheDocument();
  });

  it("keeps participant add controls inactive for the no-session example state", () => {
    render(
      <DashboardScreen
        data={{ ...baseData, recentSessions: [] }}
        dashboard={{
          ...baseDashboard,
          submissionOverview: {
            ...baseDashboard.submissionOverview,
            totalSessions: 0,
          },
        }}
        activeView="status"
      />,
    );

    expect(screen.getByText("아직 세션 참여자가 없습니다.")).toBeInTheDocument();
    expect(
      screen.getByText("세션을 먼저 만든 뒤 참여자를 한 명씩 추가할 수 있습니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참여자 추가" })).toBeDisabled();
  });
});
