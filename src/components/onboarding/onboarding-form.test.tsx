import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/auth/supabase-browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}));

vi.mock("@/server/actions/onboarding", () => ({
  createOrganizationOnboardingAction: vi.fn(),
  acceptInviteOnboardingAction: vi.fn(),
}));

describe("OnboardingForm", () => {
  it("uses the console onboarding language and primary setup actions", () => {
    render(<OnboardingForm email="admin@example.com" />);

    expect(screen.getByText("DURE")).toBeInTheDocument();
    expect(screen.getByText("운영 시작 설정")).toBeInTheDocument();
    expect(
      screen.getByText("기관과 첫 마을을 등록하면 대시보드에서 수업 일정을 만들 수 있습니다."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "기관 만들기" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("기존 기관 참여")[0]).toBeInTheDocument();
  });
});
