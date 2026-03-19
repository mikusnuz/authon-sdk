import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/vue/',
  server: { port: 15588, host: '0.0.0.0' },
})
