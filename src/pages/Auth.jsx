import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, saveSession, token } from '../api'

const ERR = {
  google: 'গুগল লগইন ব্যর্থ — ক্লাউড কনসোলে Redirect URI সেট আছে কি?',
  'google-off': 'গুগল কী এখনো সার্ভারে নেই। ইমেইল দিয়ে সাইন আপ করুন।',
  oauth: 'সেশন তৈরি হয়নি। আবার চেষ্টা করুন।',
}

export default function Auth({ mode = 'login' }) {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const signup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(ERR[params.get('err')] || '')
  const [busy, setBusy] = useState(false)
  const [googleOn, setGoogleOn] = useState(false)

  useEffect(() => {
    if (token()) nav('/app')
    fetch('/api/health').then((r) => r.json()).then((h) => setGoogleOn(Boolean(h.google))).catch(() => {})
  }, [nav])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const path = signup ? '/api/auth/register' : '/api/auth/login'
      const data = await api(path, { method: 'POST', body: JSON.stringify({ name, email, password }) })
      saveSession(data.token, data.user)
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
        <Link className="brand" to="/"><div className="logo" /> ImageForge AI</Link>
        <h2>{signup ? 'অ্যাকাউন্ট খুলুন' : 'লগইন'}</h2>
        <p>{signup ? 'প্রথম ইউজার অ্যাডমিন হবেন। কোনো ডেমো পাসওয়ার্ড নেই।' : 'আপনার নিজের ইমেইল ও পাসওয়ার্ড দিন।'}</p>
        {signup && (
          <input placeholder="পুরো নাম" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        )}
        <input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <input type="password" placeholder={signup ? 'পাসওয়ার্ড (৮+ অক্ষর)' : 'পাসওয়ার্ড'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} required />
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'অপেক্ষা…' : signup ? 'সাইন আপ' : 'প্রবেশ'}</button>
        {googleOn && (
          <a className="btn ghost" href="/api/auth/google">Google দিয়ে চালিয়ে যান</a>
        )}
        {err && <p className="form-note">{err}</p>}
        <p className="hint">
          {signup ? <Link to="/login">আগে থেকে অ্যাকাউন্ট? লগইন</Link> : <Link to="/signup">নতুন? সাইন আপ</Link>}
          {' · '}
          <Link to="/">হোম</Link>
        </p>
      </form>
    </div>
  )
}
