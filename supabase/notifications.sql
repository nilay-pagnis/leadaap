-- Notifications + Realtime. Run in Supabase SQL Editor after leads/forms exist.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'lead',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users select own notifications" on public.notifications;
create policy "Users select own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Inserts only from service role / backend (submit-lead uses admin client).

-- Realtime (enable in Dashboard → Database → Replication if needed)
alter publication supabase_realtime add table public.notifications;
