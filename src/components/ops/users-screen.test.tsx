import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { UsersScreen } from "@/components/ops/users-screen";

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

vi.mock("@/server/actions/memberships", () => ({
  approveMemberAction: vi.fn(),
  assignTeacherAction: vi.fn(),
  createInviteAction: vi.fn(),
  updateMemberRoleAction: vi.fn(),
}));

describe("UsersScreen", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });
  });

  it("renders the redesigned user console with invite copy support", () => {
    const inviteToken = "invite-token-for-local-first-operators-1234567890";

    render(
      <UsersScreen
        data={{
          members: [
            {
              membershipId: "membership-1",
              userId: "user-1",
              email: "teacher@example.com",
              displayName: "김강사",
              role: "teacher",
              approvedAt: new Date("2026-04-28T09:00:00.000Z"),
            },
          ],
          invites: [
            {
              id: "invite-1",
              email: "teacher@example.com",
              role: "teacher",
              inviteToken,
              expiresAt: new Date("2026-04-29T09:00:00.000Z"),
              acceptedAt: null,
            },
          ],
          assignments: [
            {
              id: "assignment-1",
              className: "기초 문해 수업",
              userEmail: "teacher@example.com",
            },
          ],
          classes: [{ id: "class-1", name: "기초 문해 수업" }],
        }}
      />,
    );

    const backLink = screen.getByRole("link", { name: "대시보드" });
    expect(backLink).toHaveAttribute("href", "/dashboard");
    const header = screen.getByRole("banner");
    expect(within(header).queryByText("DURE : 두레")).not.toBeInTheDocument();
    expect(within(header).queryByLabelText("알림")).not.toBeInTheDocument();
    expect(within(header).queryByText("관리자")).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "사용자 관리" }),
    ).toBeInTheDocument();
    expect(screen.getByText("전체 멤버")).toBeInTheDocument();
    expect(screen.getByText("배정된 수업")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "멤버" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByRole("tab", { name: "초대" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "수업 배정" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "새 사용자 초대" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("이름 또는 이메일 검색"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("김강사").length).toBeGreaterThan(0);
    expect(screen.getByText("승인 완료")).toBeInTheDocument();

    const tokenCode = screen.getByText(inviteToken);
    expect(tokenCode).toBeInTheDocument();
    expect(tokenCode).toHaveClass("break-all");

    fireEvent.click(screen.getByRole("button", { name: "토큰 복사" }));

    expect(writeText).toHaveBeenCalledWith(inviteToken);
  });

  it("keeps approval, role update, invite, and assignment controls available", () => {
    render(
      <UsersScreen
        data={{
          members: [
            {
              membershipId: "membership-1",
              userId: "user-1",
              email: "pending@example.com",
              displayName: "박민준",
              role: "teacher",
              approvedAt: null,
            },
          ],
          invites: [],
          assignments: [],
          classes: [{ id: "class-1", name: "마을 기록 워크숍" }],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "접근 승인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "역할 변경" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "초대 보내기" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "배정하기" })).toBeInTheDocument();
    expect(screen.getAllByText("승인 대기").length).toBeGreaterThan(0);
  });
});
