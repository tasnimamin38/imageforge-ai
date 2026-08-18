# ImageForge AI

Digital-only **neuro-marketing SaaS**. Live multi-provider AI (Groq, Cerebras, OpenRouter, NaraRouter, Gemini). No demo logins. No physical inventory.

Production domain: `https://imageforge-ai.vercel.app` — merge **PR #2** (or set Vercel Production Branch to `arena/019ff725-imageforge-ai`). `main` was an empty README, which caused `NOT_FOUND`.

## Local

```bash
cp .env.example .env
# fill keys — never commit .env
npm install
npm run dev
```

Open the Vite URL. Create your own account at `/signup`. The first user becomes admin.

## Vercel env (Project → Settings → Environment Variables)

Add the same names as `.env.example`:

- `JWT_SECRET` — long random string
- `APP_URL` — `https://imageforge-ai.vercel.app` (and preview URL if you use Google OAuth there)
- `GROQ_API_KEY` `CEREBRAS_API_KEY` `OPENROUTER_API_KEY` `NARAROUTER_API_KEY` `GEMINI_API_KEY`
- `PAY_BKASH` `PAY_NAGAD` — your real wallet numbers
- optional Google: `GOOGLE_CLIENT_ID` `GOOGLE_CLIENT_SECRET`
- optional Clerk: `VITE_CLERK_PUBLISHABLE_KEY` `CLERK_SECRET_KEY`

Google Cloud → Authorized redirect URIs:

- `https://imageforge-ai.vercel.app/api/auth/google/callback`
- preview host `/api/auth/google/callback`
- local `http://localhost:8787/api/auth/google/callback`

Redeploy after saving env.

## Persistence

JSON store (`server/data.json` locally, `/tmp` on Vercel). Serverless `/tmp` resets on cold start. For paying customers add Neon/Postgres later.

## Billing

Customers pay bKash/Nagad, paste trx, **first registered user (admin)** confirms in Billing. Digital packs unlock instantly after confirm. No warehouse, no SKUs.
