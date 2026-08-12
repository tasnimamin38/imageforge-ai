import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Dashboard() {
  const [d, setD] = useState(null)
  const [ai, setAi] = useState('')
  const [q, setQ] = useState('কোম্পানির স্বাস্থ্য সংক্ষেপে বলুন')
  const [provider, setProvider] = useState('auto')
  const [ready, setReady] = useState({})

  useEffect(() => {
    api('/api/dashboard').then(setD).catch(() => {})
    api('/api/ai/providers').then(setReady).catch(() => {})
  }, [])

  async function brief(e) {
    e.preventDefault()
    setAi('কপিলট ভাবছে…')
    try {
      const r = await api('/api/ai/brief', { method: 'POST', body: JSON.stringify({ prompt: q, provider }) })
      setAi(`${r.provider}: ${r.text}`)
    } catch (err) {
      setAi(err.message)
    }
  }

  if (!d) return <p className="pad">লোড হচ্ছে…</p>
  const { kpis } = d
  const max = Math.max(...d.revenueSeries)

  return (
    <div className="pad">
      <h2>কমান্ড সেন্টার</h2>
      <div className="kpi-grid">
        <article><small>ARR</small><b>৳{(kpis.arr / 1e5).toFixed(1)}L</b></article>
        <article><small>পাইপলাইন</small><b>৳{(kpis.pipeline / 1e5).toFixed(1)}L</b></article>
        <article><small>রিসিভেবল</small><b>৳{(kpis.openReceivables / 1e3).toFixed(0)}k</b></article>
        <article><small>হেডকাউন্ট</small><b>{kpis.headcount}</b></article>
        <article><small>লো স্টক</small><b>{kpis.lowStock}</b></article>
        <article><small>অ্যাকাউন্ট</small><b>{kpis.customers}</b></article>
      </div>
      <div className="split">
        <section className="panel">
          <h3>রেভিনিউ রান-রেট</h3>
          <div className="bars">
            {d.revenueSeries.map((v, i) => (
              <div key={i} style={{ height: `${(v / max) * 120}px` }} title={`${v} cr`} />
            ))}
          </div>
        </section>
        <section className="panel">
          <h3>এআই কপিলট</h3>
          <form onSubmit={brief} className="row">
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="auto">auto</option>
              {['groq', 'cerebras', 'openrouter', 'nararouter', 'gemini'].map((p) => (
                <option key={p} value={p}>{p}{ready[p] ? '' : ' (off)'}</option>
              ))}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn primary" type="submit">ব্রিফ</button>
          </form>
          <p className="ai">{ai}</p>
        </section>
      </div>
      <div className="split">
        <section className="panel">
          <h3>প্রোগ্রাম</h3>
          {d.projects.map((p) => (
            <div key={p.id} className="rowline">
              <span>{p.name}</span>
              <em className={p.status}>{p.progress}%</em>
            </div>
          ))}
        </section>
        <section className="panel">
          <h3>অডিট</h3>
          {d.audit.map((a, i) => (
            <div key={i} className="rowline muted"><span>{a.action}</span><em>{a.actor}</em></div>
          ))}
        </section>
      </div>
    </div>
  )
}
