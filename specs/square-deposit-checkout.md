# Spec: Square Sandbox Appointment Deposit Checkout

## Goal
Enable users to book an appointment and pay a deposit through Square sandbox, then confirm payment via webhook.

## Decision
Checkout route creates the `appointments` row first with `deposit_status = 'pending_payment'`, then redirects to Square.

## Flow
1. Frontend calls `POST /api/checkout` with `service_id`, `provider_id`, `user_id`, `appointment_date`, `appointment_time`.
2. Backend validates inputs, looks up service/provider, computes `service_price` and `deposit_amount`.
3. Backend creates appointment row with status `'pending_payment'`.
4. Backend creates Square Checkout session linked to `appointment_id`.
5. Backend returns `{ url: <Square checkout URL> }`.
6. User pays deposit via Square.
7. Square webhook calls `POST /api/webhooks/square`.
8. Webhook verifies signature, updates `deposit_status` to `'paid'`, sets `platform_fee`, `payout_amount`, and `status` to `'confirmed'`.

## Deposit and Fee Rules
- `deposit_amount` = `max(service_price * 0.20, 20.00)` USD.
- `platform_fee` = `service_price * 0.15` USD.
- `payout_amount` = `deposit_amount - platform_fee`.
- These rates are configurable via env vars `DEPOSIT_RATE`, `MIN_DEPOSIT_USD`, `PLATFORM_FEE_RATE`.

## Tables
- Extend `public.appointments` to add: `service_id`, `service_price`, `deposit_amount`, `deposit_status`, `platform_fee`, `payout_amount`, `platform`, `referral_id`.
- `services` and `provider_profiles` mirror GetUpLook structure (already partially present).

## Files
- `src/lib/square/checkout.ts` — Square Checkout API wrapper.
- `src/lib/square/webhooks.ts` — Webhook signature verification + handler.
- `src/lib/square/deposits.ts` — Deposit tracking utilities.
- `src/app/api/checkout/route.ts` — Create appointment + Square checkout.
- `src/app/api/webhooks/square/route.ts` — Handle Square webhooks.
- `src/lib/db/migrations/20260916_appointments_deposit_columns.sql` — Migration.

## Env Vars
- `SQUARE_ACCESS_TOKEN` — Square sandbox access token.
- `SQUARE_ENVIRONMENT` — `sandbox` or `production`.
- `SQUARE_WEBHOOK_SECRET` — Signature verification secret.
- `SQUARE_APPLICATION_ID` — Optional, for validation.
