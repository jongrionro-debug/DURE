import { getDemoEnv, getLocalMvpEnvStatus, getServerEnv } from "@/lib/env";

describe("env helpers", () => {
  const validEnv = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    DATABASE_URL:
      "postgresql://postgres:postgres@127.0.0.1:5432/harness_framework",
  };

  it("parses the required local MVP env keys", () => {
    expect(getServerEnv(validEnv)).toEqual(validEnv);
  });

  it("accepts the publishable key alias and normalizes it", () => {
    expect(
      getServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        DATABASE_URL:
          "postgresql://postgres:postgres@127.0.0.1:5432/harness_framework",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "publishable-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      DATABASE_URL:
        "postgresql://postgres:postgres@127.0.0.1:5432/harness_framework",
    });
  });

  it("reports optional email keys separately", () => {
    expect(
      getLocalMvpEnvStatus({
        ...validEnv,
        EMAIL_FROM: "ops@example.com",
        SUPABASE_ATTACHMENTS_BUCKET: "session-attachments",
      }),
    ).toEqual({
      requiredKeys: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "DATABASE_URL",
      ],
      optionalKeysConfigured: [
        "EMAIL_FROM",
        "SUPABASE_ATTACHMENTS_BUCKET",
      ],
    });
  });

  it("throws a clear error when a required env key is missing", () => {
    expect(() =>
      getServerEnv({
        ...validEnv,
        DATABASE_URL: undefined,
      }),
    ).toThrowError(/Missing required server environment variables/);
  });

  it("throws a clear error when both public Supabase keys are missing", () => {
    expect(() =>
      getServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        DATABASE_URL:
          "postgresql://postgres:postgres@127.0.0.1:5432/harness_framework",
      }),
    ).toThrowError(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required/,
    );
  });

  it("treats demo mode as disabled by default", () => {
    expect(getDemoEnv({})).toEqual({
      enabled: false,
      email: null,
      organizationSlug: "dure-demo",
    });
  });

  it("parses enabled public demo settings", () => {
    expect(
      getDemoEnv({
        NEXT_PUBLIC_DEMO_ENABLED: "true",
        NEXT_PUBLIC_DEMO_EMAIL: "demo@example.com",
        DEMO_ORGANIZATION_SLUG: "public-demo",
      }),
    ).toEqual({
      enabled: true,
      email: "demo@example.com",
      organizationSlug: "public-demo",
    });
  });

  it("requires a demo email when demo mode is enabled", () => {
    expect(() =>
      getDemoEnv({
        NEXT_PUBLIC_DEMO_ENABLED: "true",
      }),
    ).toThrowError(
      /NEXT_PUBLIC_DEMO_EMAIL is required when demo mode is enabled/,
    );
  });
});
