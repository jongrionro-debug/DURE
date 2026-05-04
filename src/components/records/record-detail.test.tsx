import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { RecordDetailScreen } from "@/components/records/record-detail";

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

describe("RecordDetailScreen", () => {
  it("renders the redesigned record detail console with working filters and links", () => {
    render(
      <RecordDetailScreen
        record={{
          id: "session-1",
          sessionDate: "2026-04-28",
          className: "기초 문해 수업",
          villageName: "성내마을",
          programName: "문해 사업",
          teacherName: null,
          teacherEmail: "teacher@example.com",
          submittedAt: new Date("2026-04-28T09:00:00.000Z"),
          updatedAt: new Date("2026-04-28T10:00:00.000Z"),
          lessonJournal: "한글 모음 복습과 받아쓰기 연습을 진행했습니다.",
          attendance: [
            {
              snapshotId: "snapshot-1",
              fullName: "박수강",
              note: null,
              rosterOrder: 0,
              status: "present",
            },
            {
              snapshotId: "snapshot-2",
              fullName: "이지각",
              note: "10분 늦게 도착",
              rosterOrder: 1,
              status: "late",
            },
          ],
          attachments: [
            {
              id: "attachment-1",
              fileName: "출석부.pdf",
              mimeType: "application/pdf",
              size: 2048,
              filePath: "session-1/attendance.pdf",
            },
          ],
        }}
      />,
    );

    const backLink = screen.getByRole("link", { name: "기록 목록" });
    const sessionManagementLink = screen.getByRole("link", {
      name: "세션 관리",
    });

    expect(backLink).toHaveAttribute("href", "/records");
    expect(sessionManagementLink).toHaveAttribute(
      "href",
      "/dashboard/sessions/session-1",
    );
    expect(screen.getByText("출석 1")).toBeInTheDocument();
    expect(screen.getByText("지각 1")).toBeInTheDocument();
    expect(screen.getByText("첨부 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "출석 기록" })).toBeInTheDocument();
    expect(screen.getByText("기초 문해 수업")).toBeInTheDocument();
    expect(screen.getByText("박수강")).toBeInTheDocument();
    expect(screen.getByText("이지각")).toBeInTheDocument();
    expect(screen.getByText("한글 모음 복습과 받아쓰기 연습을 진행했습니다.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "지각" }));

    expect(screen.queryByText("박수강")).not.toBeInTheDocument();
    expect(screen.getByText("이지각")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("이름 또는 메모 검색"), {
      target: { value: "없는 이름" },
    });

    expect(screen.getByText("조건에 맞는 출석 기록이 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "다운로드" })).toHaveAttribute(
      "href",
      "https://sbpjolnlnwryjcwfjojd.supabase.co/storage/v1/object/public/session-attachments/session-1/attendance.pdf?download=출석부.pdf",
    );
  });
});
