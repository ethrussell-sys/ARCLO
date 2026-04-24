alter table films add column if not exists tags text[] not null default '{}';
