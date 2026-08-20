import { useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useTheme } from './ThemeProvider';

interface CodeFormProps {
  title: string;
  description: string;
  label: string;
  submitLabel: string;
  backLabel: string;
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
  onResend?: () => Promise<void>;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function CodeForm({
  title,
  description,
  label,
  submitLabel,
  backLabel,
  onSubmit,
  onBack,
  onResend,
}: CodeFormProps) {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const errorId = useId();
  const submitPending = useRef(false);
  const resendPending = useRef(false);

  const handleSubmit = async () => {
    if (submitPending.current) return;
    if (!code.trim()) {
      setError(`${label} is required`);
      return;
    }
    submitPending.current = true;
    setLoading(true);
    setError('');
    setStatus('');
    try {
      await onSubmit(code.trim());
    } catch (submitError) {
      setError(errorMessage(submitError, 'Verification failed'));
    } finally {
      submitPending.current = false;
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!onResend || resendPending.current) return;
    resendPending.current = true;
    setResending(true);
    setError('');
    setStatus('');
    try {
      await onResend();
      setStatus('Verification code sent');
    } catch (resendError) {
      setError(errorMessage(resendError, 'Could not resend verification code'));
    } finally {
      resendPending.current = false;
      setResending(false);
    }
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: theme.text,
    textAlign: 'center',
    letterSpacing: '-0.3px',
  };

  const descriptionStyle: CSSProperties = {
    margin: '-8px 0 0',
    fontSize: 14,
    lineHeight: 1.5,
    color: theme.textMuted,
    textAlign: 'center',
  };

  const errorStyle: CSSProperties = {
    padding: '10px 14px',
    borderRadius: theme.borderRadius,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: 13,
  };

  const statusStyle: CSSProperties = {
    padding: '10px 14px',
    borderRadius: theme.borderRadius,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    fontSize: 13,
  };

  return (
    <>
      <h1 style={titleStyle}>{title}</h1>
      <p style={descriptionStyle}>{description}</p>
      {error && <div id={errorId} role="alert" style={errorStyle}>{error}</div>}
      {status && <div role="status" aria-live="polite" style={statusStyle}>{status}</div>}
      <Input
        label={label}
        value={code}
        onChange={setCode}
        inputMode="numeric"
        autoComplete="one-time-code"
        disabled={loading}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      <Button
        variant="primary"
        fullWidth
        loading={loading}
        disabled={resending}
        onClick={handleSubmit}
      >
        {submitLabel}
      </Button>
      {onResend && (
        <Button
          variant="outline"
          fullWidth
          loading={resending}
          disabled={loading}
          onClick={handleResend}
        >
          Resend code
        </Button>
      )}
      <Button
        variant="ghost"
        fullWidth
        disabled={loading || resending}
        onClick={onBack}
      >
        {backLabel}
      </Button>
    </>
  );
}

interface VerificationFormProps {
  email: string;
  backLabel: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function VerificationForm({
  email,
  backLabel,
  onVerify,
  onResend,
  onBack,
}: VerificationFormProps) {
  return (
    <CodeForm
      title="Verify your email"
      description={`Enter the verification code sent to ${email}.`}
      label="Verification code"
      submitLabel="Verify email"
      backLabel={backLabel}
      onSubmit={onVerify}
      onResend={onResend}
      onBack={onBack}
    />
  );
}

interface MfaFormProps {
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
}

export function MfaForm({ onVerify, onBack }: MfaFormProps) {
  return (
    <CodeForm
      title="Two-factor authentication"
      description="Enter the code from your authenticator app."
      label="Authenticator code"
      submitLabel="Verify code"
      backLabel="Back to sign in"
      onSubmit={onVerify}
      onBack={onBack}
    />
  );
}
