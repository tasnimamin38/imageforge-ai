# মাইক্রোসাস · MicroSaaS

**Vercel 404?** Production branch must be `arena/019ff725-imageforge-ai` (or merge this branch into `main`). `main` only had a README, so Vercel served `NOT_FOUND`.

Settings → Git → Production Branch → this branch → Redeploy. Add env vars from `.env.example`.


AI studio + business OS + Google login + bKash/Nagad credits.

## Clerk

App: `app_3HpXHtjwJ74gFTgIx8dk08Xm6QT`

1. Dashboard → API keys → copy **Publishable key** into `VITE_CLERK_PUBLISHABLE_KEY`
2. Put `CLERK_SECRET_KEY` only on the server / Vercel (never in the browser)
3. Allowed origins: your Vercel URL and `http://localhost:5173`

Then nav shows **সাইন ইন / সাইন আপ** and a profile button after signup.

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

Demo: `admin@microsys.local` / `Microsys@2026`

## Vercel (GitHub → Deploy)

This sandbox cannot reach `api.vercel.com` (TLS blocked), so deploy from your machine or the Vercel dashboard.

**Easiest:** [vercel.com/new](https://vercel.com/new) → Import `tasnimamin38/imageforge-ai` → branch `arena/019ff725-imageforge-ai`.

**CLI (your PC):**

```bash
npx vercel login
npx vercel --prod --yes
```

Or `VERCEL_TOKEN=... npx vercel --prod --yes`

In the Vercel project add env names from `.env.example`. After first deploy set `APP_URL` to the `*.vercel.app` URL.

Google Cloud OAuth:
   - Authorized JavaScript origins: `https://YOUR.vercel.app`
   - Redirect URIs: `https://YOUR.vercel.app/api/auth/google/callback`
   - Local: `http://localhost:8787` and `http://localhost:5173` + `/api/auth/google/callback`

Set `APP_URL` to the Vercel URL so OAuth redirects stay on the live domain.

**Note:** file JSON DB is fine for demo. For real customers use Vercel Postgres / Neon. Serverless `/tmp` resets.

## Income

Growth ৳2990 / Scale ৳12900 — customers pay bKash/Nagad, paste trx, you confirm in Billing (admin).
