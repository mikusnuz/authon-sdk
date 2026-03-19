'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@authon/nextjs'

export default function Nav() {
  return (
    <nav style={{
      height: 64,
      background: 'rgba(10, 15, 30, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 800,
          }}>
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            Authon
            <span style={{ color: 'var(--accent)', marginLeft: 4, fontSize: 13, fontWeight: 500 }}>Next.js SDK</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SignedIn>
            <NavLink href="/profile">Profile</NavLink>
            <NavLink href="/mfa">MFA</NavLink>
            <NavLink href="/sessions">Sessions</NavLink>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                transition: 'all 0.15s',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                background: 'var(--accent)',
                transition: 'background 0.15s',
              }}
            >
              Sign up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '6px 14px',
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        transition: 'color 0.15s',
      }}
    >
      {children}
    </Link>
  )
}
