import { Navigate, Outlet } from 'react-router-dom'

/**
 * Mirrors the login auth-guard from LoginPage.html:
 *  - No data at all → /login
 *  - Has data but no weightHistory → /onboarding
 *  - Has data + weight → render the protected page
 */
export default function ProtectedRoute() {
  try {
    const raw = localStorage.getItem('caliStrengthData')
    if (!raw) return <Navigate to="/login" replace />
    const data = JSON.parse(raw)
    if (!data.weightHistory || data.weightHistory.length === 0) {
      return <Navigate to="/onboarding" replace />
    }
    return <Outlet />
  } catch {
    return <Navigate to="/login" replace />
  }
}
