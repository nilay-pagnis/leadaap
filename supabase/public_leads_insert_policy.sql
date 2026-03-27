-- Optional: allow anon role to INSERT into leads (e.g. direct Supabase client from browser).
-- The Next.js route uses the service role and bypasses RLS; this policy enables future direct public inserts.
-- Review rate limiting / abuse before relying on this in production.

drop policy if exists "Allow public lead submission" on public.leads;

create policy "Allow public lead submission"
  on public.leads
  for insert
  to anon
  with check (true);
