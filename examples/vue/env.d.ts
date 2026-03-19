/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTHON_PROJECT_ID: string
  readonly VITE_AUTHON_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
