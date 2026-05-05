alter table purchases
  add column if not exists download_count integer not null default 0,
  add column if not exists download_limit integer not null default 5;
