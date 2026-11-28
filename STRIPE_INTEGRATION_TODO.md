# Stripe Checkout – remaining setup

This is the single source of truth for what is left to do before card payments go live on niraypcfgallery.com.

## Values to Replace

No placeholder values remain. The existing Checkout Session call already uses real values, and they were kept as they are:

**Files containing the Checkout Session call:**
- [app/api/checkout/route.ts](app/api/checkout/route.ts)

| Field | Current Value | Notes |
|-------|--------------|-------|
| mode | `payment` | One-time purchase (correct for SGD 15 components and SGD 250 packs). |
| success_url | `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}` | Real page. `SITE_URL` defaults to `https://www.niraypcfgallery.com`. |
| cancel_url | `${SITE_URL}/checkout` | Real page (back to the basket). |
| line_items | Built from the basket with inline `price_data` (SGD, 1500 cents per component, 25000 cents per pack, from `PRICE` in `lib/catalog.ts`) | No Stripe Price IDs are needed. Prices change in `lib/catalog.ts`. |

Also kept (not part of Checkout Studio, but needed): `client_reference_id` and `metadata.cart`. The webhook uses `metadata.cart` to find the basket and create the order, so removing them would stop orders being fulfilled.

## Configured Parameters

These parameters were configured in Checkout Studio and are now set in the call.

**Files containing these parameters:**
- [app/api/checkout/route.ts](app/api/checkout/route.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | `hosted_page` |
| billing_address_collection | `auto` |
| phone_number_collection | `{ enabled: false }` |
| automatic_tax | `{ enabled: false }` |
| allow_promotion_codes | `true` (changed Nov 28 2026 at the owner's request; create codes in Stripe → Product catalogue → Coupons) |
| submit_type | `auto` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |

`payment_method_collection` (`always`) was not added, because it only applies when `mode` is `subscription`.

### ui_mode and API version

This project calls Stripe's REST API directly (`lib/server/stripe.ts`), with no Stripe SDK and no `Stripe-Version` header, so the account's default API version applies. `hosted_page` is the value for newer API versions (equivalent to SDK 21.0.0+). If a test checkout fails with an error about `ui_mode`, change it to `hosted` in `app/api/checkout/route.ts`. Likewise, if Stripe reports `integration_identifier` or `origin_context` as an unknown parameter on your account's API version, remove that line.

## Setup

Set these in Vercel (project for niraypcfgallery.com, Production and Preview). Never commit them.

| Variable | Where to get it |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys (`sk_test_...` for testing, `sk_live_...` for live). |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Workbench → Webhooks → add endpoint `https://www.niraypcfgallery.com/api/stripe/webhook` with events `checkout.session.completed` and `checkout.session.async_payment_succeeded`, then copy the signing secret (`whsec_...`). |
| `SITE_URL` | Optional. Defaults to `https://www.niraypcfgallery.com`. |

Checkout also stays closed until Cloudflare R2 is configured (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`), and orders need Redis and Resend (`RESEND_API_KEY`). No publishable key is needed: the browser is redirected to the Stripe-hosted page.

No new files, routes or dependencies were added apart from this document.

## How it works

1. The buyer adds components or packs to the basket and presses Pay on `/checkout`.
2. `POST /api/checkout` checks the items, saves the basket in Redis and creates a Checkout Session, then returns `session.url`.
3. The browser goes to the Stripe-hosted payment page.
4. After payment, Stripe sends `checkout.session.completed` to `/api/stripe/webhook`, which verifies the signature, creates the order and emails the secure download link.
5. The buyer lands on `/checkout/success`.

## Testing

Use test-mode keys first. Test cards (any future expiry, any CVC, any postcode):

- `4242 4242 4242 4242` – succeeds
- `4000 0025 0000 3155` – asks for 3D Secure
- `4000 0000 0000 9995` – declined (insufficient funds)

Check that the order email arrives and the download link works, then switch both Stripe variables to live values.

## Next steps

- Change prices in `PRICE` in `lib/catalog.ts` if needed.
- Watch payments in the Stripe Dashboard; orders are also kept in Redis and can be re-sent from `/orders`.

## Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp
