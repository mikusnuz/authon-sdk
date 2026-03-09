import { useCallback, useEffect, useRef, useState } from 'react';
import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import { DEFAULT_BRANDING } from '@authon/shared';
import { useAuthon } from '../useAuthon';

export interface BrandingState {
  branding: BrandingConfig;
  providers: OAuthProviderType[];
  isLoaded: boolean;
}

const cache = new Map<string, BrandingState>();

export function useBranding(): BrandingState {
  const { client } = useAuthon();
  const [state, setState] = useState<BrandingState>(() => {
    const key = (client as any)?.publishableKey as string | undefined;
    return cache.get(key ?? '') ?? { branding: DEFAULT_BRANDING, providers: [], isLoaded: false };
  });
  const fetchedRef = useRef(false);

  const fetchBranding = useCallback(async () => {
    if (!client || fetchedRef.current) return;

    const key = (client as any).publishableKey as string;
    const cached = cache.get(key);
    if (cached) {
      setState(cached);
      return;
    }

    fetchedRef.current = true;
    try {
      const providers = await client.getProviders();
      const apiUrl: string = (client as any).config?.apiUrl ?? 'https://api.authon.dev';
      const res = await fetch(`${apiUrl}/v1/auth/branding`, {
        headers: { 'x-api-key': key },
        credentials: 'include',
      });
      let branding: BrandingConfig = DEFAULT_BRANDING;
      if (res.ok) {
        const data = await res.json();
        branding = { ...DEFAULT_BRANDING, ...data };
      }
      const next: BrandingState = { branding, providers, isLoaded: true };
      cache.set(key, next);
      setState(next);
    } catch {
      const fallback: BrandingState = { branding: DEFAULT_BRANDING, providers: [], isLoaded: true };
      setState(fallback);
    }
  }, [client]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return state;
}
