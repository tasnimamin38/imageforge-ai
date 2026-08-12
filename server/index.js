import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { loadEnv } from './loadEnv.js'
import { load, save, audit, id } from './store.js'
import { complete, providersStatus } from './ai.js'

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8787
const JWT = process.env.JWT_SECRET || 'microsys-mbp-dev-secret-change-in-prod'

app.use(cors())
app.use(express.json())

let db = load()

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
  const { password, ...rest } = u
  return rest
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    product: 'Microsys MBP',
    version: '2.0.0',
    ai: providersStatus(),
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.users.find((u) => u.email === email)
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' })
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT, { expiresIn: '12h' })
  audit(db, user.email, 'login', 'Session issued')
  save(db)
  res.json({ token, user: publicUser(user) })
})

app.get('/api/me', auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id)
  res.json(publicUser(user || req.user))
})

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
  res.json({ users: db.users.map(publicUser), audit: db.audit.slice(0, 40) })
})

app.get('/api/ai/providers', auth, (_req, res) => {
  res.json(providersStatus())
})

app.post('/api/ai/brief', auth, async (req, res) => {
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
    audit(db, req.user.email, 'ai.brief', out.provider)
    save(db)
    res.json(out)
  } catch (e) {
    res.status(502).json({ error: e.message || 'AI failed' })
  }
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
    { id: 'mbp', title: 'এমবিপি স্যুট', en: 'Enterprise MBP', desc: 'ফাইন্যান্স, CRM, ইনভেন্টরি, HR ও প্রজেক্ট — এক টেনান্টে।' },
    { id: 'ai', title: 'কপিলট', en: 'AI Copilot', desc: 'ওপেনএআই কী দিলে লাইভ ব্রিফ; নাহলে লোকাল ইন্টেলিজেন্স।' },
    { id: 'cloud', title: 'কন্ট্রোল প্লেন', en: 'Control Plane', desc: 'JWT, রোল, অডিট লগ, মাল্টি-ইউজার।' },
    { id: 'brand', title: 'ইমার্সিভ শেল', en: 'Immersive Shell', desc: 'থ্রিডি কমান্ড সেন্টার ও লাইভ অ্যানিমেশন।' },
  ])
})

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => err && next())
})

app.listen(PORT, '0.0.0.0', () => console.log(`Microsys MBP API :${PORT}`))
