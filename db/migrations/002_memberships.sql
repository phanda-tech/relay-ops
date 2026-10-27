BEGIN;
CREATE TABLE relay.memberships (
 organisation text REFERENCES relay.organisations(id), subject text CHECK(length(trim(subject)) BETWEEN 1 AND 128),
 role text NOT NULL CHECK(role IN ('administrator','operator','technician')), active boolean NOT NULL DEFAULT true,
 PRIMARY KEY(organisation,subject)
);
CREATE TABLE relay.equipment_access (
 organisation text NOT NULL, asset text NOT NULL, subject text NOT NULL CHECK(length(trim(subject)) BETWEEN 1 AND 128),
 active boolean NOT NULL DEFAULT true, PRIMARY KEY(organisation,asset,subject),
 FOREIGN KEY(organisation,asset) REFERENCES relay.assets(organisation,id)
);
CREATE TABLE relay.assignments (
 organisation text NOT NULL, asset text NOT NULL, incident bigint NOT NULL, subject text NOT NULL,
 PRIMARY KEY(organisation,asset,incident),
 FOREIGN KEY(organisation,asset,incident) REFERENCES relay.incidents(organisation,asset,id),
 FOREIGN KEY(organisation,subject) REFERENCES relay.memberships(organisation,subject)
);
CREATE FUNCTION relay.ingest_as(p_subject text,p_org text,p_asset text,p_event text,p_time bigint,p_level numeric,p_running boolean)
RETURNS TABLE(outcome text,incident_id bigint) LANGUAGE plpgsql AS $$
BEGIN
 PERFORM 1 FROM relay.equipment_access WHERE organisation=p_org AND asset=p_asset AND subject=p_subject AND active FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT * FROM relay.ingest(p_org,p_asset,p_event,p_time,p_level,p_running);
END; $$;
CREATE FUNCTION relay.resolve_as(p_subject text,p_org text,p_asset text,p_note text) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE member_role text; open_id bigint;
BEGIN
 SELECT role INTO member_role FROM relay.memberships WHERE organisation=p_org AND subject=p_subject AND active FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 PERFORM 1 FROM relay.assets WHERE organisation=p_org AND id=p_asset FOR UPDATE;
 SELECT id INTO open_id FROM relay.incidents WHERE organisation=p_org AND asset=p_asset AND resolved_at IS NULL;
 IF member_role='technician' THEN
  PERFORM 1 FROM relay.assignments WHERE organisation=p_org AND asset=p_asset AND incident=open_id AND subject=p_subject FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 ELSIF member_role NOT IN ('administrator','operator') THEN
  RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
 END IF;
 RETURN relay.resolve_incident(p_org,p_asset,p_subject,p_note);
END; $$;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA relay FROM PUBLIC;
COMMIT;
