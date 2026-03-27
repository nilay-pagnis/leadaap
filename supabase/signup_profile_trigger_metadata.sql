-- Run in Supabase SQL Editor after profile_onboarding.sql (full_name, company_name, job_title columns).
-- Ensures profiles row gets display fields from auth.users.raw_user_meta_data on signup,
-- including when email confirmation is on (no client session yet).

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
