import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const load = () => api('/api/projects').then((d) => setProjects(d.projects))
  useEffect(() => { load().catch(() => {}) }, [])

  return (
    <div className="pad">
      <h2>ডেলিভারি প্রোগ্রাম</h2>
      {projects.map((p) => (
        <section className="panel" key={p.id}>
          <div className="rowline">
            <strong>{p.name}</strong>
            <em className={p.status}>{p.status}</em>
          </div>
          <div className="track"><i style={{ width: `${p.progress}%` }} /></div>
          <p className="muted">{p.client} · বাজেট ৳{p.budget.toLocaleString()}</p>
          <button type="button" className="btn ghost" onClick={async () => {
            await api(`/api/projects/${p.id}`, { method: 'PATCH', body: JSON.stringify({ progress: Math.min(100, p.progress + 5) }) })
            load()
          }}>+৫% প্রগ্রেস</button>
        </section>
      ))}
    </div>
  )
}
