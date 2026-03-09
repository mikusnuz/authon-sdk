import { useCallback, useContext, useEffect, useState } from 'react';
import type { AuthonOrganization, OrganizationMember } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';

export interface UseOrganizationReturn {
  organization: AuthonOrganization | null;
  members: OrganizationMember[];
  isLoaded: boolean;
}

export function useOrganization(): UseOrganizationReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useOrganization must be used within <AuthonProvider>');

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const organization = ctx.activeOrganization;

  useEffect(() => {
    if (!organization || !ctx.client) {
      setMembers([]);
      setIsLoaded(!organization);
      return;
    }

    setIsLoaded(false);
    ctx.client.organizations
      .getMembers(organization.id)
      .then((m) => {
        setMembers(m);
        setIsLoaded(true);
      })
      .catch(() => {
        setMembers([]);
        setIsLoaded(true);
      });
  }, [organization?.id, ctx.client]);

  return {
    organization,
    members,
    isLoaded,
  };
}
