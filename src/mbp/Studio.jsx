import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Studio() {
  const [q, setQ] = useState('একটি ফেসবুক অ্যাড কপি লিখুন পদ্মা ব্যাংকের জন্য')
  const [provider, setProvider] = useState('auto')
  const [out, setOut] = useState('')
  const [credits, setCredits] = useState(0)
  const [chats, setChats] = useState([])

  useEffect(() => {
    api('/api/studio').then((d) => {
      setCredits(d.credits)
      setChats(d.chats || [])
    }).catch(() => {})
  }, [])

  async function run(e) {
    e.preventDefault()
    setOut('জেনারেট হচ্ছে…')
    try {
      const r = await api('/api/ai/brief', { method: 'POST', body: JSON.stringify({ prompt: q, provider }) })
      setOut(`${r.provider}\n\n${r.text}`)
      setCredits(r.credits)
      setChats((c) => [{ prompt: q, text: r.text, provider: r.provider }, ...c])
    } catch (err) {
      setOut(err.message)
    }
  }

  return (
    <div className="pad">
      <h2>এআই স্টুডিও</h2>
      <p className="muted">ক্রেডিট: {credits} · প্রতি রান ৩ ক্রেডিট</p>
      <form className="row" onSubmit={run}>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="auto">auto</option>
          <option value="groq">groq</option>
          <option value="gemini">gemini</option>
          <option value="openrouter">openrouter</option>
          <option value="cerebras">cerebras</option>
          <option value="nararouter">nararouter</option>
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn primary" type="submit">জেনারেট</button>
      </form>
      <pre className="ai panel">{out}</pre>
      {chats.map((c, i) => (
        <div key={i} className="panel" style={{ marginTop: 10 }}>
          <strong>{c.prompt}</strong>
          <p className="muted">{c.text}</p>
        </div>
      ))}
    </div>
  )
}
