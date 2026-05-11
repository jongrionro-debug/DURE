import pg from 'pg';

const client = new pg.Client("postgresql://postgres.sbpjolnlnwryjcwfjojd:ajklsjdfljdsjflajs@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres");
await client.connect();
const res = await client.query('SELECT * FROM drizzle.__drizzle_migrations');
console.log(res.rows);
process.exit(0);
