import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthonProvider } from '@authon/react'
import App from './App'
import './index.css'

const publishableKey = import.meta.env.VITE_AUTHON_PROJECT_ID as string
const apiUrl = import.meta.env.VITE_AUTHON_API_URL as string | undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthonProvider publishableKey={publishableKey} config={{ apiUrl }}>
      <BrowserRouter basename="/react">
        <App />
      </BrowserRouter>
    </AuthonProvider>
  </StrictMode>,
)
