import { useCallback, useContext, useEffect, useState } from 'react';
import type { AuthonOrganization, CreateOrganizationParams } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';

export interface UseOrganizationListReturn {
  organizations: AuthonOrganization[];
  isLoaded: boolean;
  createOrganization: (params: CreateOrganizationParams) => Promise<AuthonOrganization | null>;
  setActive: (org: AuthonOrganization | null) => void;
}

export function useOrganizationList(): UseOrganizationListReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useOrganizationList must be used within <AuthonProvider>');

  const [organizations, setOrganizations] = useState<AuthonOrganization[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!ctx.client || !ctx.isSignedIn) {
      setOrganizations([]);
      setIsLoaded(!ctx.isSignedIn);
      return;
    }

    setIsLoaded(false);
    ctx.client.organizations
      .list()
      .then((res) => {
        setOrganizations(res.data);
        setIsLoaded(true);
      })
      .catch(() => {
        setOrganizations([]);
        setIsLoaded(true);
      });
  }, [ctx.client, ctx.isSignedIn]);

  const createOrganization = useCallback(
    async (params: CreateOrganizationParams): Promise<AuthonOrganization | null> => {
      if (!ctx.client) return null;
      try {
        const org = await ctx.client.organizations.create(params);
        setOrganizations((prev) => [...prev, org]);
        return org;
      } catch {
        return null;
      }
    },
    [ctx.client],
  );

  const setActive = useCallback(
    (org: AuthonOrganization | null) => {
      ctx.setActiveOrganization(org);
    },
    [ctx.setActiveOrganization],
  );

  return {
    organizations,
    isLoaded,
    createOrganization,
    setActive,
  };
}
