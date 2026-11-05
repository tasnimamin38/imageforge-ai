import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Library() {
  const [items, setItems] = useState([])
  useEffect(() => {
    api('/api/library').then((d) => setItems(d.items || [])).catch(() => {})
  }, [])

  return (
    <div className="pad">
      <h2>ডিজিটাল সংগ্রহশালা</h2>
      <p className="muted">আপনার আপনার তৈরি সব কনটেন্ট এক জায়গায় — সঙ্গে সঙ্গে ব্যবহার করুন।</p>
      {items.length === 0 && <p className="muted">এখনো কিছু সংরক্ষিত নেই। স্টুডিও থেকে প্রথম কনটেন্ট তৈরি করুন।</p>}
      {items.map((it) => (
        <article className="panel" key={it.id} style={{ marginBottom: 12 }}>
          <h3>{it.title}</h3>
          <pre className="ai">{it.text}</pre>
        </article>
      ))}
    </div>
  )
}
