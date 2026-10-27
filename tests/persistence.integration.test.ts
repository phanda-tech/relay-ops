import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { migrate } from '../src/migrations';
import { PostgresTelemetry } from '../src/persistence';
import type { Reading } from '../src/alert-engine';
const url = process.env.RELAY_TEST_DATABASE_URL;
if (process.env.CI && !url && process.env.REQUIRE_DATABASE_TESTS === '1') throw new Error('Integration database URL required');
describe.skipIf(!url)('PostgreSQL integration', () => {
 let pool: pg.Pool;
 beforeAll(async()=>{pool=new pg.Pool({connectionString:url,max:5});await migrate(pool);},30000);
 afterAll(async()=>{await pool?.end();});
 async function fixture() {
  const organisation=`test-${randomUUID()}`;
  await pool.query('INSERT INTO relay.organisations(id) VALUES($1)',[organisation]);
  await pool.query('INSERT INTO relay.assets(organisation,id) VALUES($1,$2)',[organisation,'pump-1']);
  return (timestamp:number,changes:Partial<Reading>={}):Reading=>({id:String(timestamp),organisation,asset:'pump-1',timestamp,waterLevel:90,pumpRunning:false,...changes});
 }
 it('reruns migrations without changing the applied ledger',async()=>{const before=await pool.query('SELECT name,checksum,applied_at FROM public.relay_schema_migrations ORDER BY name');await migrate(pool);const after=await pool.query('SELECT name,checksum,applied_at FROM public.relay_schema_migrations ORDER BY name');expect(before.rows.length).toBeGreaterThan(0);expect(after.rows).toEqual(before.rows);});
 it('accepts one of concurrent identical submissions and marks the rest duplicate',async()=>{const r=await fixture();const db=new PostgresTelemetry(pool);const results=await Promise.all(Array.from({length:8},()=>db.ingest(r(0))));expect(results.filter(x=>x.outcome==='accepted')).toHaveLength(1);expect(results.filter(x=>x.outcome==='duplicate')).toHaveLength(7);});
 it('creates one incident when the threshold event is retried concurrently',async()=>{const r=await fixture();const db=new PostgresTelemetry(pool);for(const t of [0,10000,20000])await db.ingest(r(t));const results=await Promise.all(Array.from({length:6},()=>db.ingest(r(30000))));expect(results.filter(x=>x.incidentId)).toHaveLength(1);const count=await pool.query('SELECT count(*)::int AS n FROM relay.incidents WHERE organisation=$1',[r(0).organisation]);expect(count.rows[0].n).toBe(1);});
 it('rolls back readings and rule state together',async()=>{const r=await fixture();const client=await pool.connect();try{await client.query('BEGIN');await new PostgresTelemetry(client).ingest(r(0));await client.query('ROLLBACK');}finally{client.release();}const db=new PostgresTelemetry(pool);expect((await db.ingest(r(0))).outcome).toBe('accepted');});
 it('continues the stored timer through a new application connection pool',async()=>{const r=await fixture();const first=new pg.Pool({connectionString:url});try{const db=new PostgresTelemetry(first);for(const t of [0,10000,20000])await db.ingest(r(t));}finally{await first.end();}const second=new pg.Pool({connectionString:url});try{const db=new PostgresTelemetry(second);expect((await db.ingest(r(30000))).incidentId).not.toBeNull();expect(await db.resolve(r(0).organisation,'pump-1','test-operator','Fictional inspection')).toBeTypeOf('string');}finally{await second.end();}});
 it('resets sustained evidence across a gap',async()=>{const r=await fixture();const db=new PostgresTelemetry(pool);await db.ingest(r(0));await db.ingest(r(10000));expect((await db.ingest(r(50000))).incidentId).toBeNull();});
 it('resets the timer on recovery and rejects out-of-order events',async()=>{const r=await fixture();const db=new PostgresTelemetry(pool);for(const t of [0,10000])await db.ingest(r(t));await db.ingest(r(20000,{pumpRunning:true}));expect((await db.ingest(r(30000))).incidentId).toBeNull();expect((await db.ingest(r(40000))).incidentId).toBeNull();await expect(db.ingest(r(35000))).rejects.toThrow('Out-of-order');});
 it('rejects conflicting replays without altering stored evidence',async()=>{const r=await fixture();const db=new PostgresTelemetry(pool);await db.ingest(r(0));await expect(db.ingest(r(0,{waterLevel:95}))).rejects.toThrow('payload conflict');const saved=await pool.query('SELECT water_level::text AS level FROM relay.readings WHERE organisation=$1',[r(0).organisation]);expect(saved.rows[0].level).toBe('90');});
});
