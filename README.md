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

Open the Vite URL. Create an account at `/signup`. Normal signups receive the member role.

## Vercel env (Project → Settings → Environment Variables)

Add the same names as `.env.example`:

- `JWT_SECRET` — at least 32 random characters; production startup fails closed when it is missing or too short
- `APP_URL` — `https://imageforge-ai.vercel.app` (canonical public origin)
- `CORS_ORIGINS` — optional comma-separated HTTPS origins for approved preview/admin frontends only
- `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_BOOTSTRAP_TOKEN` — set both before signup; use a 32+ character random token in the signup form to create the first admin. All ordinary signups remain members.
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

Customers pay bKash/Nagad and submit a transaction ID. An admin confirms the payment; a settled order cannot be fulfilled twice by the application. Do not process real payments until the JSON store is replaced with a durable database.

## Tests

```bash
npm test
```

The focused unit tests cover production JWT configuration, CORS allowlisting, admin bootstrap, Google OAuth state validation, and one-time billing fulfillment.
