import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClerkControls, clerkEnabled, useClerkProfile } from '../clerkAuth'

const links = [
  ['', 'কমান্ড'],
  ['studio', 'স্টুডিও'],
  ['billing', 'বিলিং'],
  ['crm', 'CRM'],
  ['inventory', 'ইনভেন্টরি'],
  ['finance', 'ফাইন্যান্স'],
  ['hr', 'HR'],
  ['projects', 'প্রজেক্ট'],
  ['settings', 'কন্ট্রোল'],
]

function LocalIdentity() {
  let user = {}
  try { user = JSON.parse(localStorage.getItem('mbp_user') || '{}') } catch { /* ignore */ }
  return (
    <div>
      <strong>{user.name || 'গেস্ট'}</strong>
      <span>{user.role} · {user.dept || 'Microsys'}</span>
    </div>
  )
}

function ClerkIdentity() {
  const user = useClerkProfile() || {}
  return (
    <div>
      <strong>{user.name || 'মেম্বার'}</strong>
      <span>{user.email || 'Clerk'}</span>
    </div>
  )
}

export default function Shell() {
  const nav = useNavigate()

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
        {clerkEnabled ? <div className="pad-sm"><ClerkControls compact /></div> : <button type="button" className="out" onClick={out}>সাইন আউট</button>}
      </aside>
      <main>
        <header className="mbp-top">
          {clerkEnabled ? <ClerkIdentity /> : <LocalIdentity />}
          <em>TENANT · microsys-prod</em>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
