import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { BrandingConfig } from '@authon/shared';
import { useAuthon } from '../useAuthon';
import { useBranding } from '../hooks/useBranding';
import { ThemeProvider, useTheme } from './shared/ThemeProvider';

export interface UserButtonProps {
  appearance?: { variables?: Partial<BrandingConfig> };
  afterSignOutUrl?: string;
  userProfileUrl?: string;
}

function UserAvatar({
  avatarUrl,
  displayName,
  email,
  size,
  primaryStart,
  primaryEnd,
}: {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  size: number;
  primaryStart: string;
  primaryEnd: string;
}) {
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (email?.[0] ?? '?').toUpperCase();

  const avatarStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})`,
    color: '#fff',
    fontSize: size * 0.38,
    fontWeight: 700,
    userSelect: 'none',
  };

  return (
    <div style={avatarStyle}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName ?? 'avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
}

function UserButtonInner({ afterSignOutUrl, userProfileUrl }: Omit<UserButtonProps, 'appearance'>) {
  const theme = useTheme();
  const { user, signOut, openSignIn, isSignedIn, activeOrganization, client } = useAuthon();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  if (!isSignedIn) {
    return (
      <button
        type="button"
        onClick={() => openSignIn()}
        style={{
          padding: '8px 18px',
          borderRadius: theme.borderRadius,
          border: 'none',
          background: `linear-gradient(135deg, ${theme.primaryStart}, ${theme.primaryEnd})`,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: theme.fontFamily,
        }}
      >
        Sign In
      </button>
    );
  }

  const triggerStyle: CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: '50%',
    border: `2px solid ${theme.primaryStart}`,
    background: 'none',
    cursor: 'pointer',
    padding: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 46,
    minWidth: 240,
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.borderRadius,
    boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
    zIndex: 9999,
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
  };

  const headerStyle: CSSProperties = {
    padding: '14px 16px',
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const menuItemStyle = (danger?: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 16px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: danger ? '#ef4444' : theme.text,
    fontWeight: 500,
    fontFamily: theme.fontFamily,
    boxSizing: 'border-box',
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" style={triggerStyle} onClick={() => setOpen((v) => !v)} aria-label="User menu">
        <UserAvatar
          avatarUrl={user?.avatarUrl}
          displayName={user?.displayName}
          email={user?.email}
          size={32}
          primaryStart={theme.primaryStart}
          primaryEnd={theme.primaryEnd}
        />
      </button>

      {open && (
        <div style={dropdownStyle}>
          <div style={headerStyle}>
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              displayName={user?.displayName}
              email={user?.email}
              size={40}
              primaryStart={theme.primaryStart}
              primaryEnd={theme.primaryEnd}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {user?.displayName && (
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName}
                </div>
              )}
              {user?.email && (
                <div style={{ fontSize: 12, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {activeOrganization && (
            <OrgSwitcherRow
              org={activeOrganization}
              primaryStart={theme.primaryStart}
              theme={theme}
              client={client}
            />
          )}

          {userProfileUrl && (
            <MenuButton
              style={menuItemStyle()}
              onClick={() => { setOpen(false); window.location.assign(userProfileUrl); }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            >
              Manage account
            </MenuButton>
          )}

          <div style={{ borderTop: `1px solid ${theme.border}` }}>
            <MenuButton
              style={menuItemStyle(true)}
              onClick={async () => {
                setOpen(false);
                await signOut();
                if (afterSignOutUrl) window.location.assign(afterSignOutUrl);
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              }
            >
              Sign out
            </MenuButton>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  style: baseStyle,
  onClick,
  icon,
  children,
}: {
  style: CSSProperties;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      style={{
        ...baseStyle,
        background: hovered ? (baseStyle.color === '#ef4444' ? '#fef2f2' : '#f9fafb') : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {children}
    </button>
  );
}

function OrgSwitcherRow({
  org,
  primaryStart,
  theme,
  client,
}: {
  org: { name: string; logoUrl: string | null; id: string };
  primaryStart: string;
  theme: { text: string; textMuted: string; border: string; fontFamily: string };
  client: any;
}) {
  return (
    <div
      style={{
        padding: '8px 16px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {org.logoUrl ? (
        <img src={org.logoUrl} alt={org.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
      ) : (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `${primaryStart}22`,
            color: primaryStart,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {org.name[0]?.toUpperCase()}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: theme.textMuted }}>Organization</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {org.name}
        </div>
      </div>
    </div>
  );
}

export function UserButton({ appearance, afterSignOutUrl, userProfileUrl }: UserButtonProps) {
  const { branding } = useBranding();
  const effectiveBranding = { ...branding, ...(appearance?.variables ?? {}) };

  return (
    <ThemeProvider branding={effectiveBranding} style={{ display: 'inline-block' }}>
      <UserButtonInner afterSignOutUrl={afterSignOutUrl} userProfileUrl={userProfileUrl} />
    </ThemeProvider>
  );
}
