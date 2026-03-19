'use client'

import { useRouter } from 'next/navigation'
import { SignUp } from '@authon/nextjs'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="auth-page">
      <SignUp
        afterSignUpUrl="/"
        onSignUp={() => router.push('/')}
        onNavigateSignIn={() => router.push('/sign-in')}
      />
    </div>
  )
}
