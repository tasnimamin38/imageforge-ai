import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Settings() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api('/api/users').then(setData).catch((e) => setErr(e.message))
  }, [])

  if (err) return <div className="pad"><h2>কন্ট্রোল প্লেন</h2><p>{err} — শুধু অ্যাডমিন অডিট দেখতে পারেন।</p></div>
  if (!data) return <p className="pad">লোড…</p>

  return (
    <div className="pad">
      <h2>আইডেন্টিটি ও অডিট</h2>
      <table>
        <thead><tr><th>নাম</th><th>ইমেইল</th><th>রোল</th><th>ডিপার্টমেন্ট</th></tr></thead>
        <tbody>
          {data.users.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.dept}</td></tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ marginTop: 24 }}>অডিট ট্রেল</h3>
      {data.audit.map((a, i) => (
        <div key={i} className="rowline muted"><span>{a.at} · {a.action}</span><em>{a.actor}</em></div>
      ))}
    </div>
  )
}
