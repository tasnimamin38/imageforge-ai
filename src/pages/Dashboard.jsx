import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Dashboard() {
  const [d, setD] = useState(null)

  useEffect(() => {
    api('/api/dashboard').then(setD).catch(() => {})
  }, [])

  if (!d) return <p className="pad">লোড হচ্ছে…</p>
  const { kpis } = d
  const max = Math.max(1, ...d.series.map((s) => s.n))

  return (
    <div className="pad">
      <h2>নিউরো কমান্ড</h2>
      <p className="muted">লাইভ প্রোভাইডার {d.liveProviders} · প্ল্যান {kpis.plan}</p>
      <div className="kpi-grid">
        <article><small>ক্রেডিট</small><b>{kpis.credits}</b></article>
        <article><small>জেনারেশন</small><b>{kpis.generations}</b></article>
        <article><small>ক্যাম্পেইন</small><b>{kpis.campaigns}</b></article>
        <article><small>ক্লায়েন্ট</small><b>{kpis.clients}</b></article>
        <article><small>লাইব্রেরি</small><b>{kpis.library}</b></article>
        <article><small>পেইড</small><b>৳{kpis.spent}</b></article>
      </div>
      <div className="split">
        <section className="panel">
          <h3>১২ দিনের আউটপুট</h3>
          <div className="bars">
            {d.series.map((s) => (
              <div key={s.key} style={{ height: `${(s.n / max) * 120}px` }} title={`${s.key}: ${s.n}`} />
            ))}
          </div>
        </section>
        <section className="panel">
          <h3>AI রাউট</h3>
          {Object.entries(d.providers).map(([k, on]) => (
            <div key={k} className="rowline">
              <span>{k}</span>
              <em className={on ? 'on-track' : 'at-risk'}>{on ? 'live' : 'no key'}</em>
            </div>
          ))}
          <Link className="btn primary" to="/app/studio" style={{ marginTop: 12 }}>স্টুডিও খুলুন</Link>
        </section>
      </div>
      <div className="split">
        <section className="panel">
          <h3>ক্যাম্পেইন</h3>
          {d.campaigns.length === 0 && <p className="muted">এখনো নেই — তৈরি করুন।</p>}
          {d.campaigns.map((p) => (
            <div key={p.id} className="rowline">
              <span>{p.name}</span>
              <em>{p.channel}</em>
            </div>
          ))}
        </section>
        <section className="panel">
          <h3>সর্বশেষ আউটপুট</h3>
          {d.recent.length === 0 && <p className="muted">প্রথম জেনারেশন স্টুডিও থেকে চালান।</p>}
          {d.recent.map((c) => (
            <div key={c.id} className="rowline muted">
              <span>{c.tool}</span>
              <em>{c.provider}</em>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
