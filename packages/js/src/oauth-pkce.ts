/**
 * PKCE helpers for browser OAuth.
 *
 * The SDK instance that starts a sign-in keeps a random verifier and sends only its S256 hash to
 * Authon. After the provider login, Authon gives the browser a one-time code (postMessage to the
 * exact origin that started the flow, or a redirect back to it). Tokens are issued only for
 * code + verifier, so knowing the OAuth state, or holding a verifier without the code delivered to
 * this origin, is never enough.
 */

export const OAUTH_CODE_PARAM = 'authon_code';
export const OAUTH_STATE_PARAM = 'authon_oauth_state';
export const OAUTH_ERROR_PARAM = 'authon_oauth_error';
export const OAUTH_POPUP_PARAM = 'authon_oauth_popup';

const VERIFIER_KEY_PREFIX = 'authon-oauth-verifier:';
const HANDOFF_KEY_PREFIX = 'authon-oauth-handoff:';
const STORED_TTL_MS = 10 * 60 * 1000;

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getCrypto(): Crypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.getRandomValues || !c.subtle) {
    throw new Error('Authon OAuth needs the Web Crypto API (a secure https:// or localhost page)');
  }
  return c;
}

/** 32 random bytes, base64url (43 chars, RFC 7636). */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  getCrypto().getRandomValues(bytes);
  return base64Url(bytes);
}

export async function computeCodeChallenge(verifier: string): Promise<string> {
  const digest = await getCrypto().subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateCodeVerifier();
  return { verifier, challenge: await computeCodeChallenge(verifier) };
}

/** Redirect flow only: the page unloads, so the verifier waits in this tab's sessionStorage. */
export function saveRedirectVerifier(state: string, verifier: string): void {
  try {
    sessionStorage.setItem(VERIFIER_KEY_PREFIX + state, JSON.stringify({ v: verifier, at: Date.now() }));
  } catch {
    /* storage unavailable: the code will simply not be redeemable */
  }
}

/** Returns and deletes the verifier saved for this state (single use). */
export function takeRedirectVerifier(state: string): string | null {
  try {
    const key = VERIFIER_KEY_PREFIX + state;
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v?: unknown; at?: unknown };
    if (typeof parsed.v !== 'string' || typeof parsed.at !== 'number') return null;
    if (Date.now() - parsed.at > STORED_TTL_MS) return null;
    return parsed.v;
  } catch {
    return null;
  }
}

export function handoffKey(state: string): string {
  return HANDOFF_KEY_PREFIX + state;
}

export interface OAuthHandoff {
  code?: string;
  error?: string;
  at: number;
}

/**
 * Popup fallback when the popup lost its opener (COOP, Safari): Authon sends the popup back to
 * this origin, which leaves the code in same-origin localStorage for the SDK instance that is
 * waiting in the opener tab. Other sites cannot read it, and it is useless without the verifier.
 */
export function writeHandoff(state: string, value: { code?: string; error?: string }): void {
  try {
    localStorage.setItem(handoffKey(state), JSON.stringify({ ...value, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readHandoff(raw: string | null): OAuthHandoff | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OAuthHandoff>;
    if (typeof parsed.at !== 'number' || Date.now() - parsed.at > STORED_TTL_MS) return null;
    return {
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      error: typeof parsed.error === 'string' ? parsed.error : undefined,
      at: parsed.at,
    };
  } catch {
    return null;
  }
}

/** Takes (reads and deletes) the handoff for this state. */
export function takeHandoff(state: string): OAuthHandoff | null {
  try {
    const key = handoffKey(state);
    const value = readHandoff(localStorage.getItem(key));
    if (value) localStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}

/** Removes expired handoff entries (for example from sign-ins that were abandoned). */
export function pruneHandoffs(): void {
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(HANDOFF_KEY_PREFIX) && !readHandoff(localStorage.getItem(key))) stale.push(key);
    }
    for (const key of stale) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** The current page without Authon's OAuth result parameters (used as the popup fallback target). */
export function currentReturnUrl(): string {
  const url = new URL(window.location.href);
  for (const param of [OAUTH_CODE_PARAM, OAUTH_STATE_PARAM, OAUTH_ERROR_PARAM, OAUTH_POPUP_PARAM]) {
    url.searchParams.delete(param);
  }
  url.hash = '';
  return url.toString();
}
