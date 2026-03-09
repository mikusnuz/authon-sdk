import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import { PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES } from '@authon/shared';
import { getProviderButtonConfig } from '@authon/js';
import { useAuthon } from '../useAuthon';
import { useBranding } from '../hooks/useBranding';
import { ThemeProvider, useTheme } from './shared/ThemeProvider';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import { Divider } from './shared/Divider';

export interface SignUpProps {
  appearance?: { variables?: Partial<BrandingConfig> };
  afterSignUpUrl?: string;
  onSignUp?: () => void;
  onNavigateSignIn?: () => void;
}

function SignUpCard({ afterSignUpUrl, onSignUp, onNavigateSignIn }: Omit<SignUpProps, 'appearance'>) {
  const theme = useTheme();
  const { client } = useAuthon();
  const { branding, providers, isLoaded } = useBranding();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !client) return;
    setLoading(true);
    setError('');
    try {
      await client.signUpWithEmail(email, password, displayName ? { displayName } : undefined);
      if (afterSignUpUrl) window.location.assign(afterSignUpUrl);
      onSignUp?.();
    } catch (e: any) {
      setError(e?.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: OAuthProviderType) => {
    if (!client) return;
    setOauthLoading(provider);
    setError('');
    try {
      await client.signInWithOAuth(provider);
    } catch (e: any) {
      setError(e?.message ?? 'OAuth sign in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const cardStyle: CSSProperties = {
    width: '100%',
    maxWidth: 440,
    background: theme.bg,
    borderRadius: `calc(${theme.borderRadius} + 4px)`,
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    padding: '40px 36px 32px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    fontFamily: theme.fontFamily,
  };

  const logoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  };

  const titleStyle: CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: theme.text,
    textAlign: 'center',
    letterSpacing: '-0.3px',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: -12,
  };

  const errorBoxStyle: CSSProperties = {
    padding: '10px 14px',
    borderRadius: theme.borderRadius,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: 13,
  };

  const linkStyle: CSSProperties = {
    fontSize: 13,
    color: theme.primaryStart,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: theme.fontFamily,
    textDecoration: 'none',
  };

  const footerStyle: CSSProperties = {
    textAlign: 'center',
    fontSize: 14,
    color: theme.textMuted,
    paddingTop: 4,
  };

  const showEmailPw = branding.showEmailPassword !== false;
  const showDivider = branding.showDivider !== false && providers.length > 0 && showEmailPw;

  const providersToShow = providers.filter(
    (p) => !(branding.hiddenProviders ?? []).includes(p),
  );

  if (!isLoaded) {
    return (
      <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <span
          style={{
            width: 28,
            height: 28,
            border: `3px solid ${theme.primaryStart}33`,
            borderTopColor: theme.primaryStart,
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'authon-spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  const eyeIconPath = showPassword
    ? 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22'
    : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z';

  return (
    <div style={cardStyle}>
      <div style={logoStyle}>
        {branding.logoDataUrl && (
          <img src={branding.logoDataUrl} alt={branding.brandName ?? 'Logo'} style={{ height: 40, objectFit: 'contain' }} />
        )}
        <h1 style={titleStyle}>Create account</h1>
        {branding.brandName && (
          <p style={subtitleStyle}>Join {branding.brandName}</p>
        )}
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      {providersToShow.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {providersToShow.length <= 3 ? (
            providersToShow.map((provider) => (
              <OAuthButtonFull
                key={provider}
                provider={provider}
                loading={oauthLoading === provider}
                disabled={!!oauthLoading || loading}
                onClick={() => handleOAuth(provider)}
                borderRadius={theme.borderRadius}
              />
            ))
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {providersToShow.map((provider) => (
                <CompactOAuthBtn
                  key={provider}
                  provider={provider}
                  loading={oauthLoading === provider}
                  disabled={!!oauthLoading || loading}
                  onClick={() => handleOAuth(provider)}
                  borderRadius={theme.borderRadius}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showDivider && <Divider />}

      {showEmailPw && (
        <>
          <Input
            label="Display name"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={setDisplayName}
            error={fieldErrors.displayName}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 8 characters"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: theme.textMuted }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={eyeIconPath} />
                </svg>
              </button>
            }
          />

          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!!oauthLoading}
            onClick={handleSubmit}
          >
            Create account
          </Button>
        </>
      )}

      <div style={footerStyle}>
        Already have an account?{' '}
        <button type="button" style={linkStyle} onClick={onNavigateSignIn}>
          Sign in
        </button>
      </div>

      {branding.showSecuredBy !== false && (
        <SecuredByAuthon primaryStart={theme.primaryStart} textMuted={theme.textMuted} />
      )}

      {branding.termsUrl || branding.privacyUrl ? (
        <div style={{ textAlign: 'center', fontSize: 11, color: theme.textMuted, marginTop: -8 }}>
          By creating an account you agree to our{' '}
          {branding.termsUrl && (
            <a href={branding.termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.primaryStart }}>Terms</a>
          )}
          {branding.termsUrl && branding.privacyUrl && ' and '}
          {branding.privacyUrl && (
            <a href={branding.privacyUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.primaryStart }}>Privacy Policy</a>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface OAuthBtnProps {
  provider: OAuthProviderType;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  borderRadius: string;
}

function OAuthButtonFull({ provider, loading, disabled, onClick, borderRadius }: OAuthBtnProps) {
  const [hovered, setHovered] = useState(false);
  const colors = PROVIDER_COLORS[provider] ?? { bg: '#333', text: '#fff' };
  const name = PROVIDER_DISPLAY_NAMES[provider] ?? provider;
  const config = getProviderButtonConfig(provider);
  const needsBorder = colors.bg.toLowerCase() === '#ffffff';

  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    height: 44,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius,
    background: colors.bg,
    color: colors.text,
    border: needsBorder ? '1.5px solid #dadce0' : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : hovered ? 0.88 : 1,
    transition: 'opacity 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Continue with ${name}`}
    >
      {loading ? (
        <span style={{ width: 18, height: 18, border: `2px solid ${colors.text}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'authon-spin 0.6s linear infinite' }} />
      ) : (
        <>
          <span style={{ display: 'flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: config.iconSvg }} />
          <span>Continue with {name}</span>
        </>
      )}
    </button>
  );
}

function CompactOAuthBtn({ provider, loading, disabled, onClick, borderRadius }: OAuthBtnProps) {
  const [hovered, setHovered] = useState(false);
  const colors = PROVIDER_COLORS[provider] ?? { bg: '#333', text: '#fff' };
  const name = PROVIDER_DISPLAY_NAMES[provider] ?? provider;
  const config = getProviderButtonConfig(provider);
  const needsBorder = colors.bg.toLowerCase() === '#ffffff';

  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius,
    background: colors.bg,
    border: needsBorder ? '1.5px solid #dadce0' : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : hovered ? 0.85 : 1,
    transition: 'opacity 0.15s',
    padding: 0,
  };

  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Continue with ${name}`}
    >
      {loading ? (
        <span style={{ width: 18, height: 18, border: `2px solid ${colors.text}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'authon-spin 0.6s linear infinite' }} />
      ) : (
        <span style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: config.iconSvg }} />
      )}
    </button>
  );
}

function SecuredByAuthon({ primaryStart, textMuted }: { primaryStart: string; textMuted: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: -8 }}>
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0L0.5 2.5V6.5C0.5 9.7 2.9 12.7 6 13.5C9.1 12.7 11.5 9.7 11.5 6.5V2.5L6 0Z" fill={primaryStart} opacity="0.85"/>
        <path d="M4 7L5.5 8.5L8.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: 11, color: textMuted }}>
        Secured by{' '}
        <a href="https://authon.dev" target="_blank" rel="noopener noreferrer" style={{ color: primaryStart, textDecoration: 'none', fontWeight: 600 }}>
          Authon
        </a>
      </span>
    </div>
  );
}

export function SignUp({ appearance, afterSignUpUrl, onSignUp, onNavigateSignIn }: SignUpProps) {
  const { branding, isLoaded } = useBranding();

  const effectiveBranding = isLoaded ? { ...branding, ...(appearance?.variables ?? {}) } : branding;

  return (
    <ThemeProvider branding={effectiveBranding} overrides={appearance?.variables} style={{ display: 'flex', justifyContent: 'center' }}>
      <style>{`@keyframes authon-spin { to { transform: rotate(360deg); } }`}</style>
      <SignUpCard
        afterSignUpUrl={afterSignUpUrl}
        onSignUp={onSignUp}
        onNavigateSignIn={onNavigateSignIn}
      />
    </ThemeProvider>
  );
}
