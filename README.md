# মাইক্রোসাস · MicroSaaS

AI studio + business OS + Google login + bKash/Nagad credits.

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

Demo: `admin@microsys.local` / `Microsys@2026`

## Vercel (GitHub → Deploy)

Yes — connect the repo in Vercel.

1. Import `tasnimamin38/imageforge-ai`
2. Framework: Vite (auto)
3. Add **Environment Variables** (same names as `.env.example`) — never commit secrets
4. Deploy
5. Google Cloud Console → OAuth client:
   - Authorized JavaScript origins: `https://YOUR.vercel.app`
   - Redirect URIs: `https://YOUR.vercel.app/api/auth/google/callback`
   - Local: `http://localhost:8787` and `http://localhost:5173` + `/api/auth/google/callback`

Set `APP_URL` to the Vercel URL so OAuth redirects stay on the live domain.

**Note:** file JSON DB is fine for demo. For real customers use Vercel Postgres / Neon. Serverless `/tmp` resets.

## Income

Growth ৳2990 / Scale ৳12900 — customers pay bKash/Nagad, paste trx, you confirm in Billing (admin).
