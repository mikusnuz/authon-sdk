import { createApp, type Plugin } from 'vue'
import { createAuthon } from '@authon/vue'
import App from './App.vue'
import './style.css'

const publishableKey = import.meta.env.VITE_AUTHON_PROJECT_ID as string
const apiUrl = import.meta.env.VITE_AUTHON_API_URL as string | undefined

if (!publishableKey) {
  throw new Error('VITE_AUTHON_PROJECT_ID is required. Copy .env.example to .env and fill in your project ID.')
}

const app = createApp(App)

app.use(
  createAuthon({
    publishableKey,
    config: apiUrl ? { apiUrl } : undefined,
  }) as unknown as Plugin,
)

app.mount('#app')
