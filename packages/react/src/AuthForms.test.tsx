// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { AuthonMfaRequiredError } from '@authon/js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

const authonMocks = vi.hoisted(() => ({
  client: null as Record<string, ReturnType<typeof vi.fn>> | null,
  providers: [] as string[],
}));
const navigationMocks = vi.hoisted(() => ({ navigateTo: vi.fn() }));

vi.mock('./useAuthon', () => ({
  useAuthon: () => ({ client: authonMocks.client }),
}));

vi.mock('./components/shared/navigation', () => navigationMocks);

vi.mock('./hooks/useBranding', async () => {
  const { DEFAULT_BRANDING } = await import('@authon/shared');
  return {
    useBranding: () => ({
      branding: DEFAULT_BRANDING,
      providers: authonMocks.providers,
      isLoaded: true,
    }),
  };
});

function createClient() {
  return {
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerificationCode: vi.fn(),
    verifyMfa: vi.fn(),
    signInWithOAuth: vi.fn(),
  };
}

async function fillSignIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'person@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
}

async function fillSignUp(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Display name'), 'Person');
  await user.type(screen.getByLabelText('Email'), 'person@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.type(screen.getByLabelText('Confirm password'), 'password123');
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('SignIn', () => {
  beforeEach(() => {
    authonMocks.client = createClient();
    authonMocks.providers = [];
    navigationMocks.navigateTo.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('completes a normal email sign in exactly once', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    authonMocks.client!.signInWithEmail.mockResolvedValue({ id: 'user_1' });
    render(<SignIn onSignIn={onSignIn} />);

    await fillSignIn(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(onSignIn).toHaveBeenCalledTimes(1));
    expect(authonMocks.client!.signInWithEmail).toHaveBeenCalledWith(
      'person@example.com',
      'password123',
    );
  });

  it('allows only one OAuth launch across rapid provider clicks', async () => {
    const user = userEvent.setup();
    const oauth = deferred<void>();
    authonMocks.providers = ['google', 'github'];
    authonMocks.client!.signInWithOAuth
      .mockReturnValueOnce(oauth.promise)
      .mockResolvedValueOnce(undefined);
    render(<SignIn />);

    const google = screen.getByRole('button', { name: 'Continue with Google' });
    const github = screen.getByRole('button', { name: 'Continue with GitHub' });
    act(() => {
      google.click();
      github.click();
    });

    expect(authonMocks.client!.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(authonMocks.client!.signInWithOAuth).toHaveBeenCalledWith('google');

    oauth.resolve();
    await waitFor(() => expect(github).toBeEnabled());
    await user.click(github);
    expect(authonMocks.client!.signInWithOAuth).toHaveBeenCalledTimes(2);
    expect(authonMocks.client!.signInWithOAuth).toHaveBeenLastCalledWith('github');
  });

  it('guards credential submission and preserves credentials when leaving verification', async () => {
    const user = userEvent.setup();
    const signIn = deferred<unknown>();
    const onSignIn = vi.fn();
    authonMocks.client!.signInWithEmail.mockReturnValue(signIn.promise);
    render(<SignIn onSignIn={onSignIn} />);

    await fillSignIn(user);
    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    expect(authonMocks.client!.signInWithEmail).toHaveBeenCalledTimes(1);

    signIn.resolve({ needsVerification: true, email: 'person@example.com' });
    await user.click(await screen.findByRole('button', { name: 'Back to sign in' }));

    expect(screen.getByLabelText('Email')).toHaveValue('person@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('password123');
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it('shows ordinary sign-in failures without entering MFA', async () => {
    const user = userEvent.setup();
    authonMocks.client!.signInWithEmail.mockRejectedValue(new Error('Invalid credentials'));
    render(<SignIn />);

    await fillSignIn(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Two-factor authentication' })).not.toBeInTheDocument();
  });

  it('waits for email verification, allows retry, and completes only after verification', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    authonMocks.client!.signInWithEmail.mockResolvedValue({
      needsVerification: true,
      email: 'canonical@example.com',
    });
    authonMocks.client!.verifyEmail
      .mockRejectedValueOnce(new Error('Incorrect verification code'))
      .mockResolvedValueOnce({ id: 'user_1' });
    render(<SignIn onSignIn={onSignIn} afterSignInUrl="/account" />);

    await fillSignIn(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(screen.getByText(/canonical@example\.com/)).toBeInTheDocument();
    expect(onSignIn).not.toHaveBeenCalled();
    expect(navigationMocks.navigateTo).not.toHaveBeenCalled();

    const codeInput = screen.getByLabelText('Verification code');
    await user.type(codeInput, '111111');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));

    const verificationAlert = await screen.findByRole('alert');
    expect(verificationAlert).toHaveTextContent('Incorrect verification code');
    expect(codeInput).toHaveAttribute('aria-invalid', 'true');
    expect(codeInput).toHaveAttribute('aria-describedby', verificationAlert.id);
    expect(codeInput).toHaveValue('111111');
    expect(onSignIn).not.toHaveBeenCalled();
    expect(navigationMocks.navigateTo).not.toHaveBeenCalled();

    await user.clear(codeInput);
    await user.type(codeInput, '222222');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));

    await waitFor(() => expect(onSignIn).toHaveBeenCalledTimes(1));
    expect(navigationMocks.navigateTo).toHaveBeenCalledOnce();
    expect(navigationMocks.navigateTo).toHaveBeenCalledWith('/account');
    expect(authonMocks.client!.verifyEmail).toHaveBeenNthCalledWith(
      2,
      'canonical@example.com',
      '222222',
    );
  });

  it('prevents duplicate verification and resend requests and announces resend outcomes', async () => {
    const user = userEvent.setup();
    const verification = deferred<unknown>();
    const resend = deferred<void>();
    authonMocks.client!.signInWithEmail.mockResolvedValue({
      needsVerification: true,
      email: 'person@example.com',
    });
    authonMocks.client!.verifyEmail.mockReturnValue(verification.promise);
    authonMocks.client!.resendVerificationCode
      .mockReturnValueOnce(resend.promise)
      .mockRejectedValueOnce(new Error('Resend unavailable'))
      .mockResolvedValueOnce(undefined);
    render(<SignIn />);

    await fillSignIn(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await user.type(await screen.findByLabelText('Verification code'), '123456');

    const verifyButton = screen.getByRole('button', { name: 'Verify email' });
    fireEvent.click(verifyButton);
    fireEvent.click(verifyButton);
    expect(authonMocks.client!.verifyEmail).toHaveBeenCalledTimes(1);
    verification.resolve({ id: 'user_1' });

    const resendButton = screen.getByRole('button', { name: 'Resend code' });
    await waitFor(() => expect(resendButton).toBeEnabled());
    fireEvent.click(resendButton);
    fireEvent.click(resendButton);
    expect(authonMocks.client!.resendVerificationCode).toHaveBeenCalledTimes(1);
    resend.resolve();
    expect(await screen.findByRole('status')).toHaveTextContent('Verification code sent');

    await user.click(resendButton);
    expect(await screen.findByRole('alert')).toHaveTextContent('Resend unavailable');
    await user.click(resendButton);
    expect(await screen.findByRole('status')).toHaveTextContent('Verification code sent');
  });

  it('handles MFA separately, preserves the code on failure, and completes only after retry', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    authonMocks.client!.signInWithEmail.mockRejectedValue(
      new AuthonMfaRequiredError('mfa_token_1'),
    );
    authonMocks.client!.verifyMfa
      .mockRejectedValueOnce(new Error('Invalid authenticator code'))
      .mockResolvedValueOnce({ id: 'user_1' });
    render(<SignIn onSignIn={onSignIn} />);

    await fillSignIn(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Two-factor authentication' })).toBeInTheDocument();
    expect(onSignIn).not.toHaveBeenCalled();

    const codeInput = screen.getByLabelText('Authenticator code');
    await user.type(codeInput, '111111');
    await user.click(screen.getByRole('button', { name: 'Verify code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid authenticator code');
    expect(codeInput).toHaveValue('111111');
    expect(onSignIn).not.toHaveBeenCalled();

    await user.clear(codeInput);
    await user.type(codeInput, '222222');
    await user.click(screen.getByRole('button', { name: 'Verify code' }));

    await waitFor(() => expect(onSignIn).toHaveBeenCalledTimes(1));
    expect(authonMocks.client!.verifyMfa).toHaveBeenNthCalledWith(2, 'mfa_token_1', '222222');
  });

  it('renders forgot password only when supplied and calls it once', async () => {
    const user = userEvent.setup();
    const onForgotPassword = vi.fn();
    const view = render(<SignIn />);

    expect(screen.queryByRole('button', { name: 'Forgot password?' })).not.toBeInTheDocument();

    view.rerender(<SignIn onForgotPassword={onForgotPassword} />);
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});

describe('SignUp', () => {
  beforeEach(() => {
    authonMocks.client = createClient();
    authonMocks.providers = [];
    navigationMocks.navigateTo.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('completes a normal email sign up exactly once', async () => {
    const user = userEvent.setup();
    const onSignUp = vi.fn();
    authonMocks.client!.signUpWithEmail.mockResolvedValue({ id: 'user_1' });
    render(<SignUp onSignUp={onSignUp} />);

    await fillSignUp(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(onSignUp).toHaveBeenCalledTimes(1));
    expect(authonMocks.client!.signUpWithEmail).toHaveBeenCalledWith(
      'person@example.com',
      'password123',
      { displayName: 'Person' },
    );
  });

  it('allows only one OAuth launch across rapid provider clicks', async () => {
    const user = userEvent.setup();
    const oauth = deferred<void>();
    authonMocks.providers = ['google', 'github'];
    authonMocks.client!.signInWithOAuth
      .mockReturnValueOnce(oauth.promise)
      .mockResolvedValueOnce(undefined);
    render(<SignUp />);

    const google = screen.getByRole('button', { name: 'Continue with Google' });
    const github = screen.getByRole('button', { name: 'Continue with GitHub' });
    act(() => {
      google.click();
      github.click();
    });

    expect(authonMocks.client!.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(authonMocks.client!.signInWithOAuth).toHaveBeenCalledWith('google');

    oauth.resolve();
    await waitFor(() => expect(github).toBeEnabled());
    await user.click(github);
    expect(authonMocks.client!.signInWithOAuth).toHaveBeenCalledTimes(2);
    expect(authonMocks.client!.signInWithOAuth).toHaveBeenLastCalledWith('github');
  });

  it('guards credential submission and preserves sign-up fields when leaving verification', async () => {
    const user = userEvent.setup();
    const signUp = deferred<unknown>();
    const onSignUp = vi.fn();
    authonMocks.client!.signUpWithEmail.mockReturnValue(signUp.promise);
    render(<SignUp onSignUp={onSignUp} />);

    await fillSignUp(user);
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    expect(authonMocks.client!.signUpWithEmail).toHaveBeenCalledTimes(1);

    signUp.resolve({ needsVerification: true, email: 'person@example.com' });
    await user.click(await screen.findByRole('button', { name: 'Back to sign up' }));

    expect(screen.getByLabelText('Display name')).toHaveValue('Person');
    expect(screen.getByLabelText('Email')).toHaveValue('person@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('password123');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('password123');
    expect(onSignUp).not.toHaveBeenCalled();
  });

  it('waits for successful email verification before completing sign up', async () => {
    const user = userEvent.setup();
    const onSignUp = vi.fn();
    authonMocks.client!.signUpWithEmail.mockResolvedValue({
      needsVerification: true,
      email: 'canonical@example.com',
    });
    authonMocks.client!.verifyEmail
      .mockRejectedValueOnce(new Error('Wrong code'))
      .mockResolvedValueOnce({ id: 'user_1' });
    render(<SignUp onSignUp={onSignUp} afterSignUpUrl="/welcome" />);

    await fillSignUp(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(onSignUp).not.toHaveBeenCalled();
    expect(navigationMocks.navigateTo).not.toHaveBeenCalled();

    const codeInput = screen.getByLabelText('Verification code');
    await user.type(codeInput, '111111');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong code');
    expect(onSignUp).not.toHaveBeenCalled();
    expect(navigationMocks.navigateTo).not.toHaveBeenCalled();

    await user.clear(codeInput);
    await user.type(codeInput, '222222');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));
    await waitFor(() => expect(onSignUp).toHaveBeenCalledTimes(1));
    expect(navigationMocks.navigateTo).toHaveBeenCalledOnce();
    expect(navigationMocks.navigateTo).toHaveBeenCalledWith('/welcome');
  });
});
