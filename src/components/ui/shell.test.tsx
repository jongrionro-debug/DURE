import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppShell } from "@/components/ui/app-shell";
import { PlaceholderScreen } from "@/components/ui/shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("PlaceholderScreen", () => {
  it("renders the active route and next action copy", () => {
    render(
      createElement(PlaceholderScreen, {
        eyebrow: "Route scaffold",
        title: "Auth routes are ready",
        description: "This is a browser-safe shell component test.",
        activeRoute: "Auth",
        nextAction: "Wire the real auth forms in the next phase.",
      }),
    );

    expect(screen.getByText("Auth routes are ready")).toBeInTheDocument();
    expect(screen.getByText("Shared shell")).toBeInTheDocument();
    expect(
      screen.getByText("Wire the real auth forms in the next phase."),
    ).toBeInTheDocument();
  });
});

describe("AppShell", () => {
  it("renders the DURE console sidebar for operators", () => {
    render(
      <AppShell role="ops" email="admin@example.com">
        <section>운영 화면</section>
      </AppShell>,
    );

    expect(screen.getByText("DURE")).toBeInTheDocument();
    expect(screen.getByText("운영자 영역")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /대시보드/ })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /사용자·권한/ })).toHaveAttribute(
      "href",
      "/users",
    );
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
    expect(screen.getByText("운영 화면")).toBeInTheDocument();
  });

  it("renders only teacher navigation for teachers", () => {
    render(
      <AppShell role="teacher" email="teacher@example.com">
        <section>강사 화면</section>
      </AppShell>,
    );

    expect(screen.getByText("강사 영역")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /내 수업 일정/ })).toHaveAttribute(
      "href",
      "/sessions",
    );
    expect(screen.queryByRole("link", { name: /서류·기록/ })).not.toBeInTheDocument();
    expect(screen.getByText("강사 화면")).toBeInTheDocument();
  });
});
