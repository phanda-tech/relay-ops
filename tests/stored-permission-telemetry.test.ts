import type { Pool } from 'pg';
import { describe,expect,it,vi } from 'vitest';
import { StoredPermissionTelemetry } from '../src/stored-permission-telemetry';
const reading={id:'e1',organisation:'org-a',asset:'pump',timestamp:0,waterLevel:90,pumpRunning:false};
function fixture(rows:unknown[]=[]){const query=vi.fn().mockResolvedValue({rows});return {query,service:new StoredPermissionTelemetry({query} as unknown as Pool)};}
describe('stored permission adapter',()=>{
 it('uses the guarded ingestion function and preserves bigint IDs as strings',async()=>{const {query,service}=fixture([{outcome:'accepted',incident_id:'9007199254740993'}]);const result=await service.ingest({kind:'equipment',subject:'device'},reading);expect(result.incidentId).toBe('9007199254740993');expect(query).toHaveBeenCalledWith('SELECT * FROM relay.ingest_as($1,$2,$3,$4,$5::bigint,$6::numeric,$7::boolean)',['device','org-a','pump','e1',0,90,false]);});
 it('takes the resolution actor only from server identity',async()=>{const {query,service}=fixture([{id:'42'}]);expect(await service.resolve({kind:'human',subject:'operator'},'org-a','pump','Checked')).toBe('42');expect(query).toHaveBeenCalledWith('SELECT relay.resolve_as($1,$2,$3,$4) AS id',['operator','org-a','pump','Checked']);});
 it('blocks the wrong identity kind before querying',async()=>{const {query,service}=fixture();await expect(service.ingest({kind:'human',subject:'admin'},reading)).rejects.toThrow('Invalid server identity');await expect(service.resolve({kind:'equipment',subject:'device'},'org-a','pump','note')).rejects.toThrow('Invalid server identity');expect(query).not.toHaveBeenCalled();});
 it('rejects empty identities before querying',async()=>{const {query,service}=fixture();await expect(service.ingest({kind:'equipment',subject:' '},reading)).rejects.toThrow();expect(query).not.toHaveBeenCalled();});
 it('propagates database authorization errors without retrying unguarded writes',async()=>{const {query,service}=fixture();query.mockRejectedValueOnce(new Error('Forbidden'));await expect(service.ingest({kind:'equipment',subject:'device'},reading)).rejects.toThrow('Forbidden');expect(query).toHaveBeenCalledTimes(1);});
});
