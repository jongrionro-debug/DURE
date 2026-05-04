import { render, screen } from "@testing-library/react";

import { DemoEntryLink } from "@/components/demo/demo-entry-link";

describe("DemoEntryLink", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "false";
    process.env.NEXT_PUBLIC_DEMO_EMAIL = "demo@example.com";
  });

  it("hides the demo link when demo mode is disabled", () => {
    render(<DemoEntryLink />);

    expect(
      screen.queryByRole("link", { name: "데모로 체험하기" }),
    ).not.toBeInTheDocument();
  });

  it("shows the demo link when demo mode is enabled", () => {
    process.env.NEXT_PUBLIC_DEMO_ENABLED = "true";

    render(<DemoEntryLink />);

    expect(screen.getByRole("link", { name: "데모로 체험하기" })).toHaveAttribute(
      "href",
      "/login?demo=1",
    );
  });
});
