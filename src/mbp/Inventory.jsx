import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')

  const load = () => api('/api/inventory').then((d) => setProducts(d.products))
  useEffect(() => { load().catch(() => {}) }, [])

  return (
    <div className="pad">
      <h2>ইনভেন্টরি</h2>
      <form className="row" onSubmit={async (e) => {
        e.preventDefault()
        await api('/api/inventory', { method: 'POST', body: JSON.stringify({ sku, name, stock: 10, reorder: 5, price: 1000 }) })
        setSku(''); setName(''); load()
      }}>
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <input placeholder="নাম" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary" type="submit">SKU</button>
      </form>
      <table>
        <thead><tr><th>SKU</th><th>নাম</th><th>স্টক</th><th>রিঅর্ডার</th><th>দাম</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.stock <= p.reorder ? 'warn' : ''}>
              <td>{p.sku}</td><td>{p.name}</td><td>{p.stock}</td><td>{p.reorder}</td><td>৳{p.price.toLocaleString()}</td>
              <td>
                <button type="button" className="btn ghost" onClick={async () => { await api(`/api/inventory/${p.id}`, { method: 'PATCH', body: JSON.stringify({ stock: p.stock + 10 }) }); load() }}>+10</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
