-- Enable Realtime on leads so the dashboard inbox volume chart can subscribe to INSERTs.
-- Run in Supabase SQL Editor (Database → Replication may also list tables).
-- Safe to run once; if the table is already in the publication, you may see a harmless notice.

alter publication supabase_realtime add table public.leads;
