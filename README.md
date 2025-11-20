## Textopsy (Next.js + SSR)

This repo hosts the server-rendered Textopsy experience. The previous Vite SPA has been migrated into the Next.js App Router so that:

- All AI inference happens on the server (`app/api/analyze/route.ts`), keeping API keys private.
- The UI renders via SSR/ISR-friendly components while still hydrating interactive pieces on the client.
- A PostgreSQL connection can be injected through `DATABASE_URL` whenever persistence is needed.

## Requirements

- Node 18.18+ (Next.js 16 requirement)
- pnpm (preferred package manager for this project)
- Environment variables:
  - `GOOGLE_GENAI_API_KEY` (or legacy `API_KEY`) for Gemini access
  - `DATABASE_URL` pointing to your PostgreSQL instance
  - `DATABASE_DIRECT_URL` (optional) - Direct connection URL for drizzle-kit operations (use if DATABASE_URL is proxied/serverless)
  - `JWT_SECRET` for authentication token signing (use a strong random string in production)
  - `PAYSTACK_SECRET_KEY` for initializing/confirming Paystack transactions
  - `PAYSTACK_CALLBACK_URL` or `NEXT_PUBLIC_APP_URL` so Paystack can redirect back (defaults to `${NEXT_PUBLIC_APP_URL}/paystack/callback`)
  - `PAYSTACK_PRO_AMOUNT_MINOR` (optional, defaults to `500`) - amount charged for Pro in the selected currency's minor units (e.g. cents). Legacy `PAYSTACK_PRO_AMOUNT_KOBO` is still supported for NGN.
  - `PAYSTACK_CURRENCY` (optional, defaults to `USD` unless `PAYSTACK_PRO_AMOUNT_KOBO` is provided) - ISO currency code sent to Paystack.
  - `PAYSTACK_PLAN_CODE` (optional) - Paystack plan code if you manage subscriptions inside Paystack
- `PRO_MAX_CREDITS_PER_MONTH` (optional, defaults to `200`) - per-Pro-user monthly credit cap
- `ADMIN_DASHBOARD_TOKEN` - shared secret for the `/admin` dashboard + `/api/admin/credits`
  - `FREE_PLAN_MAX_CONVERSATIONS` / `FREE_PLAN_MAX_SUBMISSIONS_PER_DAY` (optional overrides for freemium limits)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` (`true`/`false`) for outbound email
  - `EMAIL_FROM_ADDRESS` (e.g. `Textopsy <hello@textopsy.com>`) and optional `EMAIL_REPLY_TO`
- `EMAIL_VERIFICATION_TOKEN_TTL_HOURS` (defaults to `24`) – how long verification links remain valid
- `EMAIL_VERIFICATION_SUCCESS_REDIRECT` / `EMAIL_VERIFICATION_ERROR_REDIRECT` (optional overrides for the verification landing page, defaults to `${NEXT_PUBLIC_APP_URL}/verify-email?...`)
- `BILLING_ALERT_EMAIL` to receive internal auto-renew notifications
- `CRON_SECRET` bearer token required by `/api/billing/renewals/reminders`

Create an `.env.local` file:

```bash
GOOGLE_GENAI_API_KEY=your-key-here
DATABASE_URL=postgres://user:password@host:5432/textopsy
# Optional: Use direct URL for drizzle-kit if DATABASE_URL is proxied
# DATABASE_DIRECT_URL=postgres://user:password@host:5432/textopsy
JWT_SECRET=your-secret-key-change-in-production
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-smtp-password
SMTP_SECURE=false
EMAIL_FROM_ADDRESS="Textopsy <notifications@textopsy.com>"
BILLING_ALERT_EMAIL=billing@textopsy.com
```

### Email + Notifications

- Email templates live in `lib/email/templates.ts` as inline HTML/text builders.
- `lib/email/index.ts` renders the templates and sends via your SMTP transport (configured through `SMTP_*` env vars using Nodemailer under the hood).
- On registration we send `VerificationEmail` and `/api/auth/verify-email?token=...` confirms the address before redirecting back to the UI.
- Plan events (`PlanActivatedEmail`, `PlanRenewalReminderEmail`, `AutoRenewalNotificationEmail`) are triggered from Paystack verification, Paystack webhooks, and the renewal reminder cron route.

### Paystack Webhooks & Renewals

- Point your Paystack webhook URL to `/api/paystack/webhook`. We validate `x-paystack-signature`, renew the user's Pro plan, insert/update a `paystack_transactions` row, send the user a confirmation email, and optionally alert `BILLING_ALERT_EMAIL` when a subscription auto-renews (`invoice.payment_success`).
- Cron-triggered reminders: hit `/api/billing/renewals/reminders` (POST) with `Authorization: Bearer $CRON_SECRET`. Optional JSON body: `{ "daysBeforeExpiry": 3, "limit": 25 }`. The handler emails anyone whose `planExpiresAt` falls in that window and who has not already been reminded.

## Development

```bash
pnpm install
pnpm dev
```

On first run or after schema changes, create a migration:

```bash
pnpm db:migrate
```

App routes live under `app/`. The main experience is `app/page.tsx`, which uses the shared UI in `components/` and shared contracts in `types/`.

## Database & Migrations

This project uses **Drizzle ORM** for database management. Migrations run automatically:

- **On build**: `pnpm build` runs `drizzle-kit generate && drizzle-kit migrate && next build`
- **On start**: `pnpm start` runs `drizzle-kit migrate && next start`

**Manual commands:**
- `pnpm db:migrate` - Generate and run migrations (dev)
- `pnpm db:generate` - Generate migration files
- `pnpm db:push` - Push schema changes directly (dev only, no migration files)
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:drop` - Drop all tables (destructive)

**Schema location:** `lib/db/schema.ts`

**Config location:** `drizzle.config.ts`

All analysis results are automatically saved to the database when `DATABASE_URL` is set.

## Authentication

Users must create an account and log in before submitting an analysis. Authentication uses JWT tokens stored in localStorage. The login/register modal appears automatically when attempting to submit without being authenticated.

## Production Build

```bash
pnpm build
pnpm start
```

Migrations will run automatically during build/start. Ensure `DATABASE_URL` is set in your production environment.

## Notes

- The Gemini integration sits in `lib/analyzeConversation.ts` and is only imported by server routes.
- Database access is handled via `lib/db/` using Drizzle ORM with PostgreSQL.
- Styling relies on Tailwind CSS v4 via the new `@tailwindcss/postcss` plugin plus a few custom globals in `app/globals.css`.
- Internal credit monitoring lives at `/admin`. Supply `ADMIN_DASHBOARD_TOKEN` in the UI to fetch `/api/admin/credits`, which lists each user's monthly usage against the (default) 200-credit cap.
