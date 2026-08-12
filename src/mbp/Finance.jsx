import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Finance() {
  const [invoices, setInvoices] = useState([])
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState('')

  const load = () => api('/api/finance').then((d) => setInvoices(d.invoices))
  useEffect(() => { load().catch(() => {}) }, [])

  return (
    <div className="pad">
      <h2>ফাইন্যান্স</h2>
      <form className="row" onSubmit={async (e) => {
        e.preventDefault()
        await api('/api/finance/invoices', { method: 'POST', body: JSON.stringify({ customer, amount: Number(amount) }) })
        setCustomer(''); setAmount(''); load()
      }}>
        <input placeholder="কাস্টমার" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        <input placeholder="অ্যামাউন্ট" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn primary" type="submit">ইনভয়েস</button>
      </form>
      <table>
        <thead><tr><th>ID</th><th>কাস্টমার</th><th>৳</th><th>স্ট্যাটাস</th><th>ডিউ</th><th></th></tr></thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id}>
              <td>{i.id}</td><td>{i.customer}</td><td>{i.amount.toLocaleString()}</td>
              <td className={i.status}>{i.status}</td><td>{i.due}</td>
              <td>
                {i.status !== 'paid' && (
                  <button type="button" className="btn ghost" onClick={async () => { await api(`/api/finance/invoices/${i.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'paid' }) }); load() }}>মার্ক পেইড</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
