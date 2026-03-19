import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthon } from '@authon/react-native';

type Step = 'email' | 'sent';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { client } = useAuthon();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await client.passwordlessSendCode(email, 'email');
      setStep('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'sent') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heroText}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a magic link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>.{'\n'}
            Click the link to reset your password. The link expires in 15 minutes.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Did not receive the email? Check your spam folder or try again.
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => { setStep('email'); setError(''); }}
            >
              <Text style={styles.secondaryBtnText}>Try again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/sign-in')}>
              <Text style={styles.primaryBtnText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.heroText}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a magic link to reset your password.
          </Text>

          <Text style={styles.apiNote}>
            {'client.passwordlessSendCode(email, "email")'}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  heroText: { fontSize: 24, fontWeight: '700', color: '#f1f5f9', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  emailHighlight: { color: '#f1f5f9', fontWeight: '600' },
  apiNote: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
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
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  warningText: { color: '#f59e0b', fontSize: 13, lineHeight: 20 },
  buttonGroup: { gap: 10 },
  backText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
});
