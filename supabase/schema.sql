-- Enquireo — run in Supabase SQL Editor
-- Extensions
create extension if not exists "uuid-ossp";

-- forms
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  form_name text not null,
  created_at timestamptz not null default now()
);

-- fields (sort_order + options for select)
create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  label text not null,
  type text not null check (type in ('text', 'email', 'phone', 'textarea', 'select', 'checkbox')),
  required boolean not null default false,
  sort_order int not null default 0,
  options jsonb default '[]'::jsonb
);

create index if not exists fields_form_id_idx on public.fields (form_id);

-- leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_form_id_idx on public.leads (form_id);
create index if not exists leads_status_idx on public.leads (status);

-- RLS
alter table public.forms enable row level security;
alter table public.fields enable row level security;
alter table public.leads enable row level security;

-- forms policies
drop policy if exists "Users manage own forms" on public.forms;
create policy "Users manage own forms"
  on public.forms
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- fields policies (only for forms owned by user)
drop policy if exists "Users manage fields of own forms" on public.fields;
create policy "Users manage fields of own forms"
  on public.fields
  for all
  using (
    exists (
      select 1 from public.forms f
      where f.id = fields.form_id and f.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.forms f
      where f.id = fields.form_id and f.user_id = auth.uid()
    )
  );

-- leads policies (owner only; inserts from app use service role)
drop policy if exists "Users manage own leads" on public.leads;
create policy "Users manage own leads"
  on public.leads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
