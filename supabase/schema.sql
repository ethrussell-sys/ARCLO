-- Films
create table films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  director text,
  year integer,
  price numeric(10,2) not null default 1.99,
  trailer_url text,
  file_key text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

-- Purchases
create table purchases (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references films(id) on delete restrict,
  email text not null,
  stripe_payment_id text not null unique,
  download_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index purchases_email_idx on purchases(email);
create index purchases_film_id_idx on purchases(film_id);

-- Events
create type event_type as enum (
  'trailer_play',
  'page_view',
  'checkout_start',
  'purchase_complete'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  film_id uuid references films(id) on delete set null,
  event_type event_type not null,
  created_at timestamptz not null default now()
);

create index events_film_id_idx on events(film_id);
create index events_session_id_idx on events(session_id);
create index events_event_type_idx on events(event_type);
