import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@microsys.local')
  const [password, setPassword] = useState('Microsys@2026')
  const [err, setErr] = useState('')

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
        <div className="brand"><div className="logo" /> মাইক্রোসাস MBP</div>
        <h2>কমান্ড সেন্টার</h2>
        <p>এন্টারপ্রাইজ সেশন · JWT ১২ ঘণ্টা</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn primary" type="submit">প্রবেশ</button>
        {err && <p className="form-note">{err}</p>}
        <p className="hint">finance@ / ops@ একই পাসওয়ার্ড · <Link to="/">মার্কেটিং</Link></p>
      </form>
    </div>
  )
}
