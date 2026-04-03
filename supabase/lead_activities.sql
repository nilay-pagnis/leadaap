-- Enquireo — activity log per enquiry
-- Run in Supabase SQL Editor after schema.sql, rls_policies.sql (needs public.is_admin()), and leads table exist.
-- Append-only events: created (server), status_change, note (dashboard client)

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  type text not null check (type in ('created', 'status_change', 'note')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_activities_lead_created_idx
  on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities enable row level security;

drop policy if exists "lead_activities_select_own_or_admin" on public.lead_activities;
create policy "lead_activities_select_own_or_admin"
  on public.lead_activities for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

-- Dashboard: only status_change and note (created is inserted via service role / admin API)
drop policy if exists "lead_activities_insert_own_note_status" on public.lead_activities;
create policy "lead_activities_insert_own_note_status"
  on public.lead_activities for insert
  with check (
    type in ('status_change', 'note')
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "lead_activities_insert_admin" on public.lead_activities;
create policy "lead_activities_insert_admin"
  on public.lead_activities for insert
  with check (public.is_admin());
