-- Callable only when the current JWT user is an admin (profiles.role = 'admin').
-- Run after rls_policies.sql and admin_roles_and_payments.sql

create or replace function public.increment_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_user_id is null then
    raise exception 'invalid user';
  end if;
  if p_amount is null or p_amount = 0 then
    return;
  end if;
  if abs(p_amount) > 1000000 then
    raise exception 'amount out of range';
  end if;

  update public.profiles
  set
    credits = greatest(0, credits + p_amount),
    updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'profile not found';
  end if;
end;
$$;

grant execute on function public.increment_credits(uuid, integer) to authenticated;
