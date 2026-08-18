import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { loadEnv } from './loadEnv.js'
import { load, save, audit, id } from './store.js'
import { complete, providersStatus, liveProviderCount } from './ai.js'
import { PLANS } from './plans.js'
import { PRODUCTS, productById, TOOL_SYSTEM } from './catalog.js'

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const JWT = process.env.JWT_SECRET || 'imageforge-change-this-in-production'
const GOOGLE_ID = (process.env.GOOGLE_CLIENT_ID || '').trim()
const GOOGLE_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim()
const PAY = {
  bkash: (process.env.PAY_BKASH || '').trim(),
  nagad: (process.env.PAY_NAGAD || '').trim(),
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

let db = load()

function publicOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  const host = req.get('host') || ''
  if (host.includes('vercel.app')) return `https://${host}`
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}`
}

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT, { expiresIn: '7d' })
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

function emailOk(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function createUser({ name, email, password, provider }) {
  const role = db.users.length === 0 ? 'admin' : 'member'
  const user = {
    id: id('u'),
    name: String(name || email.split('@')[0]).trim().slice(0, 80),
    email: email.toLowerCase().trim(),
    password: password ? bcrypt.hashSync(password, 10) : null,
    role,
    plan: 'spark',
    credits: PLANS.spark.credits,
    packs: [],
    provider: provider || 'password',
    createdAt: new Date().toISOString(),
  }
  db.users.unshift(user)
  audit(db, user.email, 'auth.signup', role)
  save(db)
  return user
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    product: 'ImageForge AI',
    version: '4.0.0',
    google: Boolean(GOOGLE_ID && GOOGLE_SECRET),
    ai: providersStatus(),
    liveProviders: liveProviderCount(),
  })
})

app.get('/api/plans', (_req, res) => res.json(Object.values(PLANS)))
app.get('/api/catalog', (_req, res) => res.json(PRODUCTS))

app.get('/api/stats', (_req, res) => {
  res.json({
    members: db.users.length,
    campaigns: db.campaigns.length,
    generations: db.chats.length,
    liveProviders: liveProviderCount(),
  })
})

app.get('/api/services', (_req, res) => {
  res.json(
    PRODUCTS.filter((p) => p.kind === 'tool').map((p) => ({
      id: p.id,
      title: p.bn,
      en: p.name,
      desc: p.blurb,
    })),
  )
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {}
  if (!emailOk(email)) return res.status(400).json({ error: 'সঠিক ইমেইল দিন' })
  if (!password || String(password).length < 8) return res.status(400).json({ error: 'পাসওয়ার্ড অন্তত ৮ অক্ষর' })
  if (db.users.some((u) => u.email === String(email).toLowerCase().trim())) {
    return res.status(409).json({ error: 'এই ইমেইলে অ্যাকাউন্ট আছে — লগইন করুন' })
  }
  const user = createUser({ name, email, password, provider: 'password' })
  res.json({ token: signUser(user), user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.users.find((u) => u.email === String(email || '').toLowerCase().trim())
  if (!user || !user.password || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' })
  }
  audit(db, user.email, 'auth.login', 'password')
  save(db)
  res.json({ token: signUser(user), user: publicUser(user) })
})

app.get('/api/auth/google', (req, res) => {
  const origin = publicOrigin(req)
  if (!GOOGLE_ID || !GOOGLE_SECRET) {
    return res.redirect(302, `${origin}/login?err=google-off`)
  }
  const redirectUri = `${origin}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: GOOGLE_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

app.get('/api/auth/google/callback', async (req, res) => {
  const origin = publicOrigin(req)
  try {
    if (!GOOGLE_ID || !GOOGLE_SECRET) throw new Error('google-off')
    const code = req.query.code
    if (!code) throw new Error('no-code')
    const redirectUri = `${origin}/api/auth/google/callback`
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_ID,
        client_secret: GOOGLE_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error(tokens.error || 'token')
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()
    if (!profile.email) throw new Error('no-email')
    let user = db.users.find((u) => u.email === profile.email.toLowerCase())
    if (!user) {
      user = createUser({
        name: profile.name || profile.email,
        email: profile.email,
        password: null,
        provider: 'google',
      })
    }
    audit(db, user.email, 'auth.login', 'google')
    save(db)
    res.redirect(`${origin}/oauth#token=${encodeURIComponent(signUser(user))}`)
  } catch {
    res.redirect(`${origin}/login?err=google`)
  }
})

app.get('/api/me', auth, (req, res) => res.json(publicUser(me(req) || req.user)))

app.patch('/api/me', auth, (req, res) => {
  const user = me(req)
  if (!user) return res.status(404).json({ error: 'User missing' })
  if (req.body?.name) user.name = String(req.body.name).trim().slice(0, 80)
  if (req.body?.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ error: 'পাসওয়ার্ড অন্তত ৮ অক্ষর' })
    user.password = bcrypt.hashSync(req.body.password, 10)
  }
  save(db)
  res.json(publicUser(user))
})

app.get('/api/dashboard', auth, (req, res) => {
  const user = me(req)
  const mine = (list, key = 'owner') => list.filter((x) => x[key] === req.user.email || x.user === req.user.email)
  const chats = mine(db.chats, 'user')
  const campaigns = mine(db.campaigns)
  const orders = mine(db.orders, 'email')
  res.json({
    kpis: {
      credits: user?.credits ?? 0,
      plan: user?.plan || 'spark',
      campaigns: campaigns.length,
      generations: chats.length,
      clients: mine(db.clients).length,
      library: mine(db.library, 'user').length,
      spent: orders.filter((o) => o.status === 'paid').reduce((s, o) => s + (o.amount || 0), 0),
    },
    series: lastDays(chats),
    campaigns: campaigns.slice(0, 6),
    recent: chats.slice(0, 6),
    providers: providersStatus(),
    liveProviders: liveProviderCount(),
    audit: db.audit.filter((a) => a.actor === req.user.email || req.user.role === 'admin').slice(0, 8),
  })
})

function lastDays(chats) {
  const days = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (11 - i))
    const key = d.toISOString().slice(0, 10)
    return { key: key.slice(5), n: chats.filter((c) => (c.at || '').startsWith(key)).length }
  })
  return days
}

app.get('/api/clients', auth, (req, res) => {
  res.json({ clients: db.clients.filter((c) => c.owner === req.user.email || req.user.role === 'admin') })
})

app.post('/api/clients', auth, (req, res) => {
  const { name, niche, offer } = req.body || {}
  if (!name) return res.status(400).json({ error: 'ক্লায়েন্ট নাম দিন' })
  const row = {
    id: id('cl'),
    name: String(name).trim(),
    niche: String(niche || '').trim(),
    offer: String(offer || '').trim(),
    owner: req.user.email,
    at: new Date().toISOString(),
  }
  db.clients.unshift(row)
  audit(db, req.user.email, 'client.create', row.name)
  save(db)
  res.json(row)
})

app.get('/api/campaigns', auth, (req, res) => {
  res.json({ campaigns: db.campaigns.filter((c) => c.owner === req.user.email || req.user.role === 'admin') })
})

app.post('/api/campaigns', auth, (req, res) => {
  const { name, goal, channel, clientId } = req.body || {}
  if (!name) return res.status(400).json({ error: 'ক্যাম্পেইন নাম দিন' })
  const row = {
    id: id('cp'),
    name: String(name).trim(),
    goal: String(goal || '').trim(),
    channel: String(channel || 'Meta').trim(),
    clientId: clientId || null,
    status: 'active',
    owner: req.user.email,
    at: new Date().toISOString(),
  }
  db.campaigns.unshift(row)
  audit(db, req.user.email, 'campaign.create', row.name)
  save(db)
  res.json(row)
})

app.patch('/api/campaigns/:id', auth, (req, res) => {
  const p = db.campaigns.find((x) => x.id === req.params.id && (x.owner === req.user.email || req.user.role === 'admin'))
  if (!p) return res.status(404).json({ error: 'Not found' })
  if (req.body?.status) p.status = req.body.status
  if (req.body?.name) p.name = req.body.name
  save(db)
  res.json(p)
})

app.get('/api/library', auth, (req, res) => {
  res.json({ items: db.library.filter((x) => x.user === req.user.email) })
})

app.get('/api/studio', auth, (req, res) => {
  const user = me(req)
  res.json({
    credits: user?.credits ?? 0,
    plan: user?.plan,
    packs: user?.packs || [],
    tools: PRODUCTS.filter((p) => p.kind === 'tool'),
    chats: db.chats.filter((c) => c.user === req.user.email).slice(0, 30),
    providers: providersStatus(),
  })
})

async function runGenerate(req, res) {
  const user = me(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const toolId = req.body?.tool || req.body?.product || 'neuro-ads'
  const product = productById(toolId) || PRODUCTS[0]
  const cost = product.kind === 'tool' ? product.credits : 3
  if (user.credits < cost) return res.status(402).json({ error: 'ক্রেডিট শেষ — Pulse প্ল্যান নিন অথবা প্যাক কিনুন' })
  const prompt = String(req.body?.prompt || '').trim()
  if (prompt.length < 4) return res.status(400).json({ error: 'ব্রিফ আরও স্পষ্ট করুন' })
  const provider = req.body?.provider || 'auto'
  const campaignId = req.body?.campaignId || null
  const system = TOOL_SYSTEM[product.id] || TOOL_SYSTEM.brief
  const context = {
    tool: product.name,
    campaign: db.campaigns.find((c) => c.id === campaignId && c.owner === req.user.email) || null,
    brand: req.body?.brand || null,
  }
  try {
    const out = await complete({ provider, prompt, system, context })
    user.credits -= cost
    const rec = {
      id: id('ch'),
      user: user.email,
      tool: product.id,
      prompt,
      text: out.text,
      provider: out.provider,
      campaignId,
      at: new Date().toISOString(),
    }
    db.chats.unshift(rec)
    db.library.unshift({
      id: id('lib'),
      user: user.email,
      title: `${product.bn} · ${prompt.slice(0, 48)}`,
      tool: product.id,
      text: out.text,
      at: rec.at,
    })
    audit(db, user.email, 'ai.generate', `${product.id}:${out.provider}`)
    save(db)
    res.json({ ...out, credits: user.credits, cost, tool: product.id, id: rec.id })
  } catch (e) {
    res.status(502).json({ error: e.message || 'AI failed' })
  }
}

app.post('/api/ai/generate', auth, runGenerate)
app.get('/api/ai/providers', auth, (_req, res) => res.json(providersStatus()))
app.post('/api/ai/brief', auth, (req, res) => {
  req.body = { ...(req.body || {}), tool: req.body?.tool || 'neuro-ads' }
  return runGenerate(req, res)
})

app.post('/api/billing/checkout', auth, (req, res) => {
  const plan = PLANS[req.body?.plan]
  const pack = productById(req.body?.pack)
  let amount = 0
  let credits = 0
  let label = ''
  let kind = 'plan'
  if (plan && plan.bdt > 0) {
    amount = plan.bdt
    credits = plan.credits
    label = plan.id
  } else if (pack && pack.kind === 'pack' && pack.price > 0) {
    amount = pack.price
    credits = pack.bonusCredits || 0
    label = pack.id
    kind = 'pack'
  } else {
    return res.status(400).json({ error: 'পেইড প্ল্যান বা ডিজিটাল প্যাক বাছুন' })
  }
  const order = {
    id: id('ord'),
    email: req.user.email,
    plan: kind === 'plan' ? label : me(req)?.plan,
    pack: kind === 'pack' ? label : null,
    kind,
    amount,
    credits,
    method: req.body?.method || 'bkash',
    status: 'pending',
    at: new Date().toISOString(),
    trx: req.body?.trx || '',
  }
  db.orders.unshift(order)
  audit(db, req.user.email, 'order.create', label)
  save(db)
  res.json({
    order,
    pay: {
      bkash: PAY.bkash || null,
      nagad: PAY.nagad || null,
      note: PAY.bkash || PAY.nagad
        ? 'bKash/Nagad-এ সেন্ড মানি করে ট্রানজেকশন আইডি দিন। অ্যাডমিন কনফার্ম করলে ডিজিটাল আনলক + ক্রেডিট যাবে।'
        : 'পেমেন্ট নম্বর এখনো সেট হয়নি — Vercel-এ PAY_BKASH / PAY_NAGAD দিন।',
    },
  })
})

app.post('/api/billing/trx', auth, (req, res) => {
  const order = db.orders.find((o) => o.id === req.body?.id && o.email === req.user.email)
  if (!order) return res.status(404).json({ error: 'অর্ডার নেই' })
  const trx = String(req.body?.trx || '').trim()
  if (trx.length < 5) return res.status(400).json({ error: 'ট্রানজেকশন আইডি দিন' })
  order.trx = trx
  save(db)
  res.json(order)
})

function fulfill(order) {
  const user = db.users.find((u) => u.email === order.email)
  if (!user) return
  if (order.kind === 'plan' && order.plan) user.plan = order.plan
  if (order.pack) user.packs = Array.from(new Set([...(user.packs || []), order.pack]))
  user.credits = (user.credits || 0) + (order.credits || 0)
  order.status = 'paid'
}

app.post('/api/billing/confirm', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const order = db.orders.find((o) => o.id === req.body?.id)
  if (!order) return res.status(404).json({ error: 'অর্ডার নেই' })
  fulfill(order)
  audit(db, req.user.email, 'order.paid', order.id)
  save(db)
  res.json(order)
})

app.get('/api/billing/orders', auth, (req, res) => {
  const mine = db.orders.filter((o) => o.email === req.user.email)
  res.json({ orders: req.user.role === 'admin' ? db.orders : mine })
})

app.get('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  res.json({ users: db.users.map(publicUser), audit: db.audit.slice(0, 50), orders: db.orders })
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'সব ঘর পূরণ করুন' })
  db.messages.unshift({ id: id('m'), name, email, message, at: new Date().toISOString() })
  save(db)
  res.json({ ok: true })
})

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => err && next())
})

export default app
