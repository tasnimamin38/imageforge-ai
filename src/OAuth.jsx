import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, saveSession } from './api'

export default function OAuth() {
  const nav = useNavigate()
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace('#', ''))
    const tok = hash.get('token')
    if (!tok) {
      nav('/login?err=oauth')
      return
    }
    saveSession(tok)
    api('/api/me')
      .then((user) => {
        saveSession(tok, user)
        nav('/app/studio')
      })
      .catch(() => nav('/login?err=oauth'))
  }, [nav])
  return (
    <div className="login-wrap">
      <p>গুগল সেশন খুলছে…</p>
    </div>
  )
}
