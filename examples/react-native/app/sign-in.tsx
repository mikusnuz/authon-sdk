import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuthon, SocialButtons } from '@authon/react-native';

type MfaState = { required: true; mfaToken: string } | { required: false };

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, startOAuth, completeOAuth, client } = useAuthon();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfa, setMfa] = useState<MfaState>({ required: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signIn({ strategy: 'email_password', email, password });
      router.replace('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      if (msg.toLowerCase().includes('mfa') || msg.toLowerCase().includes('two-factor')) {
        setMfa({ required: true, mfaToken: msg });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (!mfa.required || mfaCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await client.signIn({ strategy: 'email_password', email, password });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    setError('');
    try {
      const { url, state } = await startOAuth(provider as any);
      const result = await WebBrowser.openAuthSessionAsync(url);
      if (result.type !== 'success') throw new Error('OAuth cancelled');
      await completeOAuth(state);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth failed');
    } finally {
      setLoading(false);
    }
  };

  if (mfa.required) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Two-Factor Authentication</Text>
            <Text style={styles.cardSubtitle}>
              Enter the 6-digit code from your authenticator app
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="000000"
              placeholderTextColor="#475569"
              value={mfaCode}
              onChangeText={setMfaCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.primaryBtn, mfaCode.length !== 6 && styles.disabled]}
              onPress={handleMfaVerify}
              disabled={loading || mfaCode.length !== 6}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Verifying...' : 'Verify'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => { setMfa({ required: false }); setMfaCode(''); setError(''); }}
            >
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
            />
            <TouchableOpacity onPress={() => router.push('/reset-password')}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <SocialButtons
            onSuccess={() => router.replace('/')}
            onError={(e) => setError(e.message)}
            compact
          />

          <TouchableOpacity onPress={() => router.push('/sign-up')}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#f1f5f9', textAlign: 'center' },
  cardSubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
  formGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  input: {
    backgroundColor: '#0f0f13',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 15,
  },
  codeInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  linkText: { color: '#7c3aed', fontSize: 13, textAlign: 'right', marginTop: 4 },
  primaryBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#2d2d3d' },
  dividerText: { color: '#475569', fontSize: 13 },
  footerText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
  footerLink: { color: '#7c3aed', fontWeight: '600' },
});
