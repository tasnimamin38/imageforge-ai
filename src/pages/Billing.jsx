import { useEffect, useState } from 'react'
import { api, currentUser } from '../api'

export default function Billing() {
  const [plans, setPlans] = useState([])
  const [orders, setOrders] = useState([])
  const [pay, setPay] = useState(null)
  const [trx, setTrx] = useState('')
  const [me, setMe] = useState(currentUser())

  const load = () => {
    api('/api/plans').then(setPlans).catch(() => {})
    api('/api/billing/orders').then((d) => setOrders(d.orders)).catch(() => {})
    api('/api/me').then((u) => {
      setMe(u)
      localStorage.setItem('if_user', JSON.stringify(u))
    }).catch(() => {})
  }
  useEffect(load, [])

  return (
    <div className="pad">
      <h2>বিলিং</h2>
      <p className="muted">প্যাকেজ {me.plan} · ক্রেডিট {me.credits} · ডিজিটাল টপআপ মাত্র</p>
      <div className="kpi-grid">
        {plans.filter((p) => p.bdt > 0).map((p) => (
          <article key={p.id}>
            <small>{p.tag}</small>
            <b>৳{p.bdt}</b>
            <p>{p.credits} ক্রেডিট</p>
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
          <h3>বিকাশ / নগদ</h3>
          <p>বিকাশ {pay.pay.bkash || 'সেট নেই'} · নগদ {pay.pay.nagad || 'সেট নেই'}</p>
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
            <button className="btn primary" type="submit">জমা দিন</button>
          </form>
        </section>
      )}
      <h3>অর্ডার</h3>
      {orders.map((o) => (
        <div key={o.id} className="rowline">
          <span>{o.kind} · {o.pack || o.plan} · ৳{o.amount} · {o.status} · {o.trx || 'ট্রানজেকশন আইডি নেই'}</span>
          {me.role === 'admin' && o.status !== 'paid' && (
            <button type="button" className="btn ghost" onClick={async () => { await api('/api/billing/confirm', { method: 'POST', body: JSON.stringify({ id: o.id }) }); load() }}>নিশ্চিত করুন</button>
          )}
        </div>
      ))}
    </div>
  )
}
