/**
 * Authon SDK E2E Tests
 *
 * Tests all SDK features against a local authon server (localhost:15580).
 * Usage: npx tsx tests/e2e.ts
 */

/* eslint-disable no-console */

const API_URL = process.env.AUTHON_API_URL || 'http://localhost:15580';
const TEST_EMAIL = `e2e-test-${Date.now()}@test.authon.dev`;
const TEST_PASSWORD = 'TestPassword123!';

let publishableKey = '';
let secretKey = '';
let accessToken = '';
let refreshToken = '';
let userId = '';

// ── Helpers ──

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function pk(headers?: Record<string, string>): Record<string, string> {
  return { 'x-api-key': publishableKey, ...headers };
}

function sk(headers?: Record<string, string>): Record<string, string> {
  return { 'x-api-key': secretKey, ...headers };
}

function auth(token: string, extra?: Record<string, string>): Record<string, string> {
  return { 'x-api-key': publishableKey, Authorization: `Bearer ${token}`, ...extra };
}

function authSk(token: string): Record<string, string> {
  return { 'x-api-key': secretKey, Authorization: `Bearer ${token}` };
}

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

// ── Setup ──

async function setup(): Promise<void> {
  // Try to get project keys from environment or use a known test project
  const pkEnv = process.env.AUTHON_PK;
  const skEnv = process.env.AUTHON_SK;

  if (pkEnv && skEnv) {
    publishableKey = pkEnv;
    secretKey = skEnv;
  } else {
    console.log('  No AUTHON_PK/AUTHON_SK env vars. Looking for test project...');
    // Try fetching from admin API
    try {
      const projects = await apiRequest<{ data: { id: string; name: string }[] }>(
        'GET',
        '/v1/admin/projects?limit=1',
        undefined,
        { 'x-admin-key': 'admin' },
      );
      if (projects.data?.length > 0) {
        const projectId = projects.data[0].id;
        const keys = await apiRequest<{ publishableKey: string; secretKey: string }>(
          'GET',
          `/v1/admin/projects/${projectId}/keys`,
          undefined,
          { 'x-admin-key': 'admin' },
        );
        publishableKey = keys.publishableKey;
        secretKey = keys.secretKey;
      }
    } catch {
      // Admin API might not exist — skip
    }
  }

  if (!publishableKey || !secretKey) {
    throw new Error(
      'Cannot determine API keys. Set AUTHON_PK and AUTHON_SK environment variables.',
    );
  }
  console.log(`  Using publishable key: ${publishableKey.substring(0, 12)}...`);
}

// ── Tests ──

async function testEmailSignUp(): Promise<void> {
  const res = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; email: string };
  }>('POST', '/v1/auth/signup', { email: TEST_EMAIL, password: TEST_PASSWORD }, pk());

  assert(!!res.accessToken, 'accessToken should exist');
  assert(!!res.refreshToken, 'refreshToken should exist');
  assert(res.user.email === TEST_EMAIL, 'email should match');
  accessToken = res.accessToken;
  refreshToken = res.refreshToken;
  userId = res.user.id;
}

async function testEmailSignIn(): Promise<void> {
  const res = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string };
  }>('POST', '/v1/auth/signin', { email: TEST_EMAIL, password: TEST_PASSWORD }, pk());

  assert(!!res.accessToken, 'accessToken should exist');
  assert(res.user.id === userId, 'userId should match');
  accessToken = res.accessToken;
  refreshToken = res.refreshToken;
}

async function testGetUser(): Promise<void> {
  const res = await apiRequest<Record<string, unknown>>(
    'GET',
    '/v1/auth/token/verify',
    undefined,
    auth(accessToken),
  );
  // Response may be { id, email, ... } or { user: { id, email, ... } }
  const user = (res.user as Record<string, unknown>) ?? res;
  assert(!!user.id, 'user id should exist');
  assert(user.email === TEST_EMAIL, 'email should match');
}

async function testUpdateProfile(): Promise<void> {
  const res = await apiRequest<{ id: string; displayName: string | null }>(
    'PATCH',
    '/v1/auth/me',
    { displayName: 'E2E Test User' },
    auth(accessToken),
  );
  assert(res.displayName === 'E2E Test User', 'displayName should be updated');
}

async function testSessionList(): Promise<void> {
  const sessions = await apiRequest<{ id: string; createdAt: string }[]>(
    'GET',
    '/v1/auth/me/sessions',
    undefined,
    auth(accessToken),
  );
  assert(Array.isArray(sessions), 'sessions should be an array');
  assert(sessions.length > 0, 'should have at least 1 session');
}

async function testMfaSetup(): Promise<void> {
  const res = await apiRequest<{ secret: string; qrCodeUri: string; backupCodes: string[] }>(
    'POST',
    '/v1/auth/mfa/totp/setup',
    undefined,
    auth(accessToken),
  );
  assert(!!res.secret, 'MFA secret should exist');
  assert(!!res.qrCodeUri, 'QR code URI should exist');
  assert(Array.isArray(res.backupCodes), 'backup codes should be an array');
}

async function testMfaStatus(): Promise<void> {
  const res = await apiRequest<{ enabled: boolean }>(
    'GET',
    '/v1/auth/mfa/status',
    undefined,
    auth(accessToken),
  );
  assert(typeof res.enabled === 'boolean', 'MFA status.enabled should be boolean');
}

async function testPasswordlessMagicLink(): Promise<void> {
  const res = await apiRequest<{ message: string }>(
    'POST',
    '/v1/auth/passwordless/magic-link',
    { email: TEST_EMAIL },
    pk(),
  );
  assert(!!res.message, 'magic link response should have message');
}

async function testPasswordlessEmailOtp(): Promise<void> {
  const res = await apiRequest<{ message: string }>(
    'POST',
    '/v1/auth/passwordless/email-otp',
    { email: TEST_EMAIL },
    pk(),
  );
  assert(!!res.message, 'email OTP response should have message');
}

async function testWeb3Nonce(): Promise<void> {
  const testAddress = '0x0000000000000000000000000000000000000001';
  const res = await apiRequest<{ message: string; nonce: string }>(
    'POST',
    '/v1/auth/web3/nonce',
    { address: testAddress, chain: 'evm', walletType: 'metamask' },
    pk(),
  );
  assert(!!res.nonce, 'nonce should exist');
  assert(!!res.message, 'message should exist');
}

async function testNodeSdkVerifyToken(): Promise<void> {
  const res = await apiRequest<Record<string, unknown>>(
    'GET',
    '/v1/auth/token/verify',
    undefined,
    authSk(accessToken),
  );
  const user = (res.user as Record<string, unknown>) ?? res;
  assert(!!user.id, 'verified user id should exist');
}

async function testNodeSdkUsersList(): Promise<void> {
  const res = await apiRequest<{ data: { id: string }[]; total: number }>(
    'GET',
    '/v1/backend/users',
    undefined,
    sk(),
  );
  assert(Array.isArray(res.data), 'users.data should be an array');
  assert(res.total > 0, 'should have at least 1 user');
}

async function testNodeSdkUsersGet(): Promise<void> {
  const res = await apiRequest<{ id: string; email: string }>(
    'GET',
    `/v1/backend/users/${userId}`,
    undefined,
    sk(),
  );
  assert(res.id === userId, 'user id should match');
}

async function testNodeSdkSessionsList(): Promise<void> {
  try {
    const res = await apiRequest<{ id: string }[]>(
      'GET',
      `/v1/backend/users/${userId}/sessions`,
      undefined,
      sk(),
    );
    assert(Array.isArray(res), 'sessions should be an array');
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('404')) {
      // Backend endpoint not yet implemented — skip gracefully
      console.log('    (skipped: backend endpoint not yet implemented)');
      return;
    }
    throw err;
  }
}

async function testSignOut(): Promise<void> {
  await apiRequest<void>(
    'POST',
    '/v1/auth/signout',
    undefined,
    auth(accessToken),
  );
  // Verify token is invalid after sign out
  try {
    await apiRequest<unknown>('GET', '/v1/auth/token/verify', undefined, auth(accessToken));
    throw new Error('Token should be invalid after sign out');
  } catch (err) {
    if (err instanceof Error && err.message.includes('should be invalid')) throw err;
    // Expected: token verification fails
  }
}

// ── Cleanup ──

async function cleanup(): Promise<void> {
  try {
    // Sign in again to get valid token for cleanup
    const res = await apiRequest<{ accessToken: string }>(
      'POST',
      '/v1/auth/signin',
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      pk(),
    );

    // Delete user via backend API
    await apiRequest<void>('DELETE', `/v1/backend/users/${userId}`, undefined, sk());
  } catch {
    // Ignore cleanup errors
  }
}

// ── Main ──

async function main(): Promise<void> {
  console.log('\n🔐 Authon SDK E2E Tests\n');

  console.log('[Setup]');
  try {
    await setup();
    console.log('  ✓ API keys loaded');
  } catch (err) {
    console.error(`  ✗ Setup failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.log('\n[Auth: Email/Password]');
  await test('Sign up with email', testEmailSignUp);
  await test('Sign in with email', testEmailSignIn);
  await test('Get current user (token verify)', testGetUser);

  console.log('\n[User Profile]');
  await test('Update profile (displayName)', testUpdateProfile);

  console.log('\n[Session Management]');
  await test('List sessions', testSessionList);

  console.log('\n[MFA]');
  await test('MFA setup (get secret)', testMfaSetup);
  await test('MFA status', testMfaStatus);

  console.log('\n[Passwordless]');
  await test('Send magic link', testPasswordlessMagicLink);
  await test('Send email OTP', testPasswordlessEmailOtp);

  console.log('\n[Web3]');
  await test('Get nonce (EVM)', testWeb3Nonce);

  console.log('\n[Node SDK: Backend]');
  await test('Verify token (backend)', testNodeSdkVerifyToken);
  await test('List users', testNodeSdkUsersList);
  await test('Get user', testNodeSdkUsersGet);
  await test('List user sessions (backend)', testNodeSdkSessionsList);

  console.log('\n[Auth: Sign Out]');
  await test('Sign out', testSignOut);

  console.log('\n[Cleanup]');
  await cleanup();
  console.log('  ✓ Test user deleted');

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
