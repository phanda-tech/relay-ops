import { randomBytes,randomUUID } from 'node:crypto';
import pg from 'pg';
import { beforeAll,afterAll,describe,expect,it } from 'vitest';
import { migrate } from '../src/migrations';
import { StoredPermissionTelemetry } from '../src/stored-permission-telemetry';
import type { Reading } from '../src/alert-engine';
const url=process.env.RELAY_TEST_DATABASE_URL;
if(process.env.CI && !url && process.env.REQUIRE_DATABASE_TESTS==='1')throw new Error('Integration database URL required');
describe.skipIf(!url)('restricted login adapter integration',()=>{
 let owner:pg.Pool;
 let runtime:pg.Pool|undefined;
 let created=false;
 const login=`relay_test_${randomBytes(8).toString('hex')}`;
 beforeAll(async()=>{
  owner=new pg.Pool({connectionString:url});
  await migrate(owner);
  const password=randomBytes(32).toString('hex');
  // Both interpolated values are generated hex identifiers/secrets, not external input.
  await owner.query(`CREATE ROLE ${login} LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '${password}'`);
  created=true;
  await owner.query(`GRANT relay_runtime TO ${login}`);
  const connection=new URL(url!);connection.username=login;connection.password=password;
  runtime=new pg.Pool({connectionString:connection.toString(),max:3});
  const actual=await runtime.query('SELECT current_user AS name');
  expect(actual.rows[0].name).toBe(login);
 },30000);
 afterAll(async()=>{
  try{await runtime?.end();if(created)await owner.query(`DROP ROLE ${login}`);}finally{await owner?.end();}
 });
 async function fixture(){
  const org=`runtime-${randomUUID()}`;
  await owner.query('INSERT INTO relay.organisations VALUES($1)',[org]);
  await owner.query('INSERT INTO relay.assets(organisation,id) VALUES($1,$2)',[org,'pump']);
  await owner.query('INSERT INTO relay.memberships VALUES($1,$2,$3,true)',[org,'operator','operator']);
  await owner.query('INSERT INTO relay.equipment_access VALUES($1,$2,$3,true)',[org,'pump','device']);
  const reading=(timestamp:number):Reading=>({id:String(timestamp),organisation:org,asset:'pump',timestamp,waterLevel:90,pumpRunning:false});
  return {org,reading,db:new StoredPermissionTelemetry(runtime!)};
 }
 it('ingests and resolves through the adapter using the restricted login',async()=>{
  const {org,reading,db}=await fixture();
  for(const time of [0,10000,20000])expect((await db.ingest({kind:'equipment',subject:'device'},reading(time))).incidentId).toBeNull();
  const opened=await db.ingest({kind:'equipment',subject:'device'},reading(30000));
  expect(opened.incidentId).toBeTypeOf('string');
  expect(await db.resolve({kind:'human',subject:'operator'},org,'pump','Fictional inspection')).toBe(opened.incidentId);
  const history=await owner.query('SELECT action,actor FROM relay.incident_activity WHERE incident=$1 ORDER BY id',[opened.incidentId]);
  expect(history.rows.map(r=>r.action)).toEqual(['opened','resolved']);
  expect(history.rows[1].actor).toBe('operator');
 });
 it('rejects forbidden direct reads, writes, and unguarded calls through this login',async()=>{
  await expect(runtime!.query('SELECT * FROM relay.memberships')).rejects.toMatchObject({code:'42501'});
  await expect(runtime!.query("UPDATE relay.memberships SET role='administrator'")).rejects.toMatchObject({code:'42501'});
  await expect(runtime!.query("SELECT * FROM relay.ingest('none','pump','e',0,90,false)")).rejects.toMatchObject({code:'42501'});
 });
 it('blocks unknown organisation scopes and revoked equipment through the adapter',async()=>{
  const {org,reading,db}=await fixture();
  await expect(db.ingest({kind:'equipment',subject:'device'},{...reading(0),organisation:`absent-${randomUUID()}`})).rejects.toMatchObject({code:'42501'});
  await owner.query('UPDATE relay.equipment_access SET active=false WHERE organisation=$1',[org]);
  await expect(db.ingest({kind:'equipment',subject:'device'},reading(0))).rejects.toMatchObject({code:'42501'});
  const saved=await owner.query('SELECT count(*)::int AS n FROM relay.readings WHERE organisation=$1',[org]);expect(saved.rows[0].n).toBe(0);
 });
 it('blocks revoked human membership without resolving the incident',async()=>{
  const {org,reading,db}=await fixture();
  for(const time of [0,10000,20000,30000])await db.ingest({kind:'equipment',subject:'device'},reading(time));
  await owner.query('UPDATE relay.memberships SET active=false WHERE organisation=$1',[org]);
  await expect(db.resolve({kind:'human',subject:'operator'},org,'pump','Denied inspection')).rejects.toMatchObject({code:'42501'});
  const saved=await owner.query('SELECT count(*)::int AS n FROM relay.incidents WHERE organisation=$1 AND resolved_at IS NULL',[org]);expect(saved.rows[0].n).toBe(1);
 });
});
