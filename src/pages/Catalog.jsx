import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Catalog() {
  const [items, setItems] = useState([])
  const [pay, setPay] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    api('/api/catalog').then(setItems).catch(() => {})
  }, [])

  async function buy(pack) {
    setNote('')
    try {
      const r = await api('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ pack: pack.id, method: 'bkash' }) })
      setPay(r)
    } catch (e) {
      setNote(e.message)
    }
  }

  return (
    <div className="pad">
      <h2>ডিজিটাল প্রোডাক্ট</h2>
      <p className="muted">টুলগুলো স্টুডিওতে ক্রেডিটে চলে। প্যাকগুলো ওয়ান-টাইম অনলাইন আনলক।</p>
      <div className="kpi-grid">
        {items.map((p) => (
          <article key={p.id}>
            <small>{p.kind === 'pack' ? `৳${p.price}` : `${p.credits} ক্রেডিট`}</small>
            <b>{p.bn}</b>
            <p className="muted">{p.blurb}</p>
            {p.kind === 'pack' ? (
              <button type="button" className="btn primary" onClick={() => buy(p)}>কিনুন</button>
            ) : (
              <a className="btn ghost" href="/app/studio">স্টুডিও</a>
            )}
          </article>
        ))}
      </div>
      {pay && (
        <section className="panel">
          <h3>চেকআউট {pay.order.id}</h3>
          <p>৳{pay.order.amount} · {pay.order.pack || pay.order.plan}</p>
          <p>bKash {pay.pay.bkash || '—'} · Nagad {pay.pay.nagad || '—'}</p>
          <p className="muted">{pay.pay.note}</p>
        </section>
      )}
      {note && <p className="form-note">{note}</p>}
    </div>
  )
}
