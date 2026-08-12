import { Navigate, Route, Routes } from 'react-router-dom'
import Marketing from './Marketing'
import Login from './mbp/Login'
import Shell from './mbp/Shell'
import Dashboard from './mbp/Dashboard'
import Crm from './mbp/Crm'
import Inventory from './mbp/Inventory'
import Finance from './mbp/Finance'
import Hr from './mbp/Hr'
import Projects from './mbp/Projects'
import Settings from './mbp/Settings'
import Studio from './mbp/Studio'
import Billing from './mbp/Billing'
import OAuth from './OAuth'
import { token } from './api'

function Guard({ children }) {
  if (!token()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Marketing />} />
      <Route path="/login" element={<Login />} />
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
        <Route path="billing" element={<Billing />} />
        <Route path="crm" element={<Crm />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="finance" element={<Finance />} />
        <Route path="hr" element={<Hr />} />
        <Route path="projects" element={<Projects />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
