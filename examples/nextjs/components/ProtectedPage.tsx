'use client'

import { useAuthon } from '@authon/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedPageProps {
  children: React.ReactNode
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const { isSignedIn, isLoading } = useAuthon()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isSignedIn, isLoading, router])

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
    return null
  }

  return <>{children}</>
}
