-- Admin RPC: monthly leads used / limit by user.
-- Intended for server-side admin dashboards (service-role client).
-- Uses profiles.plan and current UTC month for usage.

create or replace function public.admin_monthly_lead_usage()
returns table (
  user_id uuid,
  monthly_leads_used bigint,
  monthly_lead_limit integer
)
language sql
security definer
set search_path = public
as $$
  with prof as (
    select
      p.id as user_id,
      case lower(trim(coalesce(p.plan, 'free')))
        when 'free' then 10
        when 'starter' then 100
        when 'growth' then 2000
        when 'premium' then 1000000
        else 10
      end as monthly_lead_limit
    from public.profiles p
  ),
  usage as (
    select
      l.user_id,
      count(*)::bigint as monthly_leads_used
    from public.leads l
    where l.created_at >= date_trunc('month', now() at time zone 'UTC')
    group by l.user_id
  )
  select
    prof.user_id,
    coalesce(usage.monthly_leads_used, 0) as monthly_leads_used,
    prof.monthly_lead_limit
  from prof
  left join usage on usage.user_id = prof.user_id
  order by prof.user_id;
$$;

