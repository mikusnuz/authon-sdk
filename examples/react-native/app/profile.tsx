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
import { useAuthon, useUser } from '@authon/react-native';
import { ProtectedScreen } from '../components/ProtectedScreen';

export default function ProfileScreen() {
  return (
    <ProtectedScreen>
      <ProfileContent />
    </ProtectedScreen>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { client, signOut } = useAuthon();
  const { user } = useUser();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = client.getAccessToken();
      if (!token) throw new Error('Not authenticated');
      const apiUrl = client.getApiUrl();
      const res = await fetch(`${apiUrl}/v1/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: displayName || undefined,
          avatarUrl: avatarUrl || undefined,
          phone: phone || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(body.message || 'Failed to update profile');
      }
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName ?? 'No display name'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.emailVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Email verified</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <InfoRow label="User ID" value={user?.id ?? '-'} mono />
          <InfoRow label="Email" value={user?.email ?? '-'} />
          {user?.phone ? <InfoRow label="Phone" value={user.phone} /> : null}
          {joinDate ? <InfoRow label="Joined" value={joinDate} /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#475569"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email ?? ''}
              editable={false}
            />
            <Text style={styles.hintText}>Email cannot be changed</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor="#475569"
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#475569"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Saving...' : 'Save changes'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/mfa')}>
            <Text style={styles.actionText}>Two-Factor Authentication</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/sessions')}>
            <Text style={styles.actionText}>Active Sessions</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/delete-account')}>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete Account</Text>
            <Text style={[styles.chevron, { color: '#ef4444' }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Sign Out</Text>
            <Text style={[styles.chevron, { color: '#ef4444' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  userInfo: { flex: 1 },
  userName: { color: '#f1f5f9', fontWeight: '700', fontSize: 17 },
  userEmail: { color: '#64748b', fontSize: 13, marginTop: 2 },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  verifiedText: { color: '#22c55e', fontSize: 11, fontWeight: '600' },
  infoCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  card: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  infoLabel: { fontSize: 13, color: '#475569', width: 64, flexShrink: 0 },
  infoValue: { fontSize: 13, color: '#94a3b8', flex: 1 },
  mono: { fontFamily: 'monospace' },
  formGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  hintText: { fontSize: 12, color: '#475569' },
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
  inputDisabled: { opacity: 0.5 },
  primaryBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
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
  successText: {
    color: '#22c55e',
    fontSize: 13,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  actionsCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d3d',
  },
  actionText: { color: '#94a3b8', fontSize: 15, fontWeight: '500' },
  chevron: { color: '#475569', fontSize: 22, fontWeight: '300' },
});
