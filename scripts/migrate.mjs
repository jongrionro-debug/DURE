import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationClient = postgres("postgresql://postgres.sbpjolnlnwryjcwfjojd:ajklsjdfljdsjflajs@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres", { max: 1 });

async function main() {
  try {
    const db = drizzle(migrationClient);
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await migrationClient.end();
  }
}
main();
