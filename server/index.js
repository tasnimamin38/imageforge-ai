import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8787

app.use(cors())
app.use(express.json())

const messages = []
const stats = { visitors: 12840, projects: 86, uptime: 99.98 }

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, brand: 'মাইক্রোসাস', name: 'Microsys' })
})

app.get('/api/stats', (_req, res) => {
  stats.visitors += Math.floor(Math.random() * 3)
  res.json(stats)
})

app.get('/api/services', (_req, res) => {
  res.json([
    { id: 'web', title: 'ইমার্সিভ ওয়েব', en: 'Immersive Web', desc: 'থ্রিডি, মোশন ও পারফরম্যান্স-ফার্স্ট প্রোডাক্ট সাইট।' },
    { id: 'ai', title: 'এআই সিস্টেম', en: 'AI Systems', desc: 'কাস্টম মডেল, অটোমেশন ও ইন্টেলিজেন্ট ওয়ার্কফ্লো।' },
    { id: 'cloud', title: 'ক্লাউড প্ল্যাটফর্ম', en: 'Cloud Platforms', desc: 'স্কেলেবল API, ড্যাশবোর্ড ও ইনফ্রাস্ট্রাকচার।' },
    { id: 'brand', title: 'ডিজিটাল ব্র্যান্ড', en: 'Digital Brand', desc: 'আইডেন্টিটি, মোশন সিস্টেম ও লাইভ ক্যাম্পেইন।' },
  ])
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {}
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'সব ঘর পূরণ করুন' })
  }
  const entry = { id: Date.now(), name, email, message, at: new Date().toISOString() }
  messages.unshift(entry)
  res.json({ ok: true, id: entry.id })
})

app.get('/api/messages', (_req, res) => {
  res.json({ count: messages.length, items: messages.slice(0, 20) })
})

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next()
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Microsys API on :${PORT}`)
})
