import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 15585, host: '0.0.0.0' },
  build: { outDir: 'dist' },
})
