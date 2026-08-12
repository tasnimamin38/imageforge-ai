import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

export default function OAuth() {
  const nav = useNavigate()
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace('#', ''))
    const token = hash.get('token')
    if (!token) {
      nav('/login?err=oauth')
      return
    }
    localStorage.setItem('mbp_token', token)
    api('/api/me')
      .then((user) => {
        localStorage.setItem('mbp_user', JSON.stringify(user))
        nav('/app/studio')
      })
      .catch(() => nav('/login?err=oauth'))
  }, [nav])
  return <div className="login-wrap"><p>গুগল সেশন খুলছে…</p></div>
}
