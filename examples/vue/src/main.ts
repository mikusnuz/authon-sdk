import { createApp } from 'vue'
import { createAuthon } from '@authon/vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

const authon = createAuthon({
  publishableKey: import.meta.env.VITE_AUTHON_PROJECT_ID,
  config: { apiUrl: import.meta.env.VITE_AUTHON_API_URL },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(authon as any)
app.use(router)
app.mount('#app')
