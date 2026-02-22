import { defineComponent, h, onMounted, ref, computed } from 'vue';
import { useAuthon } from './composables';

export const AuthonSignIn = defineComponent({
  name: 'AuthonSignIn',
  props: {
    mode: {
      type: String as () => 'popup' | 'embedded',
      default: 'popup',
    },
  },
  setup(props) {
    const { client } = useAuthon();

    onMounted(() => {
      if (props.mode === 'popup') {
        client?.openSignIn();
      }
    });

    return () => {
      if (props.mode === 'embedded') {
        return h('div', { id: 'authon-signin-container' });
      }
      return null;
    };
  },
});

export const AuthonSignUp = defineComponent({
  name: 'AuthonSignUp',
  props: {
    mode: {
      type: String as () => 'popup' | 'embedded',
      default: 'popup',
    },
  },
  setup(props) {
    const { client } = useAuthon();

    onMounted(() => {
      if (props.mode === 'popup') {
        client?.openSignUp();
      }
    });

    return () => {
      if (props.mode === 'embedded') {
        return h('div', { id: 'authon-signup-container' });
      }
      return null;
    };
  },
});

export const AuthonUserButton = defineComponent({
  name: 'AuthonUserButton',
  setup() {
    const { user, isSignedIn, signOut, openSignIn } = useAuthon();
    const open = ref(false);

    const initials = computed(() => {
      if (!user) return '?';
      const u = user as typeof user;
      if ((u as { displayName?: string | null }).displayName) {
        return ((u as { displayName: string }).displayName)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return ((u as { email?: string | null }).email?.[0] ?? '?').toUpperCase();
    });

    return () => {
      if (!isSignedIn) {
        return h(
          'button',
          {
            onClick: () => openSignIn(),
            style: {
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            },
          },
          'Sign In',
        );
      }

      const avatarUrl = (user as { avatarUrl?: string | null } | null)?.avatarUrl;
      const displayName = (user as { displayName?: string | null } | null)?.displayName;
      const email = (user as { email?: string | null } | null)?.email;

      return h('div', { style: { position: 'relative', display: 'inline-block' } }, [
        h(
          'button',
          {
            onClick: () => (open.value = !open.value),
            style: {
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid #7c3aed',
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              cursor: 'pointer',
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
            },
          },
          avatarUrl
            ? [h('img', { src: avatarUrl, alt: displayName ?? 'avatar', style: { width: '100%', height: '100%', objectFit: 'cover' } })]
            : [initials.value],
        ),
        open.value
          ? h(
              'div',
              {
                style: {
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  minWidth: '200px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 9999,
                  overflow: 'hidden',
                },
              },
              [
                h('div', { style: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' } }, [
                  displayName && h('div', { style: { fontSize: '14px', fontWeight: 600, color: '#111827' } }, displayName),
                  email && h('div', { style: { fontSize: '12px', color: '#6b7280', marginTop: '2px' } }, email),
                ]),
                h(
                  'button',
                  {
                    onClick: async () => {
                      open.value = false;
                      await signOut();
                    },
                    style: {
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#ef4444',
                      fontWeight: 500,
                    },
                  },
                  'Sign out',
                ),
              ],
            )
          : null,
      ]);
    };
  },
});

export const AuthonSignedIn = defineComponent({
  name: 'AuthonSignedIn',
  setup(_, { slots }) {
    const { isSignedIn, isLoading } = useAuthon();
    return () => {
      if (isLoading || !isSignedIn) return null;
      return slots.default?.();
    };
  },
});

export const AuthonSignedOut = defineComponent({
  name: 'AuthonSignedOut',
  setup(_, { slots }) {
    const { isSignedIn, isLoading } = useAuthon();
    return () => {
      if (isLoading || isSignedIn) return null;
      return slots.default?.();
    };
  },
});
