-- LeadAap monetization — run after schema.sql
-- Profiles: plan, credits, trial window

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free'
    check (plan in ('free', 'trial', 'starter', 'growth')),
  credits integer not null default 10,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_plan_idx on public.profiles (plan);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists job_title text;

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- New signups get Free plan + 10 credits; copy name fields from auth user_metadata (signup OAuth)
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn text;
  cn text;
  jt text;
begin
  fn := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        ''
      )
    ),
    ''
  );
  cn := nullif(trim(coalesce(new.raw_user_meta_data->>'company_name', '')), '');
  jt := nullif(trim(coalesce(new.raw_user_meta_data->>'job_title', '')), '');

  insert into public.profiles (id, plan, credits, trial_ends_at, full_name, company_name, job_title)
  values (new.id, 'free', 10, null, fn, cn, jt)
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    company_name = coalesce(excluded.company_name, profiles.company_name),
    job_title = coalesce(excluded.job_title, profiles.job_title),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
