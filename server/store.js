import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = process.env.VERCEL ? '/tmp/imageforge-data.json' : path.join(__dirname, 'data.json')

const now = () => new Date().toISOString()
const id = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

function empty() {
  return {
    users: [],
    clients: [],
    campaigns: [],
    library: [],
    invoices: [],
    orders: [],
    chats: [],
    messages: [],
    audit: [{ at: now(), actor: 'system', action: 'boot', detail: 'ImageForge empty tenant' }],
  }
}

export function load() {
  try {
    if (!fs.existsSync(DATA)) {
      const s = empty()
      try {
        fs.writeFileSync(DATA, JSON.stringify(s, null, 2))
      } catch {
        /* ephemeral / read-only */
      }
      return s
    }
    const parsed = JSON.parse(fs.readFileSync(DATA, 'utf8'))
    return {
      ...empty(),
      ...parsed,
      users: parsed.users || [],
      clients: parsed.clients || [],
      campaigns: parsed.campaigns || [],
      library: parsed.library || [],
      invoices: parsed.invoices || [],
      orders: parsed.orders || [],
      chats: parsed.chats || [],
      messages: parsed.messages || [],
      audit: parsed.audit || [],
    }
  } catch {
    return empty()
  }
}

export function save(db) {
  try {
    fs.writeFileSync(DATA, JSON.stringify(db, null, 2))
  } catch {
    /* ephemeral */
  }
}

export function audit(db, actor, action, detail) {
  db.audit.unshift({ at: now(), actor, action, detail })
  db.audit = db.audit.slice(0, 300)
}

export { id, now }
