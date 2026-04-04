-- Subscription read-model: stays in sync with public.profiles (plan, credits).
-- Run in Supabase SQL Editor after monetization.sql.
-- Enables admin API to embed subscriptions(...) alongside profiles for one source of truth.

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan text not null,
  credits integer not null,
  status text not null default 'active'
    check (status in ('free', 'active', 'canceled')),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_plan_idx on public.subscriptions (plan);

alter table public.subscriptions enable row level security;

-- No policies: authenticated users do not read this table directly; service role bypasses RLS for admin.

create or replace function public.sync_subscription_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p text;
begin
  p := lower(trim(coalesce(nullif(trim(new.plan), ''), 'free')));
  insert into public.subscriptions (user_id, plan, credits, status, updated_at)
  values (
    new.id,
    coalesce(nullif(trim(new.plan), ''), 'free'),
    new.credits,
    case when p = 'free' then 'free' else 'active' end,
    coalesce(new.updated_at, now())
  )
  on conflict (user_id) do update set
    plan = excluded.plan,
    credits = excluded.credits,
    status = excluded.status,
    updated_at = excluded.updated_at;
  return new;
end;
$$;

drop trigger if exists trg_profiles_sync_subscriptions on public.profiles;
create trigger trg_profiles_sync_subscriptions
  after insert or update of plan, credits, updated_at on public.profiles
  for each row execute function public.sync_subscription_from_profile();

-- Backfill existing workspaces
insert into public.subscriptions (user_id, plan, credits, status, updated_at)
select
  p.id,
  coalesce(nullif(trim(p.plan), ''), 'free'),
  p.credits,
  case
    when lower(trim(coalesce(nullif(trim(p.plan), ''), 'free'))) = 'free' then 'free'
    else 'active'
  end,
  p.updated_at
from public.profiles p
on conflict (user_id) do update set
  plan = excluded.plan,
  credits = excluded.credits,
  status = excluded.status,
  updated_at = excluded.updated_at;
