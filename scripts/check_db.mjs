import pg from 'pg';

const client = new pg.Client("postgresql://postgres.sbpjolnlnwryjcwfjojd:ajklsjdfljdsjflajs@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres");
await client.connect();
const res = await client.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'teacher_id'");
console.log(res.rows);
process.exit(0);
