const SYSTEM =
  'You are ImageForge AI, a neuro-marketing strategist. Concise, bilingual Bengali/English when useful. Only digital marketing assets. Never invent secrets, fake testimonials, or physical inventory. If context is missing, ask one sharp question then still give a useful first draft.'

const ORDER = ['groq', 'cerebras', 'openrouter', 'nararouter', 'gemini']

function envKey(name) {
  const map = {
    groq: process.env.GROQ_API_KEY,
    cerebras: process.env.CEREBRAS_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    nararouter: process.env.NARAROUTER_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  }
  return (map[name] || '').trim()
}

export function providersStatus() {
  return {
    groq: Boolean(envKey('groq')),
    cerebras: Boolean(envKey('cerebras')),
    openrouter: Boolean(envKey('openrouter')),
    nararouter: Boolean(envKey('nararouter')),
    gemini: Boolean(envKey('gemini')),
  }
}

export function liveProviderCount() {
  return Object.values(providersStatus()).filter(Boolean).length
}

async function openaiCompat({ url, key, model, extraHeaders = {}, messages }) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 28000)
  try {
    const r = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages, temperature: 0.55, max_tokens: 1400 }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      const msg = j.error?.message || j.message || j.error || `HTTP ${r.status}`
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
    const text = j.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty completion')
    return text
  } finally {
    clearTimeout(timer)
  }
}

async function gemini({ key, messages }) {
  const prompt = messages.map((m) => `${m.role.toUpperCase()}:\n${m.content}`).join('\n\n')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 28000)
  try {
    const r = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.55, maxOutputTokens: 1400 },
      }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error?.message || `Gemini HTTP ${r.status}`)
    const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')
    if (!text) throw new Error('Empty Gemini response')
    return text
  } finally {
    clearTimeout(timer)
  }
}

const CATALOG = {
  groq: (messages) =>
    openaiCompat({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: envKey('groq'),
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages,
    }),
  cerebras: (messages) =>
    openaiCompat({
      url: 'https://api.cerebras.ai/v1/chat/completions',
      key: envKey('cerebras'),
      model: process.env.CEREBRAS_MODEL || 'llama3.1-8b',
      messages,
    }),
  openrouter: (messages) =>
    openaiCompat({
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: envKey('openrouter'),
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      extraHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'https://imageforge-ai.vercel.app',
        'X-Title': 'ImageForge AI',
      },
      messages,
    }),
  nararouter: (messages) =>
    openaiCompat({
      url: 'https://router.naraya.ai/v1/chat/completions',
      key: envKey('nararouter'),
      model: process.env.NARAROUTER_MODEL || 'deepseek-3.2',
      messages,
    }),
  gemini: (messages) => gemini({ key: envKey('gemini'), messages }),
}

export async function complete({ provider = 'auto', prompt, system, context }) {
  const q = String(prompt || '').trim()
  if (!q) throw new Error('প্রম্পট খালি')

  const messages = [
    { role: 'system', content: system || SYSTEM },
    {
      role: 'user',
      content: context ? `${q}\n\nCONTEXT:\n${typeof context === 'string' ? context : JSON.stringify(context)}` : q,
    },
  ]

  if (provider === 'local') {
    throw new Error('লোকাল ডেমো বন্ধ। একটি লাইভ প্রোভাইডার বাছুন অথবা auto ব্যবহার করুন।')
  }

  const status = providersStatus()
  const wanted = provider && provider !== 'auto' ? [provider] : ORDER.filter((name) => status[name])

  if (!wanted.length) {
    throw new Error('কোনো AI কী সেট নেই। Vercel Environment Variables-এ GROQ/OPENROUTER/GEMINI ইত্যাদি দিন।')
  }

  const errors = []
  for (const name of wanted) {
    const fn = CATALOG[name]
    if (!fn) {
      errors.push(`${name}: unknown`)
      continue
    }
    if (!status[name]) {
      errors.push(`${name}: no key`)
      continue
    }
    try {
      const text = await fn(messages)
      return { provider: name, text, live: true }
    } catch (e) {
      errors.push(`${name}: ${e.name === 'AbortError' ? 'timeout' : e.message}`)
    }
  }

  throw new Error(`লাইভ প্রোভাইডার ব্যর্থ — ${errors.join(' | ')}`)
}
