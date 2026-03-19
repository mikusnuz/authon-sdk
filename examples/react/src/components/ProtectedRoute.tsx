import { useAuthon } from '@authon/react'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const { isSignedIn, isLoading } = useAuthon()

  if (isLoading) {
    return (
      <div className="page-centered">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="loading-spinner-lg" />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return <Outlet />
}
