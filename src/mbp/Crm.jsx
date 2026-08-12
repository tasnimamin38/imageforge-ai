import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Crm() {
  const [data, setData] = useState({ customers: [], leads: [] })
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')

  const load = () => api('/api/crm').then(setData)
  useEffect(() => { load().catch(() => {}) }, [])

  return (
    <div className="pad">
      <h2>CRM</h2>
      <div className="split">
        <section className="panel">
          <h3>অ্যাকাউন্ট</h3>
          <form className="row" onSubmit={async (e) => { e.preventDefault(); await api('/api/crm/customers', { method: 'POST', body: JSON.stringify({ name, industry: 'New', city: 'Dhaka' }) }); setName(''); load() }}>
            <input placeholder="নতুন অ্যাকাউন্ট" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn primary" type="submit">যোগ</button>
          </form>
          <table>
            <thead><tr><th>নাম</th><th>ইন্ডাস্ট্রি</th><th>ARR</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {data.customers.map((c) => (
                <tr key={c.id}><td>{c.name}</td><td>{c.industry}</td><td>৳{c.arr.toLocaleString()}</td><td>{c.status}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h3>পাইপলাইন</h3>
          <form className="row" onSubmit={async (e) => { e.preventDefault(); await api('/api/crm/leads', { method: 'POST', body: JSON.stringify({ company, value: 500000 }) }); setCompany(''); load() }}>
            <input placeholder="লিড" value={company} onChange={(e) => setCompany(e.target.value)} />
            <button className="btn primary" type="submit">লিড</button>
          </form>
          {data.leads.map((l) => (
            <div key={l.id} className="rowline"><span>{l.company}</span><em>৳{l.value.toLocaleString()} · {l.stage}</em></div>
          ))}
        </section>
      </div>
    </div>
  )
}
