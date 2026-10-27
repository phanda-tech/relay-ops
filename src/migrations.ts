import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import type { Pool } from 'pg';
export async function migrate(pool: Pool): Promise<void> {
 const client = await pool.connect();
 try {
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(72731001)");
  await client.query('CREATE TABLE IF NOT EXISTS public.relay_schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  const folder = new URL('../db/migrations/',import.meta.url);
  const names = (await readdir(folder)).filter(n => /^\d+_[a-z0-9_]+\.sql$/.test(n)).sort();
  const rows = await client.query<{name:string;checksum:string}>('SELECT name,checksum FROM public.relay_schema_migrations ORDER BY name');
  const applied = new Map(rows.rows.map(r=>[r.name,r.checksum]));
  if (rows.rows.some(r=>!names.includes(r.name))) throw new Error('Previously applied migration is missing');
  let pending = false;
  for (const name of names) {
   const sql = await readFile(new URL(name,folder),'utf8');
   const checksum = createHash('sha256').update(sql).digest('hex');
   if (applied.has(name)) {
    if (pending) throw new Error('Migration inserted before an applied migration');
    if (applied.get(name)!==checksum) throw new Error(`Applied migration changed: ${name}`);
    continue;
   }
   pending = true;
   if (name === '001_persistence.sql') {
    const existing = await client.query("SELECT to_regnamespace('relay') AS schema");
    if (existing.rows[0].schema) throw new Error('Untracked relay schema exists; use a fresh disposable database or a reviewed baseline procedure');
   }
   if (!/^\s*BEGIN;[\s\S]*COMMIT;\s*$/.test(sql)) throw new Error(`Expected transaction wrapper: ${name}`);
   const body = sql.replace(/^\s*BEGIN;/,'').replace(/COMMIT;\s*$/,'');
   await client.query(body);
   await client.query('INSERT INTO public.relay_schema_migrations(name,checksum) VALUES($1,$2)',[name,checksum]);
  }
  await client.query('COMMIT');
 } catch(error) {
  await client.query('ROLLBACK');
  throw error;
 } finally { client.release(); }
}
