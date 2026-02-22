import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthup } from './useAuthup';

export function UserButton() {
  const { user, signOut, openSignIn, isSignedIn } = useAuthup();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  if (!isSignedIn) {
    return (
      <button
        onClick={() => openSignIn()}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Sign In
      </button>
    );
  }

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid #7c3aed',
          background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          cursor: 'pointer',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName ?? 'avatar'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '44px',
            minWidth: '200px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            {user?.displayName && (
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                {user.displayName}
              </div>
            )}
            {user?.email && (
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                {user.email}
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#ef4444',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
