export function token() {
  return localStorage.getItem('mbp_token')
}

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token()) headers.Authorization = `Bearer ${token()}`
  const res = await fetch(path, { ...opts, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
