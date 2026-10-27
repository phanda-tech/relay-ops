import { describe, expect, it, vi } from 'vitest';
import { authorize, Forbidden, type Principal, type Action } from '../src/authorization';
import { AuthorizedTelemetry } from '../src/authorized-telemetry';
const resource={organisation:'org-a',asset:'pump-1'};
const admin:Principal={kind:'human',subject:'admin-1',organisation:'org-a',role:'administrator',active:true};
const operator:Principal={...admin,role:'operator'};
const tech:Principal={...admin,subject:'tech-1',role:'technician'};
const device:Principal={kind:'equipment',subject:'device-1',organisation:'org-a',assets:['pump-1'],active:true};
const reading={id:'e1',organisation:'org-a',asset:'pump-1',timestamp:0,waterLevel:90,pumpRunning:false};
function fixture(){const store={ingest:vi.fn().mockResolvedValue({outcome:'accepted',incidentId:null}),resolve:vi.fn().mockResolvedValue('1')};return {store,service:new AuthorizedTelemetry(store)};}
describe('authorization policy',()=>{
 it('denies unauthenticated and inactive principals',()=>{expect(()=>authorize(null,'view',resource)).toThrow(Forbidden);expect(()=>authorize({...admin,active:false},'view',resource)).toThrow(Forbidden);});
 it('denies cross-organisation actions even for administrators',()=>{for(const action of ['manage','view','resolve','assign'] as Action[])expect(()=>authorize(admin,action,{...resource,organisation:'org-b'})).toThrow(Forbidden);});
 it('allows administrator management and operator incident actions',()=>{expect(()=>authorize(admin,'manage',resource)).not.toThrow();for(const action of ['view','acknowledge','assign','resolve'] as Action[])expect(()=>authorize(operator,action,resource)).not.toThrow();expect(()=>authorize(operator,'manage',resource)).toThrow(Forbidden);});
 it('restricts technicians to assigned viewing and resolution',()=>{const assigned={...resource,assignedTo:'tech-1'};for(const action of ['view','resolve'] as Action[])expect(()=>authorize(tech,action,assigned)).not.toThrow();for(const action of ['assign','manage','acknowledge','ingest'] as Action[])expect(()=>authorize(tech,action,assigned)).toThrow(Forbidden);expect(()=>authorize(tech,'resolve',resource)).toThrow(Forbidden);expect(()=>authorize(tech,'view',{...resource,assignedTo:'other'})).toThrow(Forbidden);});
 it('permits equipment ingestion only for its authorised asset and organisation',()=>{expect(()=>authorize(device,'ingest',resource)).not.toThrow();expect(()=>authorize(device,'ingest',{...resource,asset:'pump-2'})).toThrow(Forbidden);expect(()=>authorize(device,'ingest',{...resource,organisation:'org-b'})).toThrow(Forbidden);for(const action of ['view','resolve','manage','assign','acknowledge'] as Action[])expect(()=>authorize(device,action,resource)).toThrow(Forbidden);});
 it('rejects human telemetry submissions and unknown runtime roles',()=>{expect(()=>authorize(admin,'ingest',resource)).toThrow(Forbidden);expect(()=>authorize({...admin,role:'unknown'} as unknown as Principal,'view',resource)).toThrow(Forbidden);});
});
describe('guarded telemetry service',()=>{
 it('never reaches persistence for forbidden ingestion',async()=>{const {store,service}=fixture();await expect(service.ingest(null,reading)).rejects.toThrow(Forbidden);await expect(service.ingest(admin,reading)).rejects.toThrow(Forbidden);await expect(service.ingest(device,{...reading,organisation:'org-b'})).rejects.toThrow(Forbidden);expect(store.ingest).not.toHaveBeenCalled();});
 it('forwards authorised equipment readings',async()=>{const {store,service}=fixture();await service.ingest(device,reading);expect(store.ingest).toHaveBeenCalledExactlyOnceWith(reading);});
 it('derives the recorded actor from trusted principal context',async()=>{const {store,service}=fixture();await service.resolve(operator,'org-a','pump-1','Inspection complete');expect(store.resolve).toHaveBeenCalledExactlyOnceWith('org-a','pump-1',operator.subject,'Inspection complete');});
 it('denies cross-organisation, device, and unimplemented technician resolution before persistence',async()=>{const {store,service}=fixture();await expect(service.resolve(admin,'org-b','pump-1','note')).rejects.toThrow(Forbidden);await expect(service.resolve(device,'org-a','pump-1','note')).rejects.toThrow(Forbidden);await expect(service.resolve(tech,'org-a','pump-1','note')).rejects.toThrow(Forbidden);expect(store.resolve).not.toHaveBeenCalled();});
});
