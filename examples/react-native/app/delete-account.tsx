import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthon } from '@authon/react-native';
import { ProtectedScreen } from '../components/ProtectedScreen';

const CONFIRMATION_TEXT = 'DELETE';

export default function DeleteAccountScreen() {
  return (
    <ProtectedScreen>
      <DeleteAccountContent />
    </ProtectedScreen>
  );
}

function DeleteAccountContent() {
  const router = useRouter();
  const { client, signOut } = useAuthon();
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmInput === CONFIRMATION_TEXT;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError('');
    try {
      const token = client.getAccessToken();
      if (!token) throw new Error('Not authenticated');
      const apiUrl = client.getApiUrl();
      const res = await fetch(`${apiUrl}/v1/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(body.message || 'Failed to delete account');
      }
      await signOut();
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.warningIcon}>
          <Text style={styles.warningIconText}>!</Text>
        </View>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.subtitle}>
          This action is{' '}
          <Text style={styles.dangerHighlight}>permanent and irreversible</Text>.
          {'\n'}All your data will be deleted immediately.
        </Text>

        <View style={styles.dangerBox}>
          <Text style={styles.dangerBoxTitle}>This will permanently delete:</Text>
          {[
            'Your account and personal information',
            'All active sessions',
            'MFA configuration and backup codes',
            'Any linked social accounts',
          ].map(item => (
            <Text key={item} style={styles.dangerBoxItem}>• {item}</Text>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Type <Text style={styles.deleteKeyword}>DELETE</Text> to confirm
          </Text>
          <TextInput
            style={[styles.input, isConfirmed && styles.inputDanger]}
            placeholder="DELETE"
            placeholderTextColor="#475569"
            value={confirmInput}
            onChangeText={setConfirmInput}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.dangerBtn, (!isConfirmed || loading) && styles.disabled]}
          onPress={handleDelete}
          disabled={!isConfirmed || loading}
        >
          {loading
            ? <ActivityIndicator color="#ef4444" size="small" />
            : <Text style={styles.dangerBtnText}>Permanently delete my account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel — Keep my account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  warningIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconText: { color: '#ef4444', fontSize: 26, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#f1f5f9' },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  dangerHighlight: { color: '#ef4444', fontWeight: '700' },
  dangerBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    gap: 6,
  },
  dangerBoxTitle: { color: '#ef4444', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  dangerBoxItem: { color: '#f87171', fontSize: 13, lineHeight: 20 },
  formGroup: { gap: 8, width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  deleteKeyword: { color: '#ef4444', fontFamily: 'monospace', fontWeight: '700' },
  input: {
    backgroundColor: '#0f0f13',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 3,
    width: '100%',
  },
  inputDanger: { borderColor: '#ef4444' },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  dangerBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  cancelBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.4 },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
});
