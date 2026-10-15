import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthonProvider } from '@authon/react'
import App from './App'
import './index.css'

const publishableKey = import.meta.env.VITE_AUTHON_PUBLISHABLE_KEY as string
const apiUrl = import.meta.env.VITE_AUTHON_API_URL as string | undefined

if (!publishableKey) {
  throw new Error('VITE_AUTHON_PUBLISHABLE_KEY is required. Copy .env.example to .env and add your publishable key.')
}

const config = {
  ...(apiUrl ? { apiUrl } : {}),
  // Create the embedded wallet in the background after sign-in (needs wallets turned on for the project).
  wallet: { autoCreate: true },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthonProvider publishableKey={publishableKey} config={config}>
      <BrowserRouter basename="/react">
        <App />
      </BrowserRouter>
    </AuthonProvider>
  </StrictMode>,
)
