import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import App from './App'
import './styles.css'
import './mbp.css'

const pk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {pk ? (
      <ClerkProvider publishableKey={pk} afterSignOutUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
        {tree}
      </ClerkProvider>
    ) : tree}
  </React.StrictMode>
)
