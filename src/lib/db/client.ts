import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

declare global {
  // eslint-disable-next-line no-var
  var __dureClient: postgres.Sql | undefined;
}

function getClient() {
  if (!globalThis.__dureClient) {
    const env = getServerEnv();
    globalThis.__dureClient = postgres(env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // Required for Supabase pgBouncer Transaction Pooler (port 6543)
    });
  }

  return globalThis.__dureClient;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}
