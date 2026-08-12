import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Billing() {
  const [plans, setPlans] = useState([])
  const [orders, setOrders] = useState([])
  const [pay, setPay] = useState(null)
  const [trx, setTrx] = useState('')
  const user = JSON.parse(localStorage.getItem('mbp_user') || '{}')

  const load = () => {
    api('/api/plans').then(setPlans).catch(() => {})
    api('/api/billing/orders').then((d) => setOrders(d.orders)).catch(() => {})
  }
  useEffect(load, [])

  return (
    <div className="pad">
      <h2>বিলিং · আয়</h2>
      <p className="muted">প্ল্যান {user.plan} · ক্রেডিট {user.credits}</p>
      <div className="kpi-grid">
        {plans.filter((p) => p.bdt > 0).map((p) => (
          <article key={p.id}>
            <small>{p.tag}</small>
            <b>৳{p.bdt}</b>
            <p>{p.credits} ক্রেডিট / মাস</p>
            <button
              type="button"
              className="btn primary"
              onClick={async () => {
                const r = await api('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ plan: p.id, method: 'bkash' }) })
                setPay(r)
                load()
              }}
            >
              {p.name} কিনুন
            </button>
          </article>
        ))}
      </div>
      {pay && (
        <section className="panel">
          <h3>bKash / Nagad</h3>
          <p>bKash {pay.pay.bkash} · Nagad {pay.pay.nagad}</p>
          <p>{pay.pay.note}</p>
          <p>অর্ডার {pay.order.id} · ৳{pay.order.amount}</p>
          <form
            className="row"
            onSubmit={async (e) => {
              e.preventDefault()
              await api('/api/billing/trx', { method: 'POST', body: JSON.stringify({ id: pay.order.id, trx }) })
              setTrx('')
              load()
            }}
          >
            <input placeholder="ট্রানজেকশন আইডি" value={trx} onChange={(e) => setTrx(e.target.value)} />
            <button className="btn primary" type="submit">জমা</button>
          </form>
        </section>
      )}
      <h3>অর্ডার</h3>
      {orders.map((o) => (
        <div key={o.id} className="rowline">
          <span>{o.plan} · ৳{o.amount} · {o.status} · {o.trx || 'no trx'}</span>
          {user.role === 'admin' && o.status !== 'paid' && (
            <button type="button" className="btn ghost" onClick={async () => { await api('/api/billing/confirm', { method: 'POST', body: JSON.stringify({ id: o.id }) }); load() }}>কনফার্ম</button>
          )}
        </div>
      ))}
    </div>
  )
}
