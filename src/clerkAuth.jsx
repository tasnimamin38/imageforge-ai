import { Show, SignIn, SignInButton, SignUp, SignUpButton, UserButton, useAuth, useUser } from '@clerk/react'
import { Navigate } from 'react-router-dom'

export const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function ClerkControls({ compact }) {
  if (!clerkEnabled) return null
  return (
    <div className={`clerk-bar ${compact ? 'compact' : ''}`}>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className="btn ghost">সাইন ইন</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className="btn primary">সাইন আপ</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton afterSignOutUrl="/" />
      </Show>
    </div>
  )
}

export function ClerkGuard({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <div className="login-wrap"><p>সেশন চেক…</p></div>
  if (isSignedIn || localStorage.getItem('mbp_token')) return children
  return <Navigate to="/login" replace />
}

export function ClerkSignInPage() {
  if (!clerkEnabled) return <Navigate to="/login" replace />
  return (
    <div className="login-wrap">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/app" />
    </div>
  )
}

export function ClerkSignUpPage() {
  if (!clerkEnabled) return <Navigate to="/login" replace />
  return (
    <div className="login-wrap">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/app" />
    </div>
  )
}

export function useClerkProfile() {
  const { isSignedIn, user } = useUser()
  if (!clerkEnabled || !isSignedIn || !user) return null
  return {
    name: user.fullName || user.primaryEmailAddress?.emailAddress,
    email: user.primaryEmailAddress?.emailAddress,
    role: 'member',
    dept: 'Clerk',
  }
}
