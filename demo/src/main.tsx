import { useEffect,useRef,useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertEngine,type Incident,type Reading } from '../../src/alert-engine';
import { demoReading } from '../../src/demo-scenario';
import './style.css';
type Event={time:number;message:string};
type Session={engine:AlertEngine;clock:number;readings:Reading[];incidents:Incident[];events:Event[]};
const fresh=():Session=>({engine:new AlertEngine(),clock:-10000,readings:[],incidents:[],events:[]});
const time=(ms:number)=>`${Math.floor(ms/60000).toString().padStart(2,'0')}:${Math.floor(ms/1000%60).toString().padStart(2,'0')}`;
function App(){
 const session=useRef<Session>(fresh());
 const [version,render]=useState(0);
 const [running,setRunning]=useState(false);
 const [note,setNote]=useState('');
 const [message,setMessage]=useState('Ready. Start the fictional scenario or advance one reading.');
 const step=()=>{
  const s=session.current;s.clock+=10000;
  const reading=demoReading(s.clock);const previous=s.readings.at(-1);
  const result=s.engine.ingest(reading);s.readings=[...s.readings,reading].slice(-36);
  if(!previous||previous.pumpRunning!==reading.pumpRunning)s.events=[{time:s.clock,message:reading.pumpRunning?'Telemetry: pump running; water level normal.':'Telemetry: pump stopped; water level above threshold.'},...s.events].slice(0,60);
  if(result.incident){s.incidents=[result.incident,...s.incidents].slice(0,30);s.events=[{time:s.clock,message:`Rule opened ${result.incident.id}: stopped pump and sustained high water.`},...s.events].slice(0,60);setMessage('New incident opened by the alert engine.');}
  render(v=>v+1);
 };
 const stepRef=useRef(step);stepRef.current=step;
 useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>stepRef.current(),1000);return()=>window.clearInterval(timer);},[running]);
 const s=session.current;const latest=s.readings.at(-1);const open=s.incidents.find(i=>i.status==='open');
 const resolve=()=>{
  if(!open||!note.trim())return;
  const resolved=s.engine.resolve('fictional-site','pump-01');
  s.incidents=s.incidents.map(i=>i.id===resolved.id?resolved:i);
  s.events=[{time:s.clock,message:`Demo operator resolved ${resolved.id}: ${note.trim()}`},...s.events].slice(0,60);
  setNote('');setMessage('Incident resolved in this demo session. This does not control equipment.');render(v=>v+1);
 };
 const points=s.readings.map((r,i)=>`${20+i*560/Math.max(1,s.readings.length-1)},${160-r.waterLevel*1.3}`).join(' ');
 return <><header><div className="brand"><span className="mark">R</span><div><h1>Relay Ops</h1><p>Equipment intelligence / Phanda Tech</p></div></div><span className="badge">LOCAL SIMULATION</span></header><main><section className="intro"><div><p className="eyebrow">FICTIONAL SITE / WATER MANAGEMENT</p><h2>From equipment signals<br/>to accountable action.</h2><p>A working alert-engine demonstration. No live machinery, real users, or database connection.</p></div><div className="controls"><button onClick={()=>setRunning(v=>!v)}>{running?'Pause scenario':'Start scenario'}</button><button className="secondary" disabled={running} onClick={step}>Next reading</button><button className="secondary" onClick={()=>{if(window.confirm('Clear this demo session and its history?')){setRunning(false);session.current=fresh();setNote('');setMessage('Session reset.');render(v=>v+1);}}}>Reset session</button><small>1 second playback = 10 simulated seconds</small></div></section><div className="notice">Demo identity: Operator · Not authenticated · State is in memory and clears on reload</div><p className="status" role="status">{message}</p><section className="metrics" aria-label="Equipment summary"><div className="card"><span>PUMP-01</span><strong>{latest?(latest.pumpRunning?'Running':'Stopped'):'Awaiting data'}</strong><small>Scripted equipment state</small></div><div className="card"><span>WATER LEVEL</span><strong>{latest?`${latest.waterLevel.toFixed(0)}%`:'—'}</strong><small>High-water threshold: 80%</small></div><div className="card"><span>OPEN INCIDENTS</span><strong className={open?'amber':''}>{open?1:0}</strong><small>One open incident per asset</small></div><div className="card"><span>SCENARIO CLOCK</span><strong>{time(Math.max(0,s.clock))}</strong><small>{running?'Playing':'Paused'} · {s.readings.length} retained readings</small></div></section><section className="grid"><article className="panel"><div className="panel-heading"><h3>Water-level trend</h3><span className="badge">SIMULATED %</span></div><svg viewBox="0 0 600 185" role="img" aria-label="Water level over the most recent simulated readings; dashed line marks 80 percent"><line x1="20" y1="56" x2="580" y2="56" stroke="#e9ae45" strokeDasharray="5 5"/><text x="20" y="45" fill="#e9ae45" fontSize="12">80% rule threshold</text><line x1="20" y1="160" x2="580" y2="160" stroke="#344354"/><polyline points={points} fill="none" stroke="#68d6c6" strokeWidth="3"/></svg><p className="muted">Normal at 00:00 · Fault at 00:30 · Incident at 01:00 · Telemetry recovers at 01:30. The script repeats every two simulated minutes.</p><h4>Detection rule</h4><p>Pump stopped + water level ≥80% for 30 seconds, with no reading gap over 15 seconds. Recovery does not automatically resolve an incident.</p></article><article className="panel"><div className="panel-heading"><h3>Incident desk</h3><span className="badge">{open?'ACTION REQUIRED':'NO OPEN INCIDENT'}</span></div>{open?<><h4 className="amber">{open.id} / Pump stopped, high water</h4><p>Opened at {time(open.openedAt)} · Evidence: {open.evidence.waterLevel.toFixed(0)}% water level.</p><label htmlFor="note">Demo resolution note</label><textarea id="note" maxLength={500} rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe a fictional inspection or action…"/><button disabled={!note.trim()} onClick={resolve}>Resolve as demo operator</button><p className="muted">This records a session action only. It does not start or stop a pump.</p></>:<p className="empty">Advance seven readings to see the first incident, or start automatic playback.</p>}<h4>Recent incidents</h4><ul className="incidents">{s.incidents.slice(0,6).map(i=><li key={i.id}><span>{i.id}</span><span className={i.status==='open'?'amber':'muted'}>{i.status}</span></li>)}</ul></article></section><section className="panel"><div className="panel-heading"><h3>Session activity</h3><span className="muted">Latest first · Up to 60 events</span></div>{s.events.length?<ol className="timeline">{s.events.map((e,i)=><li key={`${version}-${i}`}><time>{time(e.time)}</time><span>{e.message}</span></li>)}</ol>:<p className="muted">No activity yet. Start the scenario to generate fictional readings.</p>}</section><footer>Built by Phanda Tech · Portfolio demonstration, not a safety or machinery-control system · PostgreSQL backend tests are separate from this browser demo.</footer></main></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
