-- Profile onboarding: display name + optional workspace fields (run in Supabase SQL editor)

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists company_name text;

alter table public.profiles
  add column if not exists job_title text;

comment on column public.profiles.full_name is 'Display name; set at signup from user metadata or settings.';
comment on column public.profiles.company_name is 'Optional organization name.';
comment on column public.profiles.job_title is 'Optional job title (not the same as profiles.role admin flag).';
