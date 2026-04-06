# API security overview

| Route | Auth | Rate limit (middleware) | Notes |
|-------|------|-------------------------|--------|
| `POST /api/public/submit-lead` | Public | 40/min per IP | Body max ~512KB; sanitize + plan caps |
| `GET /api/public/forms/[formId]` | Public | — | Metadata only; consider adding GET limits if abused |
| `POST /api/contact` | Public | 12/min per IP | No persistence in dev; wire email/storage in prod |
| `POST /api/payments/submit` | Session | 15/min per IP | Validates `pay_` pattern + plan enum |
| `POST /api/dashboard/leads/manual` | Session | — | Plan limits enforced |
| `POST /api/dashboard/notifications/lead-status` | Session | — | Lead ownership checked before notify |
| `GET/POST /api/cron/follow-ups` | `Authorization: Bearer CRON_SECRET` | — | No user context |

For production-scale abuse protection, replace in-memory limits with Redis (e.g. Upstash) — see [`src/lib/security/rate-limit.ts`](../src/lib/security/rate-limit.ts).
