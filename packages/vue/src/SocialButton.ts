import { defineComponent, h, ref, computed, onMounted, type PropType } from 'vue';
import { PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES, type OAuthProviderType } from '@authon/shared';
import { getProviderButtonConfig } from '@authon/js';
import { useAuthon } from './composables';

export const AuthonSocialButton = defineComponent({
  name: 'AuthonSocialButton',
  props: {
    provider: { type: String as PropType<OAuthProviderType>, required: true },
    onClick: { type: Function as PropType<(provider: OAuthProviderType) => void | Promise<void>>, required: true },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    compact: { type: Boolean, default: false },
    iconSize: { type: Number, default: undefined },
    borderRadius: { type: Number, default: 10 },
    height: { type: Number, default: 48 },
    size: { type: Number, default: 48 },
  },
  setup(props) {
    const colors = computed(() => PROVIDER_COLORS[props.provider] || { bg: '#333', text: '#fff' });
    const displayName = computed(() => PROVIDER_DISPLAY_NAMES[props.provider] || props.provider);
    const buttonLabel = computed(() => props.label ?? `Continue with ${displayName.value}`);
    const needsBorder = computed(() => colors.value.bg.toLowerCase() === '#ffffff');
    const resolvedIconSize = computed(() => props.iconSize ?? (props.compact ? 24 : 20));

    const iconSvg = computed(() => {
      const config = getProviderButtonConfig(props.provider);
      return config.iconSvg
        .replace(/width="\d+"/, `width="${resolvedIconSize.value}"`)
        .replace(/height="\d+"/, `height="${resolvedIconSize.value}"`);
    });

    const spinner = () =>
      h('span', {
        style: {
          display: 'inline-block',
          width: '16px',
          height: '16px',
          border: `2px solid ${colors.value.text}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'authon-spin 0.6s linear infinite',
        },
      });

    const icon = () =>
      h('span', {
        style: { display: 'flex', alignItems: 'center', flexShrink: 0 },
        innerHTML: iconSvg.value,
      });

    return () => {
      const borderStyle = needsBorder.value ? { border: '1px solid #dadce0' } : {};

      if (props.compact) {
        return h(
          'button',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
              padding: 0,
              backgroundColor: colors.value.bg,
              borderRadius: `${props.borderRadius}px`,
              width: `${props.size}px`,
              height: `${props.size}px`,
              ...borderStyle,
            },
            onClick: () => props.onClick(props.provider),
            disabled: props.disabled || props.loading,
            'aria-label': `Sign in with ${displayName.value}`,
          },
          [props.loading ? spinner() : icon()],
        );
      }

      return h(
        'button',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            paddingLeft: '16px',
            paddingRight: '16px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'opacity 0.15s',
            width: '100%',
            backgroundColor: colors.value.bg,
            color: colors.value.text,
            borderRadius: `${props.borderRadius}px`,
            height: `${props.height}px`,
            ...borderStyle,
          },
          onClick: () => props.onClick(props.provider),
          disabled: props.disabled || props.loading,
          'aria-label': `Sign in with ${displayName.value}`,
        },
        props.loading
          ? [spinner()]
          : [
              icon(),
              h('span', { style: { fontSize: '15px', fontWeight: 600, whiteSpace: 'nowrap' } }, buttonLabel.value),
            ],
      );
    };
  },
});

export const AuthonSocialButtons = defineComponent({
  name: 'AuthonSocialButtons',
  props: {
    onSuccess: { type: Function as PropType<() => void>, default: undefined },
    onError: { type: Function as PropType<(error: Error) => void>, default: undefined },
    gap: { type: Number, default: undefined },
    compact: { type: Boolean, default: false },
    labels: { type: Object as PropType<Partial<Record<OAuthProviderType, string>>>, default: undefined },
  },
  setup(props) {
    const { client } = useAuthon();
    const providers = ref<OAuthProviderType[]>([]);
    const loadingProvider = ref<string | null>(null);
    const resolvedGap = computed(() => props.gap ?? (props.compact ? 12 : 10));

    onMounted(async () => {
      if (client) {
        providers.value = await client.getProviders();
      }
    });

    const handleClick = async (provider: OAuthProviderType) => {
      if (!client) return;
      loadingProvider.value = provider;
      try {
        await client.signInWithOAuth(provider);
        props.onSuccess?.();
      } catch (e: any) {
        const error = e instanceof Error ? e : new Error(String(e));
        props.onError?.(error);
      } finally {
        loadingProvider.value = null;
      }
    };

    return () => {
      if (providers.value.length === 0) return null;

      const containerStyle = props.compact
        ? { display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'center', gap: `${resolvedGap.value}px` }
        : { display: 'flex', flexDirection: 'column' as const, gap: `${resolvedGap.value}px` };

      return h(
        'div',
        { style: containerStyle },
        providers.value.map((provider) =>
          h(AuthonSocialButton, {
            key: provider,
            provider,
            onClick: handleClick,
            loading: loadingProvider.value === provider,
            disabled: !!loadingProvider.value,
            compact: props.compact,
            label: props.labels?.[provider],
          }),
        ),
      );
    };
  },
});
