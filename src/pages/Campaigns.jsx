import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Campaigns() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ name: '', goal: '', channel: 'Meta' })

  const load = () => api('/api/campaigns').then((d) => setRows(d.campaigns)).catch(() => {})
  useEffect(load, [])

  return (
    <div className="pad">
      <h2>ডিজিটাল প্রচারাভিযান</h2>
      <form
        className="row"
        onSubmit={async (e) => {
          e.preventDefault()
          await api('/api/campaigns', { method: 'POST', body: JSON.stringify(form) })
          setForm({ name: '', goal: '', channel: 'Meta' })
          load()
        }}
      >
        <input placeholder="প্রচারাভিযানের নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="লক্ষ্য (লিড / বিক্রি)" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
          <option value="Meta">মেটা</option>
          <option value="Google">গুগল</option>
          <option value="TikTok">টিকটক</option>
          <option value="Email">ইমেইল</option>
          <option value="WhatsApp">হোয়াটসঅ্যাপ</option>
        </select>
        <button className="btn primary" type="submit">তৈরি</button>
      </form>
      {rows.map((r) => (
        <div key={r.id} className="rowline">
          <span>{r.name} · {r.goal}</span>
          <em>{r.channel} · {r.status}</em>
        </div>
      ))}
      {rows.length === 0 && <p className="muted">এখনো কোনো প্রচারাভিযান নেই — প্রথমটি তৈরি করুন।</p>}
    </div>
  )
}
