-- Run in Supabase SQL editor if profiles table exists but columns are missing
-- (safe to run multiple times)

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  add column if not exists credits integer not null default 10;

alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

-- Ensure check constraint allows known plans (drop/recreate if migrating old DBs)
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'trial', 'starter', 'growth'));

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));
