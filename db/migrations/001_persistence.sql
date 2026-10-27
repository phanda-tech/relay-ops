BEGIN;
CREATE SCHEMA relay;
CREATE TABLE relay.organisations (id text PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 128));
CREATE TABLE relay.assets (
 organisation text REFERENCES relay.organisations(id), id text CHECK (length(id) BETWEEN 1 AND 128),
 last_timestamp bigint, abnormal_since bigint,
 PRIMARY KEY (organisation,id)
);
CREATE TABLE relay.readings (
 organisation text NOT NULL, asset text NOT NULL, event_id text NOT NULL CHECK (length(event_id) BETWEEN 1 AND 128),
 timestamp_ms bigint NOT NULL CHECK (timestamp_ms BETWEEN 0 AND 9007199254740991),
 water_level numeric NOT NULL CHECK (water_level >= 0 AND water_level <= 100),
 pump_running boolean NOT NULL,
 PRIMARY KEY (organisation,asset,event_id),
 UNIQUE (organisation,asset,timestamp_ms),
 FOREIGN KEY (organisation,asset) REFERENCES relay.assets(organisation,id)
);
CREATE TABLE relay.incidents (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, organisation text NOT NULL, asset text NOT NULL,
 evidence_event text NOT NULL, opened_at bigint NOT NULL, resolved_at timestamptz,
 UNIQUE (organisation,asset,id),
 FOREIGN KEY (organisation,asset,evidence_event) REFERENCES relay.readings(organisation,asset,event_id)
);
CREATE UNIQUE INDEX one_open_incident ON relay.incidents(organisation,asset) WHERE resolved_at IS NULL;
CREATE TABLE relay.incident_activity (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, incident bigint NOT NULL REFERENCES relay.incidents(id),
 action text NOT NULL CHECK (action IN ('opened','resolved')),
 actor text NOT NULL CHECK (length(trim(actor)) BETWEEN 1 AND 128),
 note text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE FUNCTION relay.protect_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Activity history cannot be updated or deleted'; END; $$;
CREATE TRIGGER immutable_activity BEFORE UPDATE OR DELETE ON relay.incident_activity
FOR EACH ROW EXECUTE FUNCTION relay.protect_history();
CREATE FUNCTION relay.ingest(p_org text,p_asset text,p_event text,p_time bigint,p_level numeric,p_running boolean)
RETURNS TABLE(outcome text,incident_id bigint) LANGUAGE plpgsql AS $$
DECLARE a relay.assets%ROWTYPE; previous relay.readings%ROWTYPE; created bigint;
BEGIN
 IF p_event IS NULL OR length(trim(p_event)) NOT BETWEEN 1 AND 128 OR p_time IS NULL OR p_time NOT BETWEEN 0 AND 9007199254740991 OR p_level IS NULL OR NOT (p_level >= 0 AND p_level <= 100) OR p_running IS NULL THEN
  RAISE EXCEPTION 'Invalid telemetry';
 END IF;
 SELECT * INTO a FROM relay.assets WHERE organisation=p_org AND id=p_asset FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown asset'; END IF;
 SELECT * INTO previous FROM relay.readings WHERE organisation=p_org AND asset=p_asset AND event_id=p_event;
 IF FOUND THEN
  IF previous.timestamp_ms IS DISTINCT FROM p_time OR previous.water_level IS DISTINCT FROM p_level OR previous.pump_running IS DISTINCT FROM p_running THEN
   RAISE EXCEPTION 'Event ID payload conflict';
  END IF;
  RETURN QUERY SELECT 'duplicate'::text,NULL::bigint; RETURN;
 END IF;
 IF a.last_timestamp IS NOT NULL AND p_time <= a.last_timestamp THEN RAISE EXCEPTION 'Out-of-order telemetry'; END IF;
 IF a.last_timestamp IS NULL OR p_time-a.last_timestamp > 15000 THEN a.abnormal_since := NULL; END IF;
 INSERT INTO relay.readings VALUES(p_org,p_asset,p_event,p_time,p_level,p_running);
 IF p_level >= 80 AND NOT p_running THEN
  a.abnormal_since := coalesce(a.abnormal_since,p_time);
  IF p_time-a.abnormal_since >= 30000 THEN
   INSERT INTO relay.incidents(organisation,asset,evidence_event,opened_at)
   VALUES(p_org,p_asset,p_event,p_time)
   ON CONFLICT (organisation,asset) WHERE resolved_at IS NULL DO NOTHING RETURNING id INTO created;
   IF created IS NOT NULL THEN
    INSERT INTO relay.incident_activity(incident,action,actor,note) VALUES(created,'opened','rule-engine','Pump stopped with sustained water level >= 80%');
   END IF;
  END IF;
 ELSE a.abnormal_since := NULL; END IF;
 UPDATE relay.assets SET last_timestamp=p_time,abnormal_since=a.abnormal_since WHERE organisation=p_org AND id=p_asset;
 RETURN QUERY SELECT 'accepted'::text,created;
END; $$;
CREATE FUNCTION relay.resolve_incident(p_org text,p_asset text,p_actor text,p_note text) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE resolved bigint;
BEGIN
 IF p_actor IS NULL OR length(trim(p_actor)) NOT BETWEEN 1 AND 128 OR p_note IS NULL OR length(trim(p_note)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Actor and resolution note required'; END IF;
 PERFORM 1 FROM relay.assets WHERE organisation=p_org AND id=p_asset FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown asset'; END IF;
 UPDATE relay.incidents SET resolved_at=clock_timestamp() WHERE organisation=p_org AND asset=p_asset AND resolved_at IS NULL RETURNING id INTO resolved;
 IF resolved IS NULL THEN RAISE EXCEPTION 'No open incident'; END IF;
 UPDATE relay.assets SET abnormal_since=NULL WHERE organisation=p_org AND id=p_asset;
 INSERT INTO relay.incident_activity(incident,action,actor,note) VALUES(resolved,'resolved',p_actor,p_note);
 RETURN resolved;
END; $$;
REVOKE ALL ON SCHEMA relay FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA relay FROM PUBLIC;
COMMIT;
