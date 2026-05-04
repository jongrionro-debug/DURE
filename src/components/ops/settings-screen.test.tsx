import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { SettingsScreen } from "@/components/ops/settings-screen";

vi.mock("@/server/actions/settings", () => ({
  createClassAction: vi.fn(),
  createParticipantAction: vi.fn(),
  createProgramAction: vi.fn(),
  createVillageAction: vi.fn(),
  deleteParticipantAction: vi.fn(),
}));

describe("SettingsScreen", () => {
  const settingsData = {
    villages: [{ id: "village-1", name: "성내마을", isPrimary: true }],
    programs: [
      {
        id: "program-1",
        name: "문해 사업",
        description: "기초 문해 지원",
      },
    ],
    classes: [
      {
        id: "class-1",
        name: "기초 문해 수업",
        description: "오전 반",
        programName: "문해 사업",
        villageName: "성내마을",
      },
    ],
    participants: [
      {
        id: "participant-1",
        fullName: "홍길동",
        note: "보호자 연락 필요",
        className: "기초 문해 수업",
      },
    ],
  };

  it("renders the settings flow as a channel-based operations console", () => {
    render(<SettingsScreen data={settingsData} />);

    expect(
      screen.getByRole("heading", { name: "운영 기본정보 설정" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "마을 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "사업 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수업 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참여자 1" })).toBeInTheDocument();

    const channelNav = screen.getByRole("navigation", {
      name: "설정 항목",
    });
    expect(within(channelNav).getByRole("button", { name: /마을/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(channelNav).getByRole("button", { name: /사업/ })).toBeInTheDocument();
    expect(within(channelNav).getByRole("button", { name: /수업/ })).toBeInTheDocument();
    expect(
      within(channelNav).getByRole("button", { name: /참여자 명단/ }),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "마을" })).toBeInTheDocument();
    expect(screen.getByText("성내마을 · 첫 마을")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("예: 동네 배움터")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "마을 추가" })).toBeInTheDocument();

    expect(screen.queryByRole("heading", { name: "사업" })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("예: 문해 사업")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "사업 추가" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "수업 추가" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "참여자 추가" })).not.toBeInTheDocument();
    expect(screen.queryByText("프로그램")).not.toBeInTheDocument();
  });

  it("switches the visible workspace when a settings channel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <SettingsScreen
        data={settingsData}
      />,
    );

    const channelNav = screen.getByRole("navigation", {
      name: "설정 항목",
    });

    await user.click(within(channelNav).getByRole("button", { name: /사업/ }));

    expect(screen.getByRole("heading", { name: "사업" })).toBeInTheDocument();
    expect(screen.getByText("문해 사업")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("예: 문해 사업")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("사업 설명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "사업 추가" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "마을" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "마을 추가" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "수업 1" }));

    expect(screen.getByRole("heading", { name: "수업" })).toBeInTheDocument();
    expect(screen.getByText("기초 문해 수업")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "사업 선택 안 함" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "마을 선택 안 함" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수업 추가" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "사업 추가" })).not.toBeInTheDocument();

    await user.click(
      within(channelNav).getByRole("button", { name: /참여자 명단/ }),
    );

    expect(screen.getByRole("heading", { name: "참여자 명단" })).toBeInTheDocument();
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "수업 선택 안 함" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참여자 추가" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "수업 추가" })).not.toBeInTheDocument();
  });
});
