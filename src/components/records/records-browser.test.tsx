import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { RecordsBrowser } from "@/components/records/records-browser";

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

describe("RecordsBrowser", () => {
  it("uses schedule terminology and keeps search controls visible", () => {
    render(
      <RecordsBrowser
        rows={[
          {
            id: "session-1",
            sessionDate: "2026-05-20",
            className: "스마트폰 기초",
            villageName: "다도리",
            programName: "문해 사업",
            teacherName: "김강사",
            teacherEmail: "teacher@example.com",
            submittedAt: null,
            updatedAt: new Date("2026-05-20T09:00:00.000Z"),
          },
        ]}
        filterOptions={{ programs: ["문해 사업"], teachers: ["김강사"] }}
        filters={{}}
      />,
    );

    expect(screen.getByRole("heading", { name: "서류·기록" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("프로그램, 사업, 마을, 강사 검색"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "수업 일정 관리" })).toHaveAttribute(
      "href",
      "/dashboard/sessions/session-1",
    );
  });
});
