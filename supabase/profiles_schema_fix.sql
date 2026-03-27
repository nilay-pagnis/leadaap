-- Run in Supabase SQL editor if profiles table exists but columns are missing
-- (safe to run multiple times)

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  add column if not exists credits integer not null default 10;

alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists company_name text;

alter table public.profiles
  add column if not exists job_title text;

alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

-- Ensure check constraint allows known plans (drop/recreate if migrating old DBs)
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'starter', 'growth', 'premium'));

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

alter table public.profiles
  drop column if exists trial_ends_at;

alter table public.profiles
  drop column if exists trial_used;

alter table public.profiles
  drop column if exists trial_status;
