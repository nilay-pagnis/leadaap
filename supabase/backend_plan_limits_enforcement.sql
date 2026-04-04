-- Backend enforcement for Enquireo plan limits.
-- Run in Supabase SQL editor after core schema + profiles are created.
--
-- Enforces limits at DB level (cannot be bypassed by client/UI):
-- 1) forms per user
-- 2) leads per user per calendar month (UTC)

create or replace function public.plan_limit_forms(p_plan text)
returns integer
language sql
immutable
as $$
  select case coalesce(lower(trim(p_plan)), 'free')
    when 'free' then 1
    when 'starter' then 2
    when 'growth' then 10
    when 'premium' then 1000000
    else 1
  end
$$;

create or replace function public.plan_limit_monthly_leads(p_plan text)
returns integer
language sql
immutable
as $$
  select case coalesce(lower(trim(p_plan)), 'free')
    when 'free' then 10
    when 'starter' then 100
    when 'growth' then 2000
    when 'premium' then 1000000
    else 10
  end
$$;

create or replace function public.enforce_form_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_limit integer;
  v_count integer;
begin
  select p.plan into v_plan
  from public.profiles p
  where p.id = new.user_id;

  v_limit := public.plan_limit_forms(v_plan);

  select count(*)::int into v_count
  from public.forms f
  where f.user_id = new.user_id;

  if v_count >= v_limit then
    raise exception 'Form limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_form_limit on public.forms;
create trigger trg_enforce_form_limit
before insert on public.forms
for each row
execute function public.enforce_form_limit();

create or replace function public.enforce_monthly_lead_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_limit integer;
  v_count integer;
  v_month_start timestamptz;
begin
  select p.plan into v_plan
  from public.profiles p
  where p.id = new.user_id;

  v_limit := public.plan_limit_monthly_leads(v_plan);
  v_month_start := date_trunc('month', now() at time zone 'UTC');

  select count(*)::int into v_count
  from public.leads l
  where l.user_id = new.user_id
    and l.created_at >= v_month_start;

  if v_count >= v_limit then
    raise exception 'Lead limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_monthly_lead_limit on public.leads;
create trigger trg_enforce_monthly_lead_limit
before insert on public.leads
for each row
execute function public.enforce_monthly_lead_limit();

