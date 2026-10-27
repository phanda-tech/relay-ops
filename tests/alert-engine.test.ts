import { describe, expect, it } from 'vitest';
import { AlertEngine, type Reading } from '../src/alert-engine';
const reading = (timestamp: number, changes: Partial<Reading> = {}): Reading => ({id:String(timestamp),organisation:'demo-a',asset:'pump-1',timestamp,waterLevel:90,pumpRunning:false,...changes});
const feed = (engine: AlertEngine, times: number[], changes: Partial<Reading> = {}) => times.map(t => engine.ingest(reading(t,changes)));
describe('AlertEngine', () => {
 it('requires sustained evidence and opens only one incident', () => {const e=new AlertEngine(); const results=feed(e,[0,10000,20000,30000,40000]); expect(results.filter(r=>r.incident)).toHaveLength(1); expect(results[3].incident?.openedAt).toBe(30000);});
 it('ignores duplicate event IDs', () => {const e=new AlertEngine();e.ingest(reading(0));expect(e.ingest(reading(0)).outcome).toBe('duplicate');});
 it('rejects out-of-order readings', () => {const e=new AlertEngine();e.ingest(reading(10000));expect(()=>e.ingest(reading(0))).toThrow('Out-of-order');});
 it('does not infer sustained conditions across a data gap', () => {const e=new AlertEngine();feed(e,[0,10000]);expect(e.ingest(reading(50000)).incident).toBeUndefined();});
 it('resets the timer after normal readings', () => {const e=new AlertEngine();feed(e,[0,10000]);e.ingest(reading(20000,{pumpRunning:true}));expect(e.ingest(reading(30000)).incident).toBeUndefined();expect(e.ingest(reading(40000)).incident).toBeUndefined();});
 it('keeps organisation and asset state separate', () => {const e=new AlertEngine();feed(e,[0,10000,20000]);expect(e.ingest(reading(30000,{organisation:'demo-b'})).incident).toBeUndefined();expect(e.ingest(reading(30000,{asset:'pump-2'})).incident).toBeUndefined();expect(e.ingest(reading(30000)).incident).toBeDefined();});
 it('rejects malformed readings and invalid rules', () => {const e=new AlertEngine();expect(()=>e.ingest({})).toThrow();expect(()=>e.ingest(reading(0,{waterLevel:101}))).toThrow();expect(()=>new AlertEngine(80,0)).toThrow();});
 it('can resolve and subsequently open a new incident', () => {const e=new AlertEngine();feed(e,[0,10000,20000,30000]);expect(e.resolve('demo-a','pump-1').status).toBe('resolved');const results=feed(e,[40000,50000,60000,70000]);expect(results[3].incident?.id).toBe('incident-2');});
 it('does not expose mutable internal incident data', () => {const e=new AlertEngine();const result=feed(e,[0,10000,20000,30000])[3];result.incident!.evidence.waterLevel=0;expect(e.resolve('demo-a','pump-1').evidence.waterLevel).toBe(90);});
});
