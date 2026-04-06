# Billing QA matrix (Enquireo)

Manual Razorpay Payment Link flow: user pays → submits `pay_*` on `/dashboard/billing/confirm` → row in `payments` (`pending`) → admin approves or rejects → `profiles.plan` / `credits` update on approve; `subscriptions` syncs via DB trigger on `profiles`.

## User flows

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Payment success (submit) | Choose plan → Razorpay link → pay → paste valid `pay_` → submit | 200, toast success, `payments` row `pending`, Billing shows pending banner |
| 2 | Duplicate Payment ID | Submit same `pay_` twice | 409, error message |
| 3 | Invalid plan | POST with invalid `plan` | 400 |
| 4 | Malformed Payment ID | Empty or not matching `pay_*` | 400 |
| 5 | Unauthenticated submit | POST without session | 401 |
| 6 | Refresh on confirm | Reload `/dashboard/billing/confirm?plan=growth` | Plan prefill from query / `localStorage` (`enquireo:selectedPlan`) |
| 7 | Second upgrade while paid | User on paid plan, submits new payment | New `pending` row allowed; admin approves to change plan |

## Admin flows

| # | Scenario | Expected |
|---|----------|----------|
| 8 | Approve pending | `payments.status` → `approved`, `profiles.plan`/`credits` match plan, subscription read-model updated |
| 9 | Reject pending | `payments.status` → `rejected`, profile unchanged |
| 10 | Double approve | Error: already processed |
| 11 | Approve with profile failure | Profile update fails → payment stays `pending` (profile-first order); if payment row update fails after profile update, profile is reverted and error returned |

## Edge cases

| # | Notes |
|---|--------|
| A | No Razorpay webhook: “failed webhook” N/A until webhooks are implemented |
| B | Approve action uses profile-first + revert on payment row failure to avoid stuck `approved` without plan change |
| C | Source of truth for entitlements: `profiles` (+ `getUsageForUser`); `subscriptions` is reporting read-model |

## Rate limits (production)

See middleware: public `POST` routes are IP rate-limited; `/api/payments/submit` is limited per IP (tune env if needed).
