import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('admin@microsys.local')
  const [password, setPassword] = useState('Microsys@2026')
  const [err, setErr] = useState(params.get('err') ? 'গুগল লগইন হয়নি — কনসোলে রিডাইরেক্ট URI যোগ করুন' : '')

  async function submit(e) {
    e.preventDefault()
    setErr('')
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('mbp_token', data.token)
      localStorage.setItem('mbp_user', JSON.stringify(data.user))
      nav('/app')
    } catch (e2) {
      setErr(e2.message)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand"><div className="logo" /> মাইক্রোসাস</div>
        <h2>মাইক্রোসাস প্ল্যাটফর্ম</h2>
        <p>গুগল দিয়ে শুরু করুন — ১৫০ ফ্রি ক্রেডিট</p>
        <a className="btn primary" href="/api/auth/google">Google দিয়ে প্রবেশ</a>
        <p className="hint">অথবা ডেমো অ্যাডমিন</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn ghost" type="submit">পাসওয়ার্ড লগইন</button>
        {err && <p className="form-note">{err}</p>}
        <p className="hint"><Link to="/">হোম</Link></p>
      </form>
    </div>
  )
}
