# DiscoNotify website

Marketing site, subscribe flow and legal pages for the DiscoNotify Discord bot.
Built with Next.js (App Router) and exported as a plain static site, so it runs on GitHub Pages, Netlify or any static host.
Everything that needs a secret (signed links, Discord login, Polar checkout, crypto) runs in one Supabase Edge Function.

## Pages

| Route            | File                          | What it is                                                              |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `/`              | `app/page.tsx`                | Homepage: platforms, comparison, features, setup, commands, pricing, FAQ |
| `/subscribe`     | `app/subscribe/page.tsx`      | Signed-link page from `/disconotify subscribe`, or Discord login and server list |
| `/auth/callback` | `app/auth/callback/page.tsx`  | Where Discord sends people back after login                             |
| `/thanks`        | `app/thanks/page.tsx`         | Payment result: success, warning or error, then "Activating your server…" |
| `/manage`        | `app/manage/page.tsx`         | How to cancel, refunds, support                                         |
| `/pay`           | `app/pay/page.tsx`            | Old link, forwards to `/subscribe`                                      |
| `/terms`, `/privacy`, `/refund` | `app/*/page.tsx` | Legal pages                                                       |

Homepage sections live in `components/home/`, the subscribe flow in `components/billing/`, legal pages share
`components/legal/LegalPage.tsx`. All styles are in `app/globals.css`. Fonts are bundled from Fontsource.

## How payments work

```
/disconotify subscribe ──► signed link ──► /subscribe?t=…        (or: Log in with Discord → pick a server)
                                                │
                                   billing function (Supabase)
                                                │
                    card: Polar checkout ───────┴─────── crypto: NOWPayments address
                       │                                         │
                  /thanks (asks Polar)                  row in pulsenotify_payments
                       │                                         │
                       └──► the bot confirms with the provider (≤ 1 min) and switches the server on
```

The website never credits a payment itself. The bot checks Polar and NOWPayments directly, so a fake `?checkout_id=`
or a forged request can't activate a server.

## Settings (website, baked in at build time)

Copy `.env.example` to `.env.local`. These are public values, safe to ship in the page:

| Variable                        | Example                                          |
| ------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`          | `https://pulsenotify.duoplus.org`                |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | Your bot's application ID                        |
| `NEXT_PUBLIC_SUPPORT_EMAIL`     | `support@duoplus.org`                            |
| `NEXT_PUBLIC_SUPPORT_SERVER`    | `https://discord.gg/abc123`                      |
| `NEXT_PUBLIC_LEGAL_NAME`        | Your exact legal name or company                 |
| `NEXT_PUBLIC_LEGAL_ADDRESS`     | City, country (or full address)                  |
| `NEXT_PUBLIC_BILLING_API_URL`   | `https://<ref>.supabase.co/functions/v1/billing` |
| `NEXT_PUBLIC_POLAR_PORTAL_URL`  | Optional: your Polar customer portal link        |

**Never put a secret in a `NEXT_PUBLIC_` variable.** They are copied into the website's JavaScript for everyone to read.

## Billing function secrets (server side only)

`supabase/functions/billing` reads these from Supabase secrets. `SUPABASE_URL` and the service key are provided by
Supabase automatically.

| Secret                                  | Value                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `SITE_URL`                              | `https://pulsenotify.duoplus.org` (also the only origin allowed to call the function)    |
| `ALLOWED_ORIGINS`                       | Optional extra origins, comma separated (e.g. `http://localhost:3000` while developing)   |
| `BILLING_LINK_SECRET`                   | The **same** long random string as the bot's `BILLING_LINK_SECRET`                        |
| `POLAR_WEB_TOKEN`                       | A separate Polar organization token with only `checkouts:write` and `checkouts:read`      |
| `POLAR_PRODUCT_ID`                      | The same monthly product the bot uses                                                     |
| `POLAR_SANDBOX`                         | `true` to use sandbox.polar.sh while testing                                              |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | The bot's Discord application (OAuth2 page)                                          |
| `SESSION_SECRET`                        | A second long random string for signing login sessions                                    |
| `NOWPAYMENTS_API_KEY`                   | Live NOWPayments key, for crypto                                                          |
| `BILLING_PRICE_USD`, `BILLING_TRIAL_DAYS`, `BILLING_GRACE_DAYS` | `2.99`, `7`, `3`, equal to the bot's settings                     |

Make the random strings with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set SITE_URL=https://pulsenotify.duoplus.org BILLING_LINK_SECRET=... SESSION_SECRET=... \
  POLAR_WEB_TOKEN=... POLAR_PRODUCT_ID=... DISCORD_CLIENT_ID=... DISCORD_CLIENT_SECRET=... \
  NOWPAYMENTS_API_KEY=... BILLING_PRICE_USD=2.99 BILLING_TRIAL_DAYS=7 BILLING_GRACE_DAYS=3
npx supabase functions deploy billing --no-verify-jwt --use-api
```

`--no-verify-jwt` is intended: the function authenticates every request itself (allowed origin, signed link or signed
session) and never relies on a Supabase login. Run the commands from this project's folder.

## One-time setup checklist

1. **Bot database:** run the bot's migrations `0006`, `0008`, `0009` and `0010` in the Supabase SQL editor.
2. **Discord developer portal** → your application → OAuth2 → Redirects: add `https://pulsenotify.duoplus.org/auth/callback`.
3. **Polar:** create a separate organization token for the website (`checkouts:write`, `checkouts:read` only), not the
   bot's token (which can open billing portals).
4. **Bot environment:** `BILLING_SUBSCRIBE_URL=https://pulsenotify.duoplus.org/subscribe` and the same
   `BILLING_LINK_SECRET` as the function. Then `BILLING_ENABLED=true`, redeploy the bot and run `!sync`.
5. Deploy the function (above), set the website variables, push to rebuild the site.
6. **Test in the sandbox first** (`POLAR_SANDBOX=true`, a sandbox token and product), then switch to live values.

## Security

- Secrets exist only as Supabase secrets and the bot's environment, never in the website, git or logs.
- The function only answers requests from your own site, rate limits per IP, validates every input and returns one
  generic error for anything unexpected.
- A server ID from the browser is never trusted: it must be inside the bot's signed link (HMAC-SHA256, 30 minutes) or
  the signed login session, and the bot must be present in that server.
- Discord login uses a CSRF-bound `state`, reads only `identify` and `guilds`, keeps just the servers the person
  manages, then revokes the Discord token immediately.
- Checkout URLs are only accepted when they are `https` on `polar.sh`.
- Duplicate card subscriptions are refused (double charges).
- The static host can add security headers: `netlify.toml` sets them for Netlify. GitHub Pages can't set headers.
- Run `node --experimental-strip-types` tests in `supabase/functions/billing` if you change `security.ts`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000   (add http://localhost:3000 to the function's ALLOWED_ORIGINS)
npm run build    # writes the static site to /out
```

## Deploy

The build writes a plain HTML site to `out/`. Upload it to any static host, or use one of the options below.

**Netlify:** import the repo. `netlify.toml` already sets the build command, the `out` folder and security headers.
Add the website variables under Site configuration > Environment variables.

**GitHub Pages:** push to `main`, then in the repo go to Settings > Pages and set Source to "GitHub Actions".
Add the website variables under Settings > Secrets and variables > Actions > Variables.
`.github/workflows/deploy.yml` builds and publishes on every push. Use a custom domain
(Settings > Pages > Custom domain).

Polar's account review needs a live website with your pricing, Terms, Privacy and Refund pages (all linked from the
footer), your legal name and a support email. This site covers all of those once the settings above are filled in.
