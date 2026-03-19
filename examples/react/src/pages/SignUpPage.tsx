import { useNavigate } from 'react-router-dom'
import { SignUp } from '@authon/react'

export default function SignUpPage() {
  const navigate = useNavigate()

  return (
    <div className="auth-page">
      <SignUp
        afterSignUpUrl="/"
        onSignUp={() => navigate('/')}
        onNavigateSignIn={() => navigate('/sign-in')}
      />
    </div>
  )
}
