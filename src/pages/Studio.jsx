import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Studio() {
  const [tools, setTools] = useState([])
  const [tool, setTool] = useState('neuro-ads')
  const [q, setQ] = useState('ডিজিটাল কোর্সের জন্য Meta অ্যাড — টার্গেট: ২৫-৪০, ঢাকা, ফ্রিল্যান্সার। অফার: ৭ দিনের লাইভ ব্যাচ।')
  const [provider, setProvider] = useState('auto')
  const [out, setOut] = useState('')
  const [credits, setCredits] = useState(0)
  const [chats, setChats] = useState([])
  const [ready, setReady] = useState({})
  const [busy, setBusy] = useState(false)
  const [used, setUsed] = useState('')

  useEffect(() => {
    api('/api/studio').then((d) => {
      setCredits(d.credits)
      setChats(d.chats || [])
      setTools(d.tools || [])
      setReady(d.providers || {})
    }).catch(() => {})
  }, [])

  async function run(e) {
    e.preventDefault()
    setBusy(true)
    setOut('লাইভ মডেল কল হচ্ছে…')
    try {
      const r = await api('/api/ai/generate', { method: 'POST', body: JSON.stringify({ prompt: q, provider, tool }) })
      setOut(r.text)
      setUsed(r.provider)
      setCredits(r.credits)
      setChats((c) => [{ prompt: q, text: r.text, provider: r.provider, tool: r.tool, id: r.id }, ...c])
    } catch (err) {
      setOut(err.message)
      setUsed('')
    } finally {
      setBusy(false)
    }
  }

  const active = tools.find((t) => t.id === tool)

  return (
    <div className="pad">
      <h2>নিউরো স্টুডিও</h2>
      <p className="muted">ক্রেডিট: {credits} · {active ? `${active.bn} · ${active.credits} ক্রেডিট` : ''} · ডেমো ফলব্যাক নেই</p>
      <div className="tool-grid">
        {tools.map((t) => (
          <button type="button" key={t.id} className={`tool ${tool === t.id ? 'on' : ''}`} onClick={() => setTool(t.id)}>
            <small>{t.channel}</small>
            <strong>{t.bn}</strong>
          </button>
        ))}
      </div>
      <form className="stack" onSubmit={run}>
        <div className="row">
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="auto">auto (live failover)</option>
            {['groq', 'cerebras', 'openrouter', 'nararouter', 'gemini'].map((p) => (
              <option key={p} value={p}>{p}{ready[p] ? '' : ' — no key'}</option>
            ))}
          </select>
          <button className="btn primary" type="submit" disabled={busy}>{busy ? 'ফোর্জ হচ্ছে…' : 'জেনারেট'}</button>
        </div>
        <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={5} />
      </form>
      {used && <p className="muted">সোর্স: {used}</p>}
      <pre className="ai panel">{out}</pre>
      {chats.map((c) => (
        <div key={c.id || c.prompt} className="panel" style={{ marginTop: 10 }}>
          <strong>{c.tool} · {c.provider}</strong>
          <p className="muted">{c.prompt}</p>
          <pre className="ai">{c.text}</pre>
        </div>
      ))}
    </div>
  )
}
