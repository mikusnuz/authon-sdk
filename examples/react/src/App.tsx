import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MfaPage from './pages/MfaPage'
import SessionsPage from './pages/SessionsPage'
import DeleteAccountPage from './pages/DeleteAccountPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/mfa" element={<MfaPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/delete-account" element={<DeleteAccountPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
