import type { Pool, PoolClient } from 'pg';
import type { Reading } from './alert-engine';
export type IngestResult = { outcome: 'accepted' | 'duplicate'; incidentId: string | null };
export class PostgresTelemetry {
  constructor(private db: Pool | PoolClient) {}
  async ingest(r: Reading): Promise<IngestResult> {
    const result = await this.db.query<{outcome: 'accepted' | 'duplicate'; incident_id: string | null}>(
      'SELECT * FROM relay.ingest($1,$2,$3,$4::bigint,$5::numeric,$6::boolean)',
      [r.organisation,r.asset,r.id,r.timestamp,r.waterLevel,r.pumpRunning]);
    const row = result.rows[0];
    if (!row) throw new Error('Missing ingestion result');
    return {outcome:row.outcome,incidentId:row.incident_id};
  }
  async resolve(organisation: string, asset: string, actor: string, note: string): Promise<string> {
    const result = await this.db.query<{id:string}>(
      'SELECT relay.resolve_incident($1,$2,$3,$4) AS id',[organisation,asset,actor,note]);
    return result.rows[0].id;
  }
}
