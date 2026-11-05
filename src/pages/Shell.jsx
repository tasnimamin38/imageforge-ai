import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClerkControls, clerkEnabled, useClerkProfile } from '../clerkAuth'
import { clearSession, currentUser } from '../api'

const links = [
  ['', 'ড্যাশবোর্ড'],
  ['studio', 'স্টুডিও'],
  ['catalog', 'ডিজিটাল স্টোর'],
  ['campaigns', 'প্রচারাভিযান'],
  ['clients', 'গ্রাহক'],
  ['library', 'সংগ্রহশালা'],
  ['billing', 'পেমেন্ট ও বিলিং'],
  ['settings', 'সেটিংস'],
]

function Identity() {
  const clerk = useClerkProfile()
  const user = clerk || currentUser()
  return (
    <div>
      <strong>{user.name || 'মেম্বার'}</strong>
      <span>{user.role || 'সদস্য'} · {user.plan || 'স্পার্ক'} · {user.email || ''}</span>
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
        {clerkEnabled ? <div className="pad-sm"><ClerkControls compact /></div> : <button type="button" className="out" onClick={out}>লগআউট</button>}
      </aside>
      <main>
        <header className="mbp-top">
          <Identity />
          <em>ডিজিটাল · নিউরো</em>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
