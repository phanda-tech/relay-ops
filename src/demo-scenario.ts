import type { Reading } from './alert-engine';
export function demoReading(timestamp:number):Reading {
 if(!Number.isSafeInteger(timestamp)||timestamp<0)throw new Error('Invalid simulation time');
 const phase=timestamp%120000;
 const fault=phase>=30000 && phase<90000;
 return {id:`demo-${timestamp}`,organisation:'fictional-site',asset:'pump-01',timestamp,waterLevel:fault?Math.min(96,82+(phase-30000)/5000):48,pumpRunning:!fault};
}
