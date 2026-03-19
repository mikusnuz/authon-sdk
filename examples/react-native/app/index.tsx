import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthon, useUser } from '@authon/react-native';

const FEATURES = [
  { title: 'Email & Password Auth', desc: 'Sign in / sign up with full validation.' },
  { title: 'Social Login (10 providers)', desc: 'Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.' },
  { title: 'Two-Factor Auth (MFA)', desc: 'TOTP authenticator app setup with QR code and backup codes.' },
  { title: 'Session Management', desc: 'List active sessions across devices, revoke any session.' },
  { title: 'Profile Management', desc: 'Update display name, avatar URL, phone number.' },
  { title: 'Password Reset', desc: 'Send a magic link to reset password via email.' },
  { title: 'Secure Token Storage', desc: 'Tokens persisted with expo-secure-store, auto-refreshed.' },
  { title: 'OAuth via Browser', desc: 'Opens expo-web-browser for OAuth, polls for completion.' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, signOut } = useAuthon();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>v0.3.0  |  React Native Example</Text>
        </View>
        <Text style={styles.heroTitle}>Authon React Native SDK</Text>
        <Text style={styles.heroSubtitle}>
          Full auth flow demo using{' '}
          <Text style={styles.code}>@authon/react-native</Text>.
          Every feature — demonstrated and ready to copy.
        </Text>

        {isSignedIn ? (
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.displayName ?? user?.email?.split('@')[0]}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        ) : null}

        {isSignedIn ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/profile')}>
              <Text style={styles.primaryBtnText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/mfa')}>
              <Text style={styles.secondaryBtnText}>MFA Setup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/sessions')}>
              <Text style={styles.secondaryBtnText}>Sessions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerBtn} onPress={() => signOut()}>
              <Text style={styles.dangerBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/sign-in')}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/sign-up')}>
              <Text style={styles.secondaryBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Features Demonstrated</Text>
      {FEATURES.map((f) => (
        <View key={f.title} style={styles.featureCard}>
          <Text style={styles.featureTitle}>{f.title}</Text>
          <Text style={styles.featureDesc}>{f.desc}</Text>
        </View>
      ))}

      <View style={styles.codeCard}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{`import { AuthonProvider, useAuthon } from '@authon/react-native'

function App() {
  return (
    <AuthonProvider publishableKey="your-key">
      <YourApp />
    </AuthonProvider>
  )
}`}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f13' },
  loadingText: { color: '#94a3b8', fontSize: 16 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  badge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: { color: '#7c3aed', fontWeight: '600', fontSize: 13 },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  code: { color: '#a78bfa', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 4 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { color: '#f1f5f9', fontWeight: '600', fontSize: 15 },
  userEmail: { color: '#64748b', fontSize: 13, marginTop: 2 },
  buttonGroup: { width: '100%', gap: 10 },
  primaryBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 12,
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  featureTitle: { color: '#e2e8f0', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  featureDesc: { color: '#64748b', fontSize: 13, lineHeight: 20 },
  codeCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  codeBlock: {
    backgroundColor: '#0f0f13',
    borderRadius: 8,
    padding: 16,
  },
  codeText: { color: '#93c5fd', fontFamily: 'monospace', fontSize: 13, lineHeight: 22 },
});
