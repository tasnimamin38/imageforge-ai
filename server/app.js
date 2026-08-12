import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { loadEnv } from './loadEnv.js'
import { load, save, audit, id } from './store.js'
import { complete, providersStatus } from './ai.js'
import { PLANS } from './plans.js'

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const JWT = process.env.JWT_SECRET || 'microsys-mbp-dev-secret-change-in-prod'
const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

app.use(cors())
app.use(express.json())

let db = load()
if (!db.orders) db.orders = []
if (!db.chats) db.chats = []
db.users.forEach((u) => {
  if (u.credits == null) u.credits = 150
  if (!u.plan) u.plan = 'starter'
})

function publicOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  const host = req.get('host') || ''
  if (host.includes('vercel.app')) return `https://${host}`
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}`
}

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT, { expiresIn: '12h' })
}

function auth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, JWT)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

function publicUser(u) {
  if (!u) return null
  const { password, ...rest } = u
  return rest
}

function me(req) {
  return db.users.find((u) => u.id === req.user.id)
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    product: 'Microsys',
    version: '3.0.0',
    google: false,
    ai: providersStatus(),
  })
})

app.get('/api/plans', (_req, res) => res.json(Object.values(PLANS)))

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.users.find((u) => u.email === email)
  if (!user || !user.password || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' })
  }
  audit(db, user.email, 'login', 'password')
  save(db)
  res.json({ token: signUser(user), user: publicUser(user) })
})

app.get('/api/auth/google', (req, res) => {
  const origin = publicOrigin(req)
  return res.redirect(302, `${origin}/login?disabled=google`)
})

app.get('/api/auth/google/callback', (req, res) => {
  return res.redirect(302, `${publicOrigin(req)}/login?disabled=google`)
})

app.get('/api/me', auth, (req, res) => res.json(publicUser(me(req) || req.user)))

app.get('/api/dashboard', auth, (_req, res) => {
  const arr = db.customers.reduce((s, c) => s + c.arr, 0)
  const openInv = db.invoices.filter((i) => i.status !== 'paid' && i.status !== 'draft')
  const lowStock = db.products.filter((p) => p.stock <= p.reorder)
  res.json({
    kpis: {
      arr,
      customers: db.customers.length,
      openReceivables: openInv.reduce((s, i) => s + i.amount, 0),
      headcount: db.employees.filter((e) => e.status === 'active').length,
      lowStock: lowStock.length,
      pipeline: db.leads.reduce((s, l) => s + l.value, 0),
      mrr: db.orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0),
    },
    revenueSeries: [4.2, 4.6, 5.1, 4.9, 5.8, 6.4, 7.1, 6.9, 7.8, 8.2, 8.9, 9.4],
    invoices: db.invoices,
    projects: db.projects,
    lowStock,
    audit: db.audit.slice(0, 8),
  })
})

app.get('/api/crm', auth, (_req, res) => res.json({ customers: db.customers, leads: db.leads }))
app.post('/api/crm/customers', auth, (req, res) => {
  const row = { id: id('c'), status: 'negotiation', arr: 0, owner: req.user.name, ...req.body }
  db.customers.unshift(row)
  audit(db, req.user.email, 'crm.create', row.name)
  save(db)
  res.json(row)
})
app.post('/api/crm/leads', auth, (req, res) => {
  const row = { id: id('l'), stage: 'discovery', score: 40, value: 0, ...req.body }
  db.leads.unshift(row)
  audit(db, req.user.email, 'lead.create', row.company)
  save(db)
  res.json(row)
})

app.get('/api/inventory', auth, (_req, res) => res.json({ products: db.products }))
app.post('/api/inventory', auth, (req, res) => {
  const row = { id: id('p'), stock: 0, reorder: 10, price: 0, warehouse: 'DHK-01', ...req.body }
  db.products.unshift(row)
  audit(db, req.user.email, 'sku.create', row.sku)
  save(db)
  res.json(row)
})
app.patch('/api/inventory/:id', auth, (req, res) => {
  const p = db.products.find((x) => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  Object.assign(p, req.body)
  audit(db, req.user.email, 'sku.update', p.sku)
  save(db)
  res.json(p)
})

app.get('/api/finance', auth, (_req, res) => res.json({ invoices: db.invoices }))
app.post('/api/finance/invoices', auth, (req, res) => {
  const row = {
    id: `inv-${1000 + db.invoices.length + 1}`,
    status: 'open',
    due: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    ...req.body,
  }
  db.invoices.unshift(row)
  audit(db, req.user.email, 'invoice.create', row.id)
  save(db)
  res.json(row)
})
app.patch('/api/finance/invoices/:id', auth, (req, res) => {
  const inv = db.invoices.find((x) => x.id === req.params.id)
  if (!inv) return res.status(404).json({ error: 'Not found' })
  Object.assign(inv, req.body)
  audit(db, req.user.email, 'invoice.update', inv.id)
  save(db)
  res.json(inv)
})

app.get('/api/hr', auth, (_req, res) => res.json({ employees: db.employees }))
app.post('/api/hr', auth, (req, res) => {
  if (req.user.role === 'ops') return res.status(403).json({ error: 'HR write restricted' })
  const row = { id: id('e'), status: 'active', salary: 0, ...req.body }
  db.employees.unshift(row)
  audit(db, req.user.email, 'hr.create', row.name)
  save(db)
  res.json(row)
})

app.get('/api/projects', auth, (_req, res) => res.json({ projects: db.projects }))
app.patch('/api/projects/:id', auth, (req, res) => {
  const p = db.projects.find((x) => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  Object.assign(p, req.body)
  audit(db, req.user.email, 'project.update', p.name)
  save(db)
  res.json(p)
})

app.get('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  res.json({ users: db.users.map(publicUser), audit: db.audit.slice(0, 40), orders: db.orders })
})

app.get('/api/ai/providers', auth, (_req, res) => res.json(providersStatus()))

app.post('/api/ai/brief', auth, async (req, res) => {
  const user = me(req)
  const cost = 3
  if (!user || user.credits < cost) return res.status(402).json({ error: 'ক্রেডিট শেষ — Growth নিন' })
  const prompt = req.body?.prompt || 'Summarize company health'
  const provider = req.body?.provider || 'auto'
  const snapshot = {
    arr: db.customers.reduce((s, c) => s + c.arr, 0),
    overdue: db.invoices.filter((i) => i.status === 'overdue'),
    lowStock: db.products.filter((p) => p.stock <= p.reorder),
    atRisk: db.projects.filter((p) => p.status === 'at-risk'),
    customers: db.customers.map((c) => ({ name: c.name, arr: c.arr, status: c.status })),
  }
  try {
    const out = await complete({ provider, prompt, snapshot })
    user.credits -= cost
    db.chats.unshift({ id: id('ch'), user: user.email, prompt, text: out.text, provider: out.provider, at: new Date().toISOString() })
    audit(db, user.email, 'ai.brief', out.provider)
    save(db)
    res.json({ ...out, credits: user.credits })
  } catch (e) {
    res.status(502).json({ error: e.message || 'AI failed' })
  }
})

app.get('/api/studio', auth, (req, res) => {
  const user = me(req)
  res.json({
    credits: user?.credits ?? 0,
    plan: user?.plan,
    chats: db.chats.filter((c) => c.user === req.user.email).slice(0, 20),
  })
})

app.post('/api/billing/checkout', auth, (req, res) => {
  const plan = PLANS[req.body?.plan]
  if (!plan || plan.bdt <= 0) return res.status(400).json({ error: 'পেইড প্ল্যান বাছুন' })
  const order = {
    id: id('ord'),
    email: req.user.email,
    plan: plan.id,
    amount: plan.bdt,
    credits: plan.credits,
    method: req.body?.method || 'bkash',
    status: 'pending',
    at: new Date().toISOString(),
    trx: req.body?.trx || '',
  }
  db.orders.unshift(order)
  audit(db, req.user.email, 'order.create', plan.id)
  save(db)
  res.json({
    order,
    pay: {
      bkash: '01300000000',
      nagad: '01700000000',
      note: 'ট্রান্সফার করে ট্রানজেকশন আইডি দিন — অ্যাডমিন কনফার্ম করলে ক্রেডিট যাবে।',
    },
  })
})

app.post('/api/billing/trx', auth, (req, res) => {
  const order = db.orders.find((o) => o.id === req.body?.id && o.email === req.user.email)
  if (!order) return res.status(404).json({ error: 'অর্ডার নেই' })
  order.trx = req.body.trx
  save(db)
  res.json(order)
})

app.post('/api/billing/confirm', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const order = db.orders.find((o) => o.id === req.body?.id)
  if (!order) return res.status(404).json({ error: 'অর্ডার নেই' })
  order.status = 'paid'
  const user = db.users.find((u) => u.email === order.email)
  if (user) {
    user.plan = order.plan
    user.credits = (user.credits || 0) + order.credits
  }
  audit(db, req.user.email, 'order.paid', order.id)
  save(db)
  res.json(order)
})

app.get('/api/billing/orders', auth, (req, res) => {
  const mine = db.orders.filter((o) => o.email === req.user.email)
  res.json({ orders: req.user.role === 'admin' ? db.orders : mine })
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'সব ঘর পূরণ করুন' })
  db.messages.unshift({ id: id('m'), name, email, message, at: new Date().toISOString() })
  save(db)
  res.json({ ok: true })
})

app.get('/api/stats', (_req, res) => {
  res.json({ visitors: 18420 + db.audit.length, projects: db.projects.length, uptime: 99.98 })
})
app.get('/api/services', (_req, res) => {
  res.json([
    { id: 'ai', title: 'কপিলট স্টুডিও', en: 'AI Studio', desc: 'লাইভ ERP ডেটা থেকে ব্রিফ — লোকাল কপিলট সবসময় চলে।' },
    { id: 'mbp', title: 'বিজনেস OS', en: 'Business OS', desc: 'CRM, ইনভয়েস, স্টক, HR — এখনই লগইন করে ব্যবহার করুন।' },
    { id: 'bill', title: 'ক্রেডিট বিলিং', en: 'Credits', desc: 'bKash/Nagad অর্ডার + অ্যাডমিন কনফার্ম।' },
    { id: 'auth', title: 'ডেমো সেশন', en: 'Password login', desc: 'admin@microsys.local · Microsys@2026' },
  ])
})

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => err && next())
})

export default app
