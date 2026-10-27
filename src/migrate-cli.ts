import pg from 'pg';
import { migrate } from './migrations';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; use a disposable local database');
const pool = new pg.Pool({connectionString:process.env.DATABASE_URL});
try { await migrate(pool); console.log('Migrations are up to date'); }
finally { await pool.end(); }
