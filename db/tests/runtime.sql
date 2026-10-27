BEGIN;
INSERT INTO relay.organisations VALUES('runtime-a'),('runtime-b');
INSERT INTO relay.assets(organisation,id) VALUES('runtime-a','pump'),('runtime-b','pump');
INSERT INTO relay.memberships VALUES('runtime-a','operator','operator',true);
INSERT INTO relay.equipment_access VALUES('runtime-a','pump','device',true);
SET LOCAL ROLE relay_runtime;
DO $$ BEGIN
 IF current_user<>'relay_runtime' THEN RAISE EXCEPTION 'Wrong runtime role'; END IF;
 BEGIN
  PERFORM * FROM relay.memberships;
  RAISE EXCEPTION 'Direct membership read allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE relay.memberships SET role='administrator';
  RAISE EXCEPTION 'Membership escalation allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO relay.readings VALUES('runtime-a','pump','bypass',0,90,false);
  RAISE EXCEPTION 'Direct telemetry write allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM relay.ingest('runtime-a','pump','bypass',0,90,false);
  RAISE EXCEPTION 'Unguarded ingestion allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM relay.resolve_incident('runtime-a','pump','fake','bypass');
  RAISE EXCEPTION 'Unguarded resolution allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM relay.ingest_as('device','runtime-b','pump','cross-org',0,90,false);
  RAISE EXCEPTION 'Cross-organisation guarded write allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
SELECT * FROM relay.ingest_as('device','runtime-a','pump','e0',0,90,false);
SELECT * FROM relay.ingest_as('device','runtime-a','pump','e1',10000,90,false);
SELECT * FROM relay.ingest_as('device','runtime-a','pump','e2',20000,90,false);
SELECT * FROM relay.ingest_as('device','runtime-a','pump','e3',30000,90,false);
SELECT relay.resolve_as('operator','runtime-a','pump','Fictional runtime check');
RESET ROLE;
DO $$ BEGIN
 IF (SELECT count(*) FROM relay.readings WHERE organisation='runtime-a')<>4 THEN RAISE EXCEPTION 'Guarded ingestion failed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM relay.incidents WHERE organisation='runtime-a' AND resolved_at IS NOT NULL) THEN RAISE EXCEPTION 'Guarded resolution failed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM relay.incident_activity WHERE action='resolved' AND actor='operator') THEN RAISE EXCEPTION 'Missing resolution history'; END IF;
END; $$;
ROLLBACK;
