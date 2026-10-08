# Appointment Scheduling System — Implementation Spec

## Decisions (from request)
- Deposits use Square (SDK already in `package.json`).
- `provider_profiles` and `services` tables already exist from GetUpLook.
- Filter providers to non-physicians only: `provider_type IN ('esthetician', 'injector_np_pa', 'medical_esthetician')`.
- Exclude physicians (`dermatologist`, `plastic_surgeon`) with "Physician bookings coming soon".
- Add `referral_id` and `platform` columns to `appointments`.

## Capability Map
1. **Schema additions** — add `provider_profiles`, `services`, `appointments.referral_id`, `appointments.platform`.
2. **Provider list / filter** — query non-physician providers with services.
3. **Availability API** — public read of provider slots for next 14 days, excluding Google Calendar busy + booked appointments.
4. **Square deposit checkout** — server route creates Square Checkout link for 20% deposit.
5. **Appointment creation API** — create appointment after Square payment, with status lifecycle, platform, and referral linkage.
6. **Booking page** — `/book/[provider_id]`: profile, services, price, deposit, slot selection, Square checkout.
7. **Confirmation page** — `/book/confirmation`: show appointment summary from Square/SKINgenius.

## Routes & Files
| Path | File | Purpose |
|------|------|---------|
| `/api/v1/providers` | `src/app/api/v1/providers/route.ts` | List non-physician providers with services |
| `/api/v1/providers/[id]/availability` | `src/app/api/v1/providers/[id]/availability/route.ts` | Available slots for provider |
| `/api/v1/appointments` | `src/app/api/v1/appointments/route.ts` | Create appointment after Square payment (modify existing) |
| `/api/v1/checkout/square` | `src/app/api/v1/checkout/square/route.ts` | Create Square Checkout session for deposit |
| `/api/v1/checkout/square/callback` | `src/app/api/v1/checkout/square/callback/route.ts` | Square redirect success/cancel |
| `/book` | `src/app/book/page.tsx` | Provider list / landing |
| `/book/[provider_id]` | `src/app/book/[provider_id]/page.tsx` | Provider booking page |
| `/book/confirmation` | `src/app/book/confirmation/page.tsx` | Confirmation page |
| `src/lib/booking/` | `square.ts`, `providers.ts`, `types.ts` | Shared booking helpers |

## Data Model
### `provider_profiles` (new table)
- `id uuid primary key`
- `user_id uuid references auth.users`
- `business_name text`
- `provider_type text` check: `('esthetician','injector_np_pa','medical_esthetician','dermatologist','plastic_surgeon')`
- `bio text`, `avatar_url text`, `address text`, `phone text`
- `created_at`, `updated_at`

### `services` (new table)
- `id uuid primary key`
- `provider_id uuid references provider_profiles`
- `name text`
- `description text`
- `price decimal(10,2)`
- `duration_minutes int`
- `created_at`, `updated_at`

### `appointments` (modify existing)
- Add `referral_id uuid`
- Add `platform text` check: `('skingenius','getuplook')` default `'skingenius'`
- Add `deposit_amount decimal(10,2)`
- Add `square_payment_id text`
- Add `service_id uuid references services`

## Square Checkout Flow
1. User selects service + slot on `/book/[provider_id]`.
2. POST `/api/v1/checkout/square` with `provider_id`, `service_id`, `slot_start`, `slot_end`, `referral_id`.
3. Server creates temporary pending appointment row or stores intent in session/cookie.
4. Square Checkout created with deposit amount (20%), redirect URLs.
5. On success callback, verify payment, update/create appointment with status `pending`.
6. POST `/api/v1/appointments` may also be used by webhook/callback to finalize.

## Status Lifecycle
- `pending` — deposit paid, not yet confirmed
- `confirmed` — provider accepted
- `completed` — service rendered
- `cancelled` — cancelled/no-show

## Verification
- `npm run build` must pass.
- TypeScript errors must be zero.

## Rollout Notes
- Square credentials (`SQUARE_APPLICATION_ID`, `SQUARE_ACCESS_TOKEN`, `SQUARE_ENVIRONMENT`) must be added to env before production.
- Google Calendar connection must exist on provider for availability to include live busy times.
