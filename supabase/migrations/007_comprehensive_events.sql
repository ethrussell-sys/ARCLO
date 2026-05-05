-- Convert event_type from enum to text so any string event name is valid
alter table events alter column event_type type text using event_type::text;
drop type if exists event_type;

-- New columns for comprehensive tracking
alter table events
  add column if not exists film_slug   text,
  add column if not exists device_type text,
  add column if not exists referrer    text,
  add column if not exists metadata    jsonb;

-- Indexes for common admin queries
create index if not exists events_film_slug_idx  on events(film_slug);
create index if not exists events_event_type_idx on events(event_type);
create index if not exists events_metadata_gin   on events using gin(metadata);
