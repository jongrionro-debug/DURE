import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";

const replace = vi.fn();
const refresh = vi.fn();

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    refresh,
  }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/lib/auth/supabase-browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  }),
}));

describe("AuthForm demo mode", () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    searchParams = new URLSearchParams();
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "false";
    process.env.NEXT_PUBLIC_DEMO_EMAIL = "demo@example.com";
  });

  it("does not prefill the login email outside demo mode", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });

  it("prefills the demo email on /login?demo=1 when demo mode is enabled", () => {
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "true";
    searchParams = new URLSearchParams("demo=1");

    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("E-mail")).toHaveValue("demo@example.com");
    expect(
      screen.getByText("데모 계정으로 제품 흐름을 바로 확인할 수 있습니다."),
    ).toBeInTheDocument();
  });
});
