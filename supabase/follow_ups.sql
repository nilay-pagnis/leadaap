-- Follow-up reminders per lead. Run after leads + notifications exist.

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  remind_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'notified', 'dismissed', 'completed')),
  note text,
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

create index if not exists follow_ups_lead_id_idx on public.follow_ups (lead_id);

create index if not exists follow_ups_user_pending_remind_idx
  on public.follow_ups (user_id, remind_at)
  where status = 'pending';

alter table public.follow_ups enable row level security;

drop policy if exists "follow_ups_select_own" on public.follow_ups;
create policy "follow_ups_select_own"
  on public.follow_ups for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "follow_ups_insert_own" on public.follow_ups;
create policy "follow_ups_insert_own"
  on public.follow_ups for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "follow_ups_update_own" on public.follow_ups;
create policy "follow_ups_update_own"
  on public.follow_ups for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "follow_ups_delete_own" on public.follow_ups;
create policy "follow_ups_delete_own"
  on public.follow_ups for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

-- Optional: enable row replication in Dashboard → Database → Replication if you want live follow-up rows in open clients.
alter publication supabase_realtime add table public.follow_ups;
