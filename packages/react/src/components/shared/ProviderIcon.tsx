import type { OAuthProviderType } from '@authon/shared';
import { getProviderButtonConfig } from '@authon/js';

interface ProviderIconProps {
  provider: OAuthProviderType;
  size?: number;
}

export function ProviderIcon({ provider, size = 20 }: ProviderIconProps) {
  const config = getProviderButtonConfig(provider);
  const svg = config.iconSvg
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`);

  return (
    <span
      style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
