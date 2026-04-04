-- Allow enquiries without a linked form (standalone manual entry).
-- Run in Supabase SQL Editor after schema.sql.

alter table public.leads
  alter column form_id drop not null;
