import { PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES, type OAuthProviderType } from '@authon/shared';
import { getProviderButtonConfig, type Authon } from '@authon/js';

export interface SocialButtonsConfig {
  compact?: boolean;
  gap?: number;
  labels?: Partial<Record<OAuthProviderType, string>>;
  iconSize?: number;
  borderRadius?: number;
  height?: number;
  size?: number;
}

/**
 * Render social login buttons into a container element.
 *
 * Usage in Nuxt page:
 * ```vue
 * <template>
 *   <div ref="socialContainer" />
 * </template>
 *
 * <script setup>
 * const { $authon } = useNuxtApp()
 * const socialContainer = ref<HTMLElement>()
 *
 * let cleanup: (() => void) | undefined
 * onMounted(async () => {
 *   const { renderSocialButtons } = await import('@authon/nuxt')
 *   cleanup = renderSocialButtons({
 *     client: $authon.client,
 *     container: socialContainer.value!,
 *     compact: true,
 *   })
 * })
 * onUnmounted(() => cleanup?.())
 * </script>
 * ```
 */
export function renderSocialButtons(options: {
  client: Authon;
  container: HTMLElement;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} & SocialButtonsConfig): () => void {
  const {
    client,
    container,
    onSuccess,
    onError,
    compact = false,
    gap,
    labels,
    iconSize,
    borderRadius = 10,
    height = 48,
    size = 48,
  } = options;

  const resolvedGap = gap ?? (compact ? 12 : 10);
  const resolvedIconSize = iconSize ?? (compact ? 24 : 20);
  let loadingProvider: string | null = null;
  let buttons: HTMLButtonElement[] = [];

  const handleClick = async (provider: OAuthProviderType, btn: HTMLButtonElement) => {
    if (loadingProvider) return;
    loadingProvider = provider;
    btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:authon-spin 0.6s linear infinite"></span>';
    buttons.forEach((b) => (b.disabled = true));

    try {
      await client.signInWithOAuth(provider);
      onSuccess?.();
    } catch (e: any) {
      const error = e instanceof Error ? e : new Error(String(e));
      onError?.(error);
    } finally {
      loadingProvider = null;
      renderButtons(providers);
    }
  };

  let providers: OAuthProviderType[] = [];

  function renderButtons(providerList: OAuthProviderType[]) {
    container.innerHTML = '';
    buttons = [];

    if (!document.getElementById('authon-spin-style')) {
      const style = document.createElement('style');
      style.id = 'authon-spin-style';
      style.textContent = '@keyframes authon-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = `${resolvedGap}px`;

    if (compact) {
      wrapper.style.flexDirection = 'row';
      wrapper.style.flexWrap = 'wrap';
      wrapper.style.justifyContent = 'center';
    } else {
      wrapper.style.flexDirection = 'column';
    }

    for (const provider of providerList) {
      const colors = PROVIDER_COLORS[provider] || { bg: '#333', text: '#fff' };
      const displayName = PROVIDER_DISPLAY_NAMES[provider] || provider;
      const config = getProviderButtonConfig(provider);
      const iconSvg = config.iconSvg
        .replace(/width="\d+"/, `width="${resolvedIconSize}"`)
        .replace(/height="\d+"/, `height="${resolvedIconSize}"`);
      const needsBorder = colors.bg.toLowerCase() === '#ffffff';

      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Sign in with ${displayName}`);
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.border = needsBorder ? '1px solid #dadce0' : 'none';
      btn.style.cursor = 'pointer';
      btn.style.backgroundColor = colors.bg;
      btn.style.color = colors.text;
      btn.style.borderRadius = `${borderRadius}px`;
      btn.style.transition = 'opacity 0.15s';
      btn.style.fontFamily = 'inherit';

      if (compact) {
        btn.style.width = `${size}px`;
        btn.style.height = `${size}px`;
        btn.style.padding = '0';
        btn.innerHTML = `<span style="display:flex;align-items:center">${iconSvg}</span>`;
      } else {
        btn.style.width = '100%';
        btn.style.height = `${height}px`;
        btn.style.gap = '10px';
        btn.style.paddingLeft = '16px';
        btn.style.paddingRight = '16px';
        const buttonLabel = labels?.[provider] ?? `Continue with ${displayName}`;
        btn.innerHTML = `<span style="display:flex;align-items:center;flex-shrink:0">${iconSvg}</span><span style="font-size:15px;font-weight:600;white-space:nowrap">${buttonLabel}</span>`;
      }

      btn.addEventListener('click', () => handleClick(provider, btn));
      btn.addEventListener('mouseenter', () => (btn.style.opacity = '0.85'));
      btn.addEventListener('mouseleave', () => (btn.style.opacity = '1'));

      buttons.push(btn);
      wrapper.appendChild(btn);
    }

    container.appendChild(wrapper);
  }

  client.getProviders().then((p: OAuthProviderType[]) => {
    providers = p;
    if (providers.length > 0) {
      renderButtons(providers);
    }
  });

  return () => {
    container.innerHTML = '';
    buttons = [];
  };
}
