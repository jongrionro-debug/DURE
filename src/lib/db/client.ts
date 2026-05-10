import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getServerEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

declare global {
  // eslint-disable-next-line no-var
  var __durePool: Pool | undefined;
}

function getPool() {
  if (!globalThis.__durePool) {
    const env = getServerEnv();
    globalThis.__durePool = new Pool({
      connectionString: env.DATABASE_URL,
    });
  }

  return globalThis.__durePool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}
