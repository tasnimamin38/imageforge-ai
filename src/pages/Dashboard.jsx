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
      <h2>নিউরো ড্যাশবোর্ড</h2>
      <p className="muted">সক্রিয় AI সেবা {d.liveProviders} · প্ল্যান {kpis.plan}</p>
      <div className="kpi-grid">
        <article><small>ক্রেডিট</small><b>{kpis.credits}</b></article>
        <article><small>জেনারেশন</small><b>{kpis.generations}</b></article>
        <article><small>প্রচারাভিযান</small><b>{kpis.campaigns}</b></article>
        <article><small>গ্রাহক</small><b>{kpis.clients}</b></article>
        <article><small>সংগ্রহশালা</small><b>{kpis.library}</b></article>
        <article><small>পেইড</small><b>৳{kpis.spent}</b></article>
      </div>
      <div className="split">
        <section className="panel">
          <h3>গত ১২ দিনের কার্যক্রম</h3>
          <div className="bars">
            {d.series.map((s) => (
              <div key={s.key} style={{ height: `${(s.n / max) * 120}px` }} title={`${s.key}: ${s.n}`} />
            ))}
          </div>
        </section>
        <section className="panel">
          <h3>AI সেবা সংযোগ</h3>
          {Object.entries(d.providers).map(([k, on]) => (
            <div key={k} className="rowline">
              <span>{k}</span>
              <em className={on ? 'on-track' : 'at-risk'}>{on ? 'সক্রিয়' : 'API কী যুক্ত নেই'}</em>
            </div>
          ))}
          <Link className="btn primary" to="/app/studio" style={{ marginTop: 12 }}>স্টুডিওতে যান</Link>
        </section>
      </div>
      <div className="split">
        <section className="panel">
          <h3>প্রচারাভিযান</h3>
          {d.campaigns.length === 0 && <p className="muted">এখনো নেই — তৈরি করুন।</p>}
          {d.campaigns.map((p) => (
            <div key={p.id} className="rowline">
              <span>{p.name}</span>
              <em>{p.channel}</em>
            </div>
          ))}
        </section>
        <section className="panel">
          <h3>সাম্প্রতিক ফলাফল</h3>
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
