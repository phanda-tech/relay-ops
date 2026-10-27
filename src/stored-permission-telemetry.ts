import type { Pool, PoolClient } from 'pg';
import type { Reading } from './alert-engine';
import type { IngestResult } from './persistence';
export type ServerIdentity = {kind:'human'|'equipment';subject:string};
function requireIdentity(identity:ServerIdentity,kind:ServerIdentity['kind']):string {
 if (!identity || identity.kind!==kind || typeof identity.subject!=='string' || !identity.subject.trim() || identity.subject.length>128) throw new Error('Invalid server identity');
 return identity.subject;
}
// Identity must be verified by a trusted caller. This adapter does not authenticate requests.
export class StoredPermissionTelemetry {
 constructor(private db:Pool|PoolClient) {}
 async ingest(identity:ServerIdentity,r:Reading):Promise<IngestResult> {
  const subject=requireIdentity(identity,'equipment');
  const result=await this.db.query<{outcome:'accepted'|'duplicate';incident_id:string|null}>(
   'SELECT * FROM relay.ingest_as($1,$2,$3,$4,$5::bigint,$6::numeric,$7::boolean)',
   [subject,r.organisation,r.asset,r.id,r.timestamp,r.waterLevel,r.pumpRunning]);
  if(!result.rows[0])throw new Error('Missing ingestion result');
  return {outcome:result.rows[0].outcome,incidentId:result.rows[0].incident_id};
 }
 async resolve(identity:ServerIdentity,organisation:string,asset:string,note:string):Promise<string> {
  const subject=requireIdentity(identity,'human');
  const result=await this.db.query<{id:string}>('SELECT relay.resolve_as($1,$2,$3,$4) AS id',[subject,organisation,asset,note]);
  if(!result.rows[0])throw new Error('Missing resolution result');
  return result.rows[0].id;
 }
}
