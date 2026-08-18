import { Navigate, Route, Routes } from 'react-router-dom'
import Marketing from './Marketing'
import Auth from './pages/Auth'
import Shell from './pages/Shell'
import Dashboard from './pages/Dashboard'
import Studio from './pages/Studio'
import Catalog from './pages/Catalog'
import Campaigns from './pages/Campaigns'
import Clients from './pages/Clients'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Library from './pages/Library'
import OAuth from './OAuth'
import { token } from './api'
import { clerkEnabled, ClerkGuard, ClerkSignInPage, ClerkSignUpPage } from './clerkAuth'

function Guard({ children }) {
  if (clerkEnabled) return <ClerkGuard>{children}</ClerkGuard>
  if (!token()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Marketing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="/sign-in/*" element={<ClerkSignInPage />} />
      <Route path="/sign-up/*" element={<ClerkSignUpPage />} />
      <Route path="/oauth" element={<OAuth />} />
      <Route
        path="/app"
        element={(
          <Guard>
            <Shell />
          </Guard>
        )}
      >
        <Route index element={<Dashboard />} />
        <Route path="studio" element={<Studio />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="clients" element={<Clients />} />
        <Route path="library" element={<Library />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
