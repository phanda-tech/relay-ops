BEGIN;
INSERT INTO relay.organisations VALUES('test-a'),('test-b');
INSERT INTO relay.assets(organisation,id) VALUES('test-a','pump-1'),('test-b','pump-1');
SELECT * FROM relay.ingest('test-a','pump-1','e0',0,90,false);
SELECT * FROM relay.ingest('test-a','pump-1','e1',10000,90,false);
SELECT * FROM relay.ingest('test-a','pump-1','e2',20000,90,false);
SELECT * FROM relay.ingest('test-a','pump-1','e3',30000,90,false);
DO $$ BEGIN
 IF (SELECT count(*) FROM relay.incidents WHERE organisation='test-a' AND resolved_at IS NULL) <> 1 THEN RAISE EXCEPTION 'Expected one incident'; END IF;
 IF (SELECT outcome FROM relay.ingest('test-a','pump-1','e3',30000,90,false)) <> 'duplicate' THEN RAISE EXCEPTION 'Expected duplicate'; END IF;
 BEGIN
  PERFORM relay.ingest('test-a','pump-1','e3',30000,91,false);
  RAISE EXCEPTION 'Conflict accepted';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Event ID payload conflict' THEN RAISE; END IF;
 END;
 IF (SELECT count(*) FROM relay.readings) <> 4 THEN RAISE EXCEPTION 'Unexpected reading count'; END IF;
 IF EXISTS(SELECT 1 FROM relay.incidents WHERE organisation='test-b') THEN RAISE EXCEPTION 'Unexpected cross-organisation incident'; END IF;
END; $$;
SELECT relay.resolve_incident('test-a','pump-1','demo-operator','Simulated inspection completed');
DO $$ BEGIN
 IF (SELECT count(*) FROM relay.incident_activity) <> 2 THEN RAISE EXCEPTION 'Expected open and resolve history'; END IF;
 IF EXISTS(SELECT 1 FROM relay.incidents WHERE resolved_at IS NULL) THEN RAISE EXCEPTION 'Resolution failed'; END IF;
 BEGIN
  UPDATE relay.incident_activity SET note='modified';
  RAISE EXCEPTION 'History modification accepted';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Activity history cannot be updated or deleted' THEN RAISE; END IF;
 END;
END; $$;
COMMIT;
