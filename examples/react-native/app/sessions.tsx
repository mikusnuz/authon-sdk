import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthon } from '@authon/react-native';
import { ProtectedScreen } from '../components/ProtectedScreen';

interface SessionInfo {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  createdAt?: string;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown device';
  if (ua.includes('iPhone') || ua.includes('Android')) return 'Mobile';
  if (ua.includes('iPad')) return 'Tablet';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
}

export default function SessionsScreen() {
  return (
    <ProtectedScreen>
      <SessionsContent />
    </ProtectedScreen>
  );
}

function SessionsContent() {
  const { client } = useAuthon();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSessions = useCallback(async () => {
    setError('');
    try {
      const token = client.getAccessToken();
      if (!token) throw new Error('Not authenticated');
      const apiUrl = client.getApiUrl();
      const res = await fetch(`${apiUrl}/v1/auth/me/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load sessions: ${res.status}`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [client]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    setSuccess('');
    setError('');
    try {
      const token = client.getAccessToken();
      if (!token) throw new Error('Not authenticated');
      const apiUrl = client.getApiUrl();
      const res = await fetch(`${apiUrl}/v1/auth/me/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to revoke session: ${res.status}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setSuccess('Session revoked successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7c3aed" />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Active Sessions</Text>
          <Text style={styles.pageSubtitle}>{sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      {sessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active sessions found</Text>
        </View>
      ) : (
        sessions.map((session, i) => (
          <SessionRow
            key={session.id}
            session={session}
            isCurrent={i === 0}
            revoking={revoking === session.id}
            onRevoke={() => handleRevoke(session.id)}
          />
        ))
      )}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Security Tip</Text>
        <Text style={styles.tipText}>
          If you notice any suspicious sessions, revoke them immediately and change your password.
          Sessions are automatically cleared after 30 days of inactivity.
        </Text>
      </View>
    </ScrollView>
  );
}

interface SessionRowProps {
  session: SessionInfo;
  isCurrent: boolean;
  revoking: boolean;
  onRevoke: () => void;
}

function SessionRow({ session, isCurrent, revoking, onRevoke }: SessionRowProps) {
  const ua = session.userAgent ?? '';
  const device = parseUserAgent(ua);
  const shortUa = ua.length > 50 ? ua.slice(0, 50) + '…' : ua;

  return (
    <View style={[styles.sessionCard, isCurrent && styles.sessionCardCurrent]}>
      <View style={styles.sessionMain}>
        <View style={[styles.deviceIcon, isCurrent && styles.deviceIconCurrent]}>
          <Text style={styles.deviceIconText}>{isCurrent ? 'C' : 'D'}</Text>
        </View>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionTitleRow}>
            <Text style={styles.sessionDevice}>{device}</Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          {shortUa ? (
            <Text style={styles.sessionUa} numberOfLines={1}>{shortUa}</Text>
          ) : null}
          <View style={styles.sessionMeta}>
            {session.ipAddress ? (
              <Text style={styles.sessionMetaText}>IP: {session.ipAddress}</Text>
            ) : null}
            {session.lastActiveAt ? (
              <Text style={styles.sessionMetaText}>Active {formatRelative(session.lastActiveAt)}</Text>
            ) : null}
            {session.createdAt ? (
              <Text style={styles.sessionMetaText}>Signed in {formatDate(session.createdAt)}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {!isCurrent && (
        <TouchableOpacity
          style={[styles.revokeBtn, revoking && styles.disabled]}
          onPress={onRevoke}
          disabled={revoking}
        >
          {revoking
            ? <ActivityIndicator color="#ef4444" size="small" />
            : <Text style={styles.revokeBtnText}>Revoke</Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 20, gap: 12, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f13' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#f1f5f9' },
  pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  refreshBtn: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
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
  emptyCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: { color: '#64748b', fontSize: 15 },
  sessionCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sessionCardCurrent: { borderColor: 'rgba(124, 58, 237, 0.3)' },
  sessionMain: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deviceIconCurrent: { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  deviceIconText: { color: '#94a3b8', fontWeight: '700', fontSize: 14 },
  sessionInfo: { flex: 1 },
  sessionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sessionDevice: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  currentBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: { color: '#22c55e', fontSize: 11, fontWeight: '600' },
  sessionUa: { color: '#475569', fontSize: 12, lineHeight: 18 },
  sessionMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  sessionMetaText: { color: '#475569', fontSize: 11 },
  revokeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    alignItems: 'center',
    minWidth: 72,
  },
  revokeBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  disabled: { opacity: 0.5 },
  tipCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 14,
    padding: 16,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 6 },
  tipText: { fontSize: 13, color: '#64748b', lineHeight: 20 },
});
