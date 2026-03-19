'use client'

import { AuthonProvider } from '@authon/nextjs'
import './globals.css'

const publishableKey = process.env.NEXT_PUBLIC_AUTHON_PROJECT_ID as string
const apiUrl = process.env.NEXT_PUBLIC_AUTHON_API_URL as string | undefined

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Authon Next.js Example</title>
      </head>
      <body>
        <AuthonProvider
          publishableKey={publishableKey || ''}
          config={apiUrl ? { apiUrl } : undefined}
        >
          {children}
        </AuthonProvider>
      </body>
    </html>
  )
}
