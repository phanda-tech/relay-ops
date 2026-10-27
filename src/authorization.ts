export type HumanRole = 'administrator' | 'operator' | 'technician';
export type Action = 'manage' | 'view' | 'acknowledge' | 'assign' | 'resolve' | 'ingest';
export type Principal =
 | { kind: 'human'; subject: string; organisation: string; role: HumanRole; active: boolean }
 | { kind: 'equipment'; subject: string; organisation: string; assets: readonly string[]; active: boolean };
export type Resource = { organisation: string; asset: string; assignedTo?: string };
export class Forbidden extends Error { constructor() { super('Forbidden'); this.name='Forbidden'; } }
export function authorize(principal: Principal | null, action: Action, resource: Resource): void {
 if (!principal || principal.active !== true || !principal.subject?.trim() || !principal.organisation?.trim() || !resource.organisation?.trim() || !resource.asset?.trim() || principal.organisation !== resource.organisation) throw new Forbidden();
 if (principal.kind === 'equipment') {
  if (action === 'ingest' && Array.isArray(principal.assets) && principal.assets.includes(resource.asset)) return;
  throw new Forbidden();
 }
 if (principal.kind !== 'human' || action === 'ingest') throw new Forbidden();
 if (principal.role === 'administrator' && ['manage','view','acknowledge','assign','resolve'].includes(action)) return;
 if (principal.role === 'operator' && ['view','acknowledge','assign','resolve'].includes(action)) return;
 if (principal.role === 'technician' && resource.assignedTo === principal.subject && ['view','resolve'].includes(action)) return;
 throw new Forbidden();
}
