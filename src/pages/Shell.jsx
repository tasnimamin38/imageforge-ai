import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClerkControls, clerkEnabled, useClerkProfile } from '../clerkAuth'
import { clearSession, currentUser } from '../api'

const links = [
  ['', 'ওভারভিউ'],
  ['studio', 'স্টুডিও'],
  ['catalog', 'ডিজিটাল শপ'],
  ['campaigns', 'ক্যাম্পেইন'],
  ['clients', 'ক্লায়েন্ট'],
  ['library', 'লাইব্রেরি'],
  ['billing', 'বিলিং'],
  ['settings', 'সেটিংস'],
]

function Identity() {
  const clerk = useClerkProfile()
  const user = clerk || currentUser()
  return (
    <div>
      <strong>{user.name || 'মেম্বার'}</strong>
      <span>{user.role || 'member'} · {user.plan || 'spark'} · {user.email || ''}</span>
    </div>
  )
}

export default function Shell() {
  const nav = useNavigate()

  function out() {
    clearSession()
    nav('/login')
  }

  return (
    <div className="mbp">
      <aside>
        <div className="brand"><div className="logo" /> Forge</div>
        {links.map(([to, label]) => (
          <NavLink key={to || 'home'} end={to === ''} to={to ? `/app/${to}` : '/app'}>{label}</NavLink>
        ))}
        {clerkEnabled ? <div className="pad-sm"><ClerkControls compact /></div> : <button type="button" className="out" onClick={out}>সাইন আউট</button>}
      </aside>
      <main>
        <header className="mbp-top">
          <Identity />
          <em>DIGITAL · NEURO</em>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
