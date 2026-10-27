export type Reading = { id: string; organisation: string; asset: string; timestamp: number; waterLevel: number; pumpRunning: boolean };
export type Incident = { id: string; organisation: string; asset: string; openedAt: number; evidence: Reading; status: 'open' | 'resolved' };
type State = { lastTimestamp: number; since?: number; incident?: Incident; seen: Set<string> };
export class AlertEngine {
  private states = new Map<string, State>();
  private sequence = 0;
  constructor(private threshold = 80, private durationMs = 30000, private maxGapMs = 15000) {
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100 || !Number.isFinite(durationMs) || durationMs <= 0 || !Number.isFinite(maxGapMs) || maxGapMs <= 0) throw new Error('Invalid rule configuration');
  }
  ingest(input: unknown): { outcome: 'accepted' | 'duplicate'; incident?: Incident } {
    const r = input as Reading;
    if (!r || typeof r !== 'object' || ![r.id,r.organisation,r.asset].every(v => typeof v === 'string' && v.trim().length > 0 && v.length <= 128) || !Number.isSafeInteger(r.timestamp) || r.timestamp < 0 || !Number.isFinite(r.waterLevel) || r.waterLevel < 0 || r.waterLevel > 100 || typeof r.pumpRunning !== 'boolean') throw new Error('Invalid telemetry');
    const key = JSON.stringify([r.organisation,r.asset]);
    const state = this.states.get(key) ?? { lastTimestamp: -1, seen: new Set<string>() };
    if (state.seen.has(r.id)) return { outcome: 'duplicate' };
    if (r.timestamp <= state.lastTimestamp) throw new Error('Out-of-order telemetry');
    if (r.timestamp - state.lastTimestamp > this.maxGapMs) state.since = undefined;
    state.lastTimestamp = r.timestamp;
    state.seen.add(r.id);
    if (r.waterLevel >= this.threshold && !r.pumpRunning) {
      state.since ??= r.timestamp;
      if (!state.incident && r.timestamp - state.since >= this.durationMs) {
        state.incident = { id: `incident-${++this.sequence}`, organisation: r.organisation, asset: r.asset, openedAt: r.timestamp, evidence: { ...r }, status: 'open' };
        this.states.set(key,state);
        return { outcome: 'accepted', incident: structuredClone(state.incident) };
      }
    } else state.since = undefined;
    this.states.set(key,state);
    return { outcome: 'accepted' };
  }
  resolve(organisation: string, asset: string): Incident {
    const state = this.states.get(JSON.stringify([organisation,asset]));
    if (!state?.incident) throw new Error('No open incident');
    const resolved: Incident = { ...structuredClone(state.incident), status: 'resolved' };
    state.incident = undefined;
    state.since = undefined;
    return resolved;
  }
}
