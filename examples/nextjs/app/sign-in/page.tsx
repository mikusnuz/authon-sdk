'use client'

import { useRouter } from 'next/navigation'
import { SignIn } from '@authon/nextjs'

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="auth-page">
      <SignIn
        afterSignInUrl="/"
        onSignIn={() => router.push('/')}
        onNavigateSignUp={() => router.push('/sign-up')}
      />
    </div>
  )
}
