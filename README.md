# মাইক্রোসাস MBP · Enterprise Business Platform

Production-style ERP: marketing site + authenticated command center.

```bash
npm install
npm run dev
```

Open `/` for the 3D site, `/login` for MBP.

**Demo**
- `admin@microsys.local` / `Microsys@2026`
- `finance@microsys.local` / `Microsys@2026`
- `ops@microsys.local` / `Microsys@2026` (HR write blocked)

**API keys (optional)**  
Copy `.env.example` → `.env` on the server process.

| Key | What it unlocks |
|-----|-----------------|
| `OPENAI_API_KEY` | Live copilot briefs (`POST /api/ai/brief`) |
| `JWT_SECRET` | Signed sessions (required in real prod) |
| Stripe / Resend / SMTP | Can be wired for billing & mail when you add them |

Without OpenAI, copilot still answers from live ERP totals (local mode).
