import { z } from "zod";

type EnvSource = Record<string, string | undefined>;

const runtimePublicEnvSource = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required.")
    .optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.")
    .optional(),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required."),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
});

const optionalEmailSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
});

const optionalStorageSchema = z.object({
  SUPABASE_ATTACHMENTS_BUCKET: z.string().min(1).optional(),
});

const demoEnvSchema = z.object({
  NEXT_PUBLIC_DEMO_ENABLED: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_DEMO_EMAIL: z.string().email().optional(),
  DEMO_ORGANIZATION_SLUG: z.string().min(1).optional(),
});

function formatIssues(title: string, error: z.ZodError) {
  const details = error.issues
    .map((issue) => `- ${issue.message}`)
    .join("\n");

  return `${title}\n${details}\n\nCopy the required keys from .env.example into .env.local before starting the app.`;
}

function parseWithSchema<T>(
  title: string,
  schema: z.ZodSchema<T>,
  source: EnvSource,
) {
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    throw new Error(formatIssues(title, parsed.error));
  }

  return parsed.data;
}

export function getPublicEnv(source: EnvSource = runtimePublicEnvSource) {
  const publicEnv = parseWithSchema(
    "Missing required public environment variables.",
    publicEnvSchema,
    {
      NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
  );

  const supabasePublicKey =
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabasePublicKey) {
    throw new Error(
      "Missing required public environment variables.\n- NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.\n\nCopy the required keys from .env.example into .env.local before starting the app.",
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabasePublicKey,
  };
}

export function getServerEnv(source: EnvSource = process.env) {
  const publicEnv = getPublicEnv(source);
  const serverEnv = parseWithSchema(
    "Missing required server environment variables.",
    serverEnvSchema,
    {
      SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: source.DATABASE_URL,
    },
  );

  return {
    ...publicEnv,
    ...serverEnv,
  };
}

export function getOptionalEmailEnv(source: EnvSource = process.env) {
  return optionalEmailSchema.parse({
    RESEND_API_KEY: source.RESEND_API_KEY,
    EMAIL_FROM: source.EMAIL_FROM,
  });
}

export function getOptionalStorageEnv(source: EnvSource = process.env) {
  return optionalStorageSchema.parse({
    SUPABASE_ATTACHMENTS_BUCKET: source.SUPABASE_ATTACHMENTS_BUCKET,
  });
}

export function getDemoEnv(source: EnvSource = process.env) {
  const parsed = demoEnvSchema.parse({
    NEXT_PUBLIC_DEMO_ENABLED: source.NEXT_PUBLIC_DEMO_ENABLED,
    NEXT_PUBLIC_DEMO_EMAIL: source.NEXT_PUBLIC_DEMO_EMAIL,
    DEMO_ORGANIZATION_SLUG: source.DEMO_ORGANIZATION_SLUG,
  });

  const enabled = parsed.NEXT_PUBLIC_DEMO_ENABLED === "true";

  if (enabled && !parsed.NEXT_PUBLIC_DEMO_EMAIL) {
    throw new Error(
      "NEXT_PUBLIC_DEMO_EMAIL is required when demo mode is enabled.",
    );
  }

  return {
    enabled,
    email: parsed.NEXT_PUBLIC_DEMO_EMAIL ?? null,
    organizationSlug: parsed.DEMO_ORGANIZATION_SLUG ?? "dure-demo",
  };
}

export function getLocalMvpEnvStatus(source: EnvSource = process.env) {
  const env = getServerEnv(source);
  const optionalEmail = getOptionalEmailEnv(source);
  const optionalStorage = getOptionalStorageEnv(source);

  return {
    requiredKeys: Object.keys(env),
    optionalKeysConfigured: [...Object.entries(optionalEmail), ...Object.entries(optionalStorage)]
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key),
  };
}
