import { useNavigate } from 'react-router-dom'
import { SignIn } from '@authon/react'

export default function SignInPage() {
  const navigate = useNavigate()

  return (
    <div className="auth-page">
      <SignIn
        afterSignInUrl="/"
        onSignIn={() => navigate('/')}
        onNavigateSignUp={() => navigate('/sign-up')}
      />
    </div>
  )
}
