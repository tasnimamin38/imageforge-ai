import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Library() {
  const [items, setItems] = useState([])
  useEffect(() => {
    api('/api/library').then((d) => setItems(d.items || [])).catch(() => {})
  }, [])

  return (
    <div className="pad">
      <h2>ডিজিটাল লাইব্রেরি</h2>
      <p className="muted">আপনার জেনারেটেড অ্যাসেট — ইনস্ট্যান্ট ডেলিভারি, কোনো শিপিং নেই।</p>
      {items.length === 0 && <p className="muted">এখনো খালি। স্টুডিও থেকে তৈরি করুন।</p>}
      {items.map((it) => (
        <article className="panel" key={it.id} style={{ marginBottom: 12 }}>
          <h3>{it.title}</h3>
          <pre className="ai">{it.text}</pre>
        </article>
      ))}
    </div>
  )
}
