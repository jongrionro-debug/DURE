import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "service-role-key";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:5432/harness_framework";
process.env.NEXT_PUBLIC_DEMO_ENABLED ??= "false";
process.env.NEXT_PUBLIC_DEMO_EMAIL ??= "demo@example.com";
process.env.DEMO_ORGANIZATION_SLUG ??= "dure-demo";
