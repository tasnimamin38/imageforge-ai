import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Clients() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ name: '', niche: '', offer: '' })

  const load = () => api('/api/clients').then((d) => setRows(d.clients)).catch(() => {})
  useEffect(load, [])

  return (
    <div className="pad">
      <h2>ডিজিটাল গ্রাহক</h2>
      <p className="muted">এজেন্সির কর্মক্ষেত্র — এখানে অনলাইন ব্র্যান্ড ও অফার পরিচালনা করুন।</p>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault()
          await api('/api/clients', { method: 'POST', body: JSON.stringify(form) })
          setForm({ name: '', niche: '', offer: '' })
          load()
        }}
      >
        <div className="row">
          <input placeholder="ব্র্যান্ড" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="ব্যবসার ধরন" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
        </div>
        <input placeholder="ডিজিটাল অফার" value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} />
        <button className="btn primary" type="submit">যোগ করুন</button>
      </form>
      {rows.map((r) => (
        <div key={r.id} className="rowline">
          <span>{r.name} · {r.niche}</span>
          <em>{r.offer}</em>
        </div>
      ))}
    </div>
  )
}
