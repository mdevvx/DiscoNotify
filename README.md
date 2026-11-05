# DiscoNotify website

Marketing / portfolio site and legal pages for the DiscoNotify Discord bot, at `disconotify.com`.
Built with Next.js (App Router) and exported as a plain static site.

**Accounts, alert settings and billing live on the dashboard** (`dashboard.disconotify.com`), not here. This site has no
login, no checkout and no trial: every Discord server is on the Free plan (1 account per platform) and can upgrade on the
dashboard to Paid ($1.99 / month, up to 25 accounts).

## Pages

| Route                           | File                         | What it is                                                         |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `/`                             | `app/page.tsx`               | Home: platforms, features, how it works, commands, pricing, FAQ     |
| `/terms`, `/privacy`, `/refund` | `app/*/page.tsx`             | Legal pages                                                        |
| `/unsubscribe?t=…`              | `app/unsubscribe/page.tsx`   | Reminder-email unsubscribe (signed token from the bot's emails)    |
| `/subscribe`, `/manage`, `/thanks`, `/pay` | redirects         | `301` to `https://dashboard.disconotify.com/billing`               |
| `/activate`, `/auth/callback`   | redirects                    | `301` to `https://dashboard.disconotify.com`                       |

Redirects are declared in `netlify.toml` and `serve.json` (the `serve` static server used by `npm start`).
Pricing, limits and links are defined once in `lib/site.ts`.

## Settings (baked in at build time)

Copy `.env.example` to `.env.local`. These are public values; **never put a secret in a `NEXT_PUBLIC_` variable.**

| Variable                        | Example                                          |
| ------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`          | `https://disconotify.com`                        |
| `NEXT_PUBLIC_DASHBOARD_URL`     | Optional, defaults to `https://dashboard.disconotify.com` |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | The bot's application ID (builds the invite link, permissions `536988744`) |
| `NEXT_PUBLIC_SUPPORT_EMAIL`     | `support@disconotify.com`                        |
| `NEXT_PUBLIC_SUPPORT_SERVER`    | `https://discord.gg/abc123`                      |
| `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_LEGAL_ADDRESS` | Shown in the legal pages   |
| `NEXT_PUBLIC_BILLING_API_URL`   | `https://<ref>.supabase.co/functions/v1/billing` |

## The `billing` Supabase function (unsubscribe + maintenance banner only)

`supabase/functions/billing` is the only server-side code. It verifies the bot's signed unsubscribe tokens
(`BILLING_LINK_SECRET`, same value as the bot) and sets `marketing_unsubscribed_at` on that address's
`notify_email_contacts` rows, and it serves the admin panel's maintenance flag. It holds no Polar, NOWPayments or Discord
secrets: those belong to the dashboard. Template: `supabase/env.billing.example`.

```bash
npx supabase secrets set --env-file supabase/.env.billing
npx supabase functions deploy billing --no-verify-jwt --use-api
```

`--no-verify-jwt` is intended: the function checks every request itself (allowed origin, signed token). For one-click
unsubscribe the bot's `List-Unsubscribe` header should point at `https://<ref>.supabase.co/functions/v1/billing?unsub=<token>`.

**After deploying this version, rotate** any Polar token, NOWPayments key, Discord client secret and `SESSION_SECRET` that
were ever set on this function, and delete those Supabase secrets. Remove the old `https://disconotify.com/auth/callback`
redirect from the Discord application once the dashboard is live.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000   (add http://localhost:3000 to the function's ALLOWED_ORIGINS)
npm run build    # writes the static site to /out
```
