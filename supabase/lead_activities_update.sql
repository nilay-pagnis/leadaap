-- Enquireo — allow updating note rows on lead_activities (inline edit in enquiry panel)
-- Run in Supabase SQL Editor after lead_activities.sql and rls_policies.sql (needs public.is_admin()).

drop policy if exists "lead_activities_update_own_notes" on public.lead_activities;
create policy "lead_activities_update_own_notes"
  on public.lead_activities for update
  using (
    type = 'note'
    and (
      public.is_admin()
      or exists (
        select 1 from public.leads l
        where l.id = lead_id and l.user_id = auth.uid()
      )
    )
  )
  with check (
    type = 'note'
    and (
      public.is_admin()
      or exists (
        select 1 from public.leads l
        where l.id = lead_id and l.user_id = auth.uid()
      )
    )
  );

drop policy if exists "lead_activities_update_admin" on public.lead_activities;
create policy "lead_activities_update_admin"
  on public.lead_activities for update
  using (public.is_admin())
  with check (public.is_admin());
