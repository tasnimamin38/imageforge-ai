const SYSTEM = 'You are Microsys MBP copilot. Concise, bilingual Bengali/English, executive tone. Use the ERP snapshot. Never invent secrets.'

async function openaiCompat({ url, key, model, extraHeaders = {}, messages }) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 700 }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = j.error?.message || j.message || `HTTP ${r.status}`
    throw new Error(msg)
  }
  const text = j.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty completion')
  return text
}

async function gemini({ key, messages }) {
  const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error?.message || `Gemini HTTP ${r.status}`)
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') 
  if (!text) throw new Error('Empty Gemini response')
  return text
}

export function providersStatus() {
  return {
    groq: Boolean(process.env.GROQ_API_KEY),
    cerebras: Boolean(process.env.CEREBRAS_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    nararouter: Boolean(process.env.NARAROUTER_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
  }
}

const ORDER = ['groq', 'cerebras', 'openrouter', 'nararouter', 'gemini']

export async function complete({ provider = 'auto', prompt, snapshot }) {
  const messages = [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `${prompt}\n\nERP SNAPSHOT:\n${JSON.stringify(snapshot)}` },
  ]
  const catalog = {
    groq: () => openaiCompat({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      messages,
    }),
    cerebras: () => openaiCompat({
      url: 'https://api.cerebras.ai/v1/chat/completions',
      key: process.env.CEREBRAS_API_KEY,
      model: 'llama3.1-8b',
      messages,
    }),
    openrouter: () => openaiCompat({
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      model: 'openai/gpt-4o-mini',
      extraHeaders: { 'HTTP-Referer': 'https://microsys.local', 'X-Title': 'Microsys MBP' },
      messages,
    }),
    nararouter: () => openaiCompat({
      url: 'https://router.naraya.ai/v1/chat/completions',
      key: process.env.NARAROUTER_API_KEY,
      model: 'deepseek-3.2',
      messages,
    }),
    gemini: () => gemini({ key: process.env.GEMINI_API_KEY, messages }),
  }

  const wanted = provider && provider !== 'auto' ? [provider] : ORDER
  const errors = []
  for (const name of wanted) {
    const fn = catalog[name]
    if (!fn) {
      errors.push(`${name}: unknown`)
      continue
    }
    const ready = providersStatus()[name]
    if (!ready) {
      errors.push(`${name}: no key`)
      continue
    }
    try {
      const text = await fn()
      return { provider: name, text }
    } catch (e) {
      errors.push(`${name}: ${e.message}`)
    }
  }
  return { provider: 'local', text: `সব আপস্ট্রিম ব্যর্থ। ${errors.join(' | ')}` }
}
