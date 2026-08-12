import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'

const ACCOUNTS = [
  ['admin@microsys.local', 'অ্যাডমিন'],
  ['finance@microsys.local', 'ফাইন্যান্স'],
  ['ops@microsys.local', 'অপস'],
]

export default function Login() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('admin@microsys.local')
  const [password, setPassword] = useState('Microsys@2026')
  const [err, setErr] = useState(params.get('disabled') === 'google' ? 'গুগল লগইন এই ডিপ্লয়ে বন্ধ — পাসওয়ার্ড ব্যবহার করুন।' : '')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e?.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('mbp_token', data.token)
      localStorage.setItem('mbp_user', JSON.stringify(data.user))
      nav('/app')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand"><div className="logo" /> মাইক্রোসাস</div>
        <h2>লাইভ কমান্ড সেন্টার</h2>
        <p>প্রিভিউতে পাসওয়ার্ড লগইন চালু। পাসওয়ার্ড: Microsys@2026</p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {ACCOUNTS.map(([em, label]) => (
            <button
              key={em}
              type="button"
              className="btn ghost"
              onClick={() => { setEmail(em); setPassword('Microsys@2026') }}
            >
              {label}
            </button>
          ))}
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'ঢুকছে…' : 'অ্যাপে প্রবেশ'}</button>
        {err && <p className="form-note">{err}</p>}
        <p className="hint"><Link to="/">হোম</Link></p>
      </form>
    </div>
  )
}
