import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Campaigns() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ name: '', goal: '', channel: 'Meta' })

  const load = () => api('/api/campaigns').then((d) => setRows(d.campaigns)).catch(() => {})
  useEffect(load, [])

  return (
    <div className="pad">
      <h2>ডিজিটাল ক্যাম্পেইন</h2>
      <form
        className="row"
        onSubmit={async (e) => {
          e.preventDefault()
          await api('/api/campaigns', { method: 'POST', body: JSON.stringify(form) })
          setForm({ name: '', goal: '', channel: 'Meta' })
          load()
        }}
      >
        <input placeholder="ক্যাম্পেইন নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="গোল (লিড / সেলস)" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
          <option>Meta</option>
          <option>Google</option>
          <option>TikTok</option>
          <option>Email</option>
          <option>WhatsApp</option>
        </select>
        <button className="btn primary" type="submit">তৈরি</button>
      </form>
      {rows.map((r) => (
        <div key={r.id} className="rowline">
          <span>{r.name} · {r.goal}</span>
          <em>{r.channel} · {r.status}</em>
        </div>
      ))}
      {rows.length === 0 && <p className="muted">সিডেড ডেমো ক্যাম্পেইন নেই — নিজে তৈরি করুন।</p>}
    </div>
  )
}
