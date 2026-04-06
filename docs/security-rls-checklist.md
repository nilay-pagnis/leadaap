# RLS and data isolation checklist (Enquireo)

Re-run this after schema changes. Every user-owned table should have **RLS enabled** and policies that scope rows to the workspace owner (`auth.uid()` or ownership via `forms.user_id` / `leads.user_id`).

## Tables with RLS (expected)

| Table | Notes |
|-------|--------|
| `profiles` | Users read/update own row; admin policies per [`supabase/rls_policies.sql`](../supabase/rls_policies.sql) |
| `forms` | Own `user_id` |
| `fields` | Via form ownership |
| `leads` | Own `user_id`; public insert policy for embedded forms if present |
| `lead_activities` | Via lead ownership |
| `notifications` | Select/update own `user_id`; inserts via service role only |
| `payments` | Own `user_id` (see [`supabase/payments.sql`](../supabase/payments.sql)) |
| `subscriptions` | No client policies — service role / admin reads only |
| `follow_ups` | Own `user_id` + lead ownership ([`supabase/follow_ups.sql`](../supabase/follow_ups.sql)) |

## Service role (bypasses RLS)

Used only on the server: public lead submit, cron follow-ups, admin actions, WhatsApp alerts, notification inserts. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Verification

In Supabase: **Table Editor → table → RLS enabled**. Spot-check policies match `auth.uid()`.

## Related

- API route expectations: [`docs/billing-qa.md`](billing-qa.md) (billing), middleware rate limits in [`src/middleware.ts`](../src/middleware.ts).
