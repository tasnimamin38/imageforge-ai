import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'

const links = [
  ['', 'কমান্ড'],
  ['crm', 'CRM'],
  ['inventory', 'ইনভেন্টরি'],
  ['finance', 'ফাইন্যান্স'],
  ['hr', 'HR'],
  ['projects', 'প্রজেক্ট'],
  ['settings', 'কন্ট্রোল'],
]

export default function Shell() {
  const nav = useNavigate()
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('mbp_user') || '{}') } catch { return {} }
  }, [])

  function out() {
    localStorage.removeItem('mbp_token')
    localStorage.removeItem('mbp_user')
    nav('/login')
  }

  return (
    <div className="mbp">
      <aside>
        <div className="brand"><div className="logo" /> MBP</div>
        {links.map(([to, label]) => (
          <NavLink key={to || 'home'} end={to === ''} to={to ? `/app/${to}` : '/app'}>{label}</NavLink>
        ))}
        <button type="button" className="out" onClick={out}>সাইন আউট</button>
      </aside>
      <main>
        <header className="mbp-top">
          <div>
            <strong>{user.name}</strong>
            <span>{user.role} · {user.dept || 'Microsys'}</span>
          </div>
          <em>TENANT · microsys-prod</em>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
