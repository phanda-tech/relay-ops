import { authorize, type Principal } from './authorization';
import type { Reading } from './alert-engine';
import type { IngestResult } from './persistence';
export interface TelemetryStore {
 ingest(reading: Reading): Promise<IngestResult>;
 resolve(organisation: string, asset: string, actor: string, note: string): Promise<string>;
}
export class AuthorizedTelemetry {
 constructor(private store: TelemetryStore) {}
 async ingest(principal: Principal | null, reading: Reading): Promise<IngestResult> {
  authorize(principal,'ingest',{organisation:reading.organisation,asset:reading.asset});
  return this.store.ingest(reading);
 }
 async resolve(principal: Principal | null, organisation: string, asset: string, note: string): Promise<string> {
  // Assignment checks need transactional database support before technician resolution is enabled.
  authorize(principal,'resolve',{organisation,asset});
  return this.store.resolve(organisation,asset,principal!.subject,note);
 }
}
