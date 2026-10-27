import { describe,expect,it } from 'vitest';
import { demoReading } from '../src/demo-scenario';
import { AlertEngine } from '../src/alert-engine';
describe('fictional demonstration scenario',()=>{
 it('moves from normal operation to pump fault and recovery',()=>{expect(demoReading(0).pumpRunning).toBe(true);expect(demoReading(30000).waterLevel).toBe(82);expect(demoReading(30000).pumpRunning).toBe(false);expect(demoReading(90000).pumpRunning).toBe(true);});
 it('opens exactly one incident at sixty simulated seconds',()=>{const engine=new AlertEngine();const incidents=[];for(let t=0;t<=110000;t+=10000){const result=engine.ingest(demoReading(t));if(result.incident)incidents.push(result.incident);}expect(incidents).toHaveLength(1);expect(incidents[0].openedAt).toBe(60000);});
 it('is deterministic and rejects invalid simulation times',()=>{expect(demoReading(40000)).toEqual(demoReading(40000));expect(()=>demoReading(-1)).toThrow();});
});
