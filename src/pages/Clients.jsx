import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Clients() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ name: '', niche: '', offer: '' })

  const load = () => api('/api/clients').then((d) => setRows(d.clients)).catch(() => {})
  useEffect(load, [])

  return (
    <div className="pad">
      <h2>ডিজিটাল ক্লায়েন্ট</h2>
      <p className="muted">এজেন্সি ওয়ার্কস্পেস — শুধু অনলাইন ব্র্যান্ড/অফার, ইনভেন্টরি নয়।</p>
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
          <input placeholder="নিশ" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
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
