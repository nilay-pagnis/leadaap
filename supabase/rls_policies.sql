-- LeadAap — strict RLS + admin bypass via public.is_admin()
-- Run after schema.sql, monetization.sql, payments.sql, and admin_roles_and_payments.sql

-- Helper: reads profiles with SECURITY DEFINER (bypasses RLS — no recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and coalesce(role, 'user') = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- ---------- profiles ----------
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ---------- forms ----------
drop policy if exists "Users manage own forms" on public.forms;
drop policy if exists "forms_all_own_or_admin" on public.forms;

create policy "forms_all_own_or_admin"
  on public.forms for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ---------- fields ----------
drop policy if exists "Users manage fields of own forms" on public.fields;
drop policy if exists "fields_all_own_or_admin" on public.fields;

create policy "fields_all_own_or_admin"
  on public.fields for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.forms f
      where f.id = fields.form_id and f.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.forms f
      where f.id = fields.form_id and f.user_id = auth.uid()
    )
  );

-- ---------- leads ----------
drop policy if exists "Users manage own leads" on public.leads;
drop policy if exists "leads_all_own_or_admin" on public.leads;

create policy "leads_all_own_or_admin"
  on public.leads for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ---------- payments ----------
drop policy if exists "Users insert own payments" on public.payments;
drop policy if exists "Users read own payments" on public.payments;
drop policy if exists "payments_insert_own" on public.payments;
drop policy if exists "payments_select_own_or_admin" on public.payments;
drop policy if exists "payments_update_admin" on public.payments;

create policy "payments_insert_own"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "payments_select_own_or_admin"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "payments_update_admin"
  on public.payments for update
  using (public.is_admin())
  with check (public.is_admin());
