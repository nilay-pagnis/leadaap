-- Payment link submissions (manual admin approval). Run after monetization.sql

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  plan text not null check (plan in ('starter', 'growth', 'premium')),
  amount_inr integer not null,
  payment_id text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payments_payment_id_key on public.payments (payment_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_status_idx on public.payments (status);

alter table public.payments enable row level security;

drop policy if exists "Users insert own payments" on public.payments;
create policy "Users insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own payments" on public.payments;
create policy "Users read own payments"
  on public.payments for select
  using (auth.uid() = user_id);
