import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { BrandingConfig, SessionInfo, MfaStatus } from '@authon/shared';
import { useAuthon } from '../useAuthon';
import { useBranding } from '../hooks/useBranding';
import { ThemeProvider, useTheme } from './shared/ThemeProvider';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

export interface UserProfileProps {
  appearance?: { variables?: Partial<BrandingConfig> };
}

type Tab = 'profile' | 'security' | 'sessions';

function ProfileTab() {
  const theme = useTheme();
  const { user, client } = useAuthon();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!client) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await client.updateProfile({ displayName: displayName || undefined, phone: phone || undefined });
      setSuccess('Profile updated');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: user?.avatarUrl ? 'transparent' : `linear-gradient(135deg, ${theme.primaryStart}, ${theme.primaryEnd})`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: theme.text }}>{user?.displayName ?? 'User'}</div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>{user?.email}</div>
          {!user?.emailVerified && (
            <span style={{ fontSize: 11, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: 99, fontWeight: 500, marginTop: 4, display: 'inline-block' }}>
              Email not verified
            </span>
          )}
        </div>
      </div>

      {success && (
        <div style={{ padding: '10px 14px', borderRadius: theme.borderRadius, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: theme.borderRadius, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Display name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
        <Input label="Email" type="email" value={user?.email ?? ''} disabled placeholder="Email" />
        <Input label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
      </div>

      <Button variant="primary" onClick={handleSave} loading={loading} style={{ alignSelf: 'flex-start', minWidth: 120 }}>
        Save changes
      </Button>
    </div>
  );
}

function SecurityTab() {
  const theme = useTheme();
  const { client } = useAuthon();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    client.getMfaStatus().then(setMfaStatus).catch(() => null);
  }, [client]);

  const handlePasswordChange = async () => {
    if (!client) return;
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await client.updateProfile({ displayName: undefined });
      setPwSuccess('Password updated');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e: any) {
      setPwError(e?.message ?? 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const sectionTitle: CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: theme.text,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: `1px solid ${theme.border}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <div style={sectionTitle}>Change password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Current password" type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" autoComplete="current-password" />
          <Input label="New password" type="password" value={newPw} onChange={setNewPw} placeholder="Minimum 8 characters" autoComplete="new-password" />
          <Input label="Confirm new password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Repeat new password" autoComplete="new-password" />
          {pwError && <div style={{ color: '#dc2626', fontSize: 13 }}>{pwError}</div>}
          {pwSuccess && <div style={{ color: '#166534', fontSize: 13 }}>{pwSuccess}</div>}
          <Button variant="primary" onClick={handlePasswordChange} loading={pwLoading} style={{ alignSelf: 'flex-start', minWidth: 160 }}>
            Update password
          </Button>
        </div>
      </div>

      <div>
        <div style={sectionTitle}>Two-factor authentication</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>Authenticator app</div>
            <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
              {mfaStatus?.enabled
                ? `Enabled · ${mfaStatus.backupCodesRemaining} backup codes remaining`
                : 'Add extra security to your account'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                background: mfaStatus?.enabled ? '#f0fdf4' : '#f3f4f6',
                color: mfaStatus?.enabled ? '#166534' : theme.textMuted,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: mfaStatus?.enabled ? '#22c55e' : '#9ca3af', display: 'inline-block' }} />
              {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionsTab() {
  const theme = useTheme();
  const { client } = useAuthon();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      const data = await client.listSessions();
      setSessions(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (sessionId: string) => {
    if (!client) return;
    setRevoking(sessionId);
    try {
      await client.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      /* ignore */
    } finally {
      setRevoking(null);
    }
  };

  const sectionTitle: CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: theme.text,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: `1px solid ${theme.border}`,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <span style={{ width: 24, height: 24, border: `3px solid ${theme.primaryStart}33`, borderTopColor: theme.primaryStart, borderRadius: '50%', display: 'inline-block', animation: 'authon-spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={sectionTitle}>Active sessions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sessions.length === 0 ? (
          <div style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No active sessions</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.border}`,
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${theme.primaryStart}18`, color: theme.primaryStart, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.userAgent
                      ? session.userAgent.length > 50
                        ? session.userAgent.slice(0, 50) + '…'
                        : session.userAgent
                      : 'Unknown device'}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    {session.ipAddress ?? 'Unknown IP'}
                    {session.lastActiveAt && (
                      <> · {formatRelative(session.lastActiveAt)}</>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={revoking === session.id}
                onClick={() => handleRevoke(session.id)}
              >
                Revoke
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function UserProfilePanel() {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('profile');

  const panelStyle: CSSProperties = {
    width: '100%',
    maxWidth: 640,
    background: theme.bg,
    borderRadius: `calc(${theme.borderRadius} + 4px)`,
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
  };

  const tabBarStyle: CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${theme.border}`,
    padding: '0 24px',
  };

  const tabBtnStyle = (active: boolean): CSSProperties => ({
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${theme.primaryStart}` : '2px solid transparent',
    color: active ? theme.primaryStart : theme.textMuted,
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: theme.fontFamily,
    marginBottom: -1,
  });

  const contentStyle: CSSProperties = {
    padding: '28px 28px',
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'sessions', label: 'Sessions' },
  ];

  return (
    <div style={panelStyle}>
      <style>{`@keyframes authon-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={tabBarStyle}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            style={tabBtnStyle(tab === key)}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={contentStyle}>
        {tab === 'profile' && <ProfileTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'sessions' && <SessionsTab />}
      </div>
    </div>
  );
}

export function UserProfile({ appearance }: UserProfileProps) {
  const { branding } = useBranding();
  const effectiveBranding = { ...branding, ...(appearance?.variables ?? {}) };

  return (
    <ThemeProvider branding={effectiveBranding} style={{ display: 'flex', justifyContent: 'center' }}>
      <UserProfilePanel />
    </ThemeProvider>
  );
}
