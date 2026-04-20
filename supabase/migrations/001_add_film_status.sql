-- Run this in the Supabase SQL editor
alter table films add column if not exists status text not null default 'pending';
alter table films add column if not exists contact_email text;
