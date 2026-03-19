import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthonProvider } from '@authon/react'
import App from './App'
import './index.css'

const publishableKey = import.meta.env.VITE_AUTHON_PROJECT_ID as string
const apiUrl = import.meta.env.VITE_AUTHON_API_URL as string | undefined

if (!publishableKey) {
  throw new Error('VITE_AUTHON_PROJECT_ID is required. Copy .env.example to .env and fill in your project ID.')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthonProvider publishableKey={publishableKey} config={apiUrl ? { apiUrl } : undefined}>
      <BrowserRouter basename="/react">
        <App />
      </BrowserRouter>
    </AuthonProvider>
  </StrictMode>,
)
