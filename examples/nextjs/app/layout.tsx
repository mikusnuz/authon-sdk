'use client'

import { AuthonProvider } from '@authon/nextjs'
import Nav from '../components/Nav'
import './globals.css'

const publishableKey = process.env.NEXT_PUBLIC_AUTHON_PROJECT_ID as string
const apiUrl = process.env.NEXT_PUBLIC_AUTHON_API_URL as string | undefined

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthonProvider publishableKey={publishableKey} config={{ apiUrl }}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Nav />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
            <footer style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '20px 24px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 13,
            }}>
              <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                Authon Next.js SDK Example &mdash;{' '}
                <a href="https://docs.authon.dev" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
                {' · '}
                <a href="https://github.com/mikusnuz/authon-sdk" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
            </footer>
          </div>
        </AuthonProvider>
      </body>
    </html>
  )
}
