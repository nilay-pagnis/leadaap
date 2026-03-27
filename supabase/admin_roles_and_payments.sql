-- Admin role on profiles + payments email + rejected status. Safe to re-run.

-- 1) profiles.role
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

-- 2) payments: rename user_email -> email, extend status
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'user_email'
  ) then
    alter table public.payments rename column user_email to email;
  end if;
end $$;

alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments
  add constraint payments_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- Promote your first admin (replace with your auth user id):
-- update public.profiles set role = 'admin' where id = 'YOUR_USER_UUID';
