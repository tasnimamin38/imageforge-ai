import { useEffect, useState } from 'react'
import { api, currentUser } from '../api'

export default function Settings() {
  const me0 = currentUser()
  const [name, setName] = useState(me0.name || '')
  const [password, setPassword] = useState('')
  const [note, setNote] = useState('')
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    api('/api/users').then(setAdmin).catch(() => {})
  }, [])

  return (
    <div className="pad">
      <h2>সেটিংস</h2>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault()
          const body = { name }
          if (password) body.password = password
          const u = await api('/api/me', { method: 'PATCH', body: JSON.stringify(body) })
          localStorage.setItem('if_user', JSON.stringify(u))
          setPassword('')
          setNote('সেভ হয়েছে')
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="নতুন পাসওয়ার্ড (ঐচ্ছিক)" />
        <button className="btn primary" type="submit">আপডেট</button>
        <p className="form-note">{note}</p>
      </form>
      {admin && (
        <>
          <h3 style={{ marginTop: 28 }}>অ্যাডমিন · ইউজার</h3>
          <table>
            <thead><tr><th>নাম</th><th>ইমেইল</th><th>রোল</th><th>প্ল্যান</th><th>ক্রেডিট</th></tr></thead>
            <tbody>
              {admin.users.map((u) => (
                <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.plan}</td><td>{u.credits}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
