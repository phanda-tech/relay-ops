BEGIN;
INSERT INTO relay.organisations VALUES('permission-a'),('permission-b');
INSERT INTO relay.assets(organisation,id) VALUES('permission-a','pump'),('permission-b','pump');
INSERT INTO relay.memberships VALUES('permission-a','operator','operator',true),('permission-a','tech','technician',true);
INSERT INTO relay.equipment_access VALUES('permission-a','pump','device',true);
DO $$ BEGIN
 BEGIN
  PERFORM relay.ingest_as('device','permission-b','pump','denied',0,90,false);
  RAISE EXCEPTION 'Cross-organisation ingestion allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
SELECT * FROM relay.ingest_as('device','permission-a','pump','e0',0,90,false);
SELECT * FROM relay.ingest_as('device','permission-a','pump','e1',10000,90,false);
SELECT * FROM relay.ingest_as('device','permission-a','pump','e2',20000,90,false);
SELECT * FROM relay.ingest_as('device','permission-a','pump','e3',30000,90,false);
UPDATE relay.equipment_access SET active=false WHERE subject='device';
DO $$ BEGIN
 BEGIN
  PERFORM relay.ingest_as('device','permission-a','pump','e4',40000,90,false);
  RAISE EXCEPTION 'Revoked equipment allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM relay.resolve_as('tech','permission-a','pump','Not assigned');
  RAISE EXCEPTION 'Unassigned technician allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM relay.resolve_as('operator','permission-b','pump','Wrong organisation');
  RAISE EXCEPTION 'Cross-organisation resolution allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
INSERT INTO relay.assignments(organisation,asset,incident,subject)
SELECT organisation,asset,id,'tech' FROM relay.incidents WHERE organisation='permission-a' AND resolved_at IS NULL;
UPDATE relay.memberships SET active=false WHERE subject='tech';
DO $$ BEGIN
 BEGIN
  PERFORM relay.resolve_as('tech','permission-a','pump','Revoked technician');
  RAISE EXCEPTION 'Revoked technician allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF (SELECT count(*) FROM relay.readings WHERE organisation='permission-a')<>4 THEN RAISE EXCEPTION 'Denied ingestion changed data'; END IF;
 IF (SELECT count(*) FROM relay.incident_activity)<>1 THEN RAISE EXCEPTION 'Denied resolution changed history'; END IF;
END; $$;
UPDATE relay.memberships SET active=true WHERE subject='tech';
SELECT relay.resolve_as('tech','permission-a','pump','Fictional assigned inspection');
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM relay.incidents WHERE organisation='permission-a' AND resolved_at IS NULL) THEN RAISE EXCEPTION 'Assigned resolution failed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM relay.incident_activity WHERE action='resolved' AND actor='tech') THEN RAISE EXCEPTION 'Actor not recorded'; END IF;
END; $$;
ROLLBACK;
