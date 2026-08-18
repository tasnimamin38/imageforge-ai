const TOKEN_KEY = 'if_token'
const USER_KEY = 'if_user'

export function token() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('mbp_token')
}

export function saveSession(tok, user) {
  localStorage.setItem(TOKEN_KEY, tok)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.removeItem('mbp_token')
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem('mbp_token')
  localStorage.removeItem('mbp_user')
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || localStorage.getItem('mbp_user') || '{}')
  } catch {
    return {}
  }
}

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token()) headers.Authorization = `Bearer ${token()}`
  const res = await fetch(path, { ...opts, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
