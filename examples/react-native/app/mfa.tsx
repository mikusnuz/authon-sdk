import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthon } from '@authon/react-native';
import { ProtectedScreen } from '../components/ProtectedScreen';

type SetupStep = 'idle' | 'qr' | 'verify' | 'done';

interface MfaStatus {
  enabled: boolean;
  backupCodesRemaining?: number;
}

export default function MfaScreen() {
  return (
    <ProtectedScreen>
      <MfaContent />
    </ProtectedScreen>
  );
}

function MfaContent() {
  const { client } = useAuthon();

  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<SetupStep>('idle');
  const [qrData, setQrData] = useState<{
    secret: string;
    backupCodes: string[];
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [regenCode, setRegenCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [showRegen, setShowRegen] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mfaRequest = useCallback(
    async (method: string, path: string, body?: unknown) => {
      const token = client.getAccessToken();
      if (!token) throw new Error('Must be signed in');
      const apiUrl = client.getApiUrl();
      const res = await fetch(`${apiUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Request failed: ${res.status}`);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : undefined;
    },
    [client],
  );

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const s = await mfaRequest('GET', '/v1/auth/mfa/status');
      setStatus(s as MfaStatus);
    } catch {
      setStatus(null);
    } finally {
      setStatusLoading(false);
    }
  }, [mfaRequest]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleSetupStart = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await mfaRequest('POST', '/v1/auth/mfa/totp/setup') as any;
      setQrData({ secret: res.secret, backupCodes: res.backupCodes ?? [] });
      setSetupStep('qr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (verifyCode.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      await mfaRequest('POST', '/v1/auth/mfa/totp/verify-setup', { code: verifyCode });
      setSetupStep('done');
      setSuccess('MFA enabled successfully!');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      await mfaRequest('POST', '/v1/auth/mfa/disable', { code: disableCode });
      setShowDisable(false);
      setDisableCode('');
      setSuccess('MFA has been disabled.');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (regenCode.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await mfaRequest('POST', '/v1/auth/mfa/backup-codes/regenerate', { code: regenCode }) as any;
      setNewBackupCodes(res.backupCodes);
      setShowRegen(false);
      setRegenCode('');
      setSuccess('Backup codes regenerated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Two-Factor Authentication</Text>
      <Text style={styles.pageSubtitle}>
        Add an extra layer of security to your account
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.statusLabel}>Authenticator App</Text>
            <Text style={styles.statusDesc}>
              {status?.enabled
                ? `Active — ${status.backupCodesRemaining} backup codes remaining`
                : 'Not configured'}
            </Text>
          </View>
          <View style={[styles.badge, status?.enabled ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.badgeText, status?.enabled ? styles.badgeTextActive : styles.badgeTextInactive]}>
              {status?.enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {!status?.enabled && setupStep === 'idle' && (
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleSetupStart}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryBtnText}>Set up authenticator app</Text>
            }
          </TouchableOpacity>
        )}

        {setupStep === 'qr' && qrData && (
          <View style={{ gap: 16 }}>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Open your authenticator app (Google Authenticator, Authy, etc.) and add a new account manually using the secret below.
              </Text>
            </View>

            <View style={styles.secretBox}>
              <Text style={styles.secretLabel}>Manual Entry Secret</Text>
              <Text style={styles.secretText} selectable>{qrData.secret}</Text>
            </View>

            {qrData.backupCodes.length > 0 && (
              <View>
                <Text style={styles.subTitle}>Backup Codes — Save these now</Text>
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Store backup codes safely. Each code can only be used once.
                  </Text>
                </View>
                <View style={styles.codesGrid}>
                  {qrData.backupCodes.map(code => (
                    <View key={code} style={styles.codeChip}>
                      <Text style={styles.codeChipText} selectable>{code}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSetupStep('verify')}>
              <Text style={styles.secondaryBtnText}>I've added the secret — Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {setupStep === 'verify' && (
          <View style={{ gap: 12 }}>
            <Text style={styles.subTitle}>Enter the 6-digit code from your authenticator app</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="000000"
              placeholderTextColor="#475569"
              value={verifyCode}
              onChangeText={setVerifyCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.primaryBtn, (loading || verifyCode.length !== 6) && styles.disabled]}
              onPress={handleVerifySetup}
              disabled={loading || verifyCode.length !== 6}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.primaryBtnText}>Verify & Enable</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {setupStep === 'done' && status?.enabled && (
          <Text style={styles.successText}>MFA is now active on your account!</Text>
        )}

        {status?.enabled && setupStep === 'idle' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={() => { setShowRegen(true); setShowDisable(false); }}
            >
              <Text style={styles.secondaryBtnText}>Regen codes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dangerBtn, { flex: 1 }]}
              onPress={() => { setShowDisable(true); setShowRegen(false); }}
            >
              <Text style={styles.dangerBtnText}>Disable MFA</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showDisable && (
        <View style={styles.card}>
          <Text style={styles.subTitle}>Disable MFA</Text>
          <Text style={styles.pageSubtitle}>Enter your current TOTP code to confirm.</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="000000"
            placeholderTextColor="#475569"
            value={disableCode}
            onChangeText={setDisableCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.dangerBtn, { flex: 1 }, (loading || disableCode.length !== 6) && styles.disabled]}
              onPress={handleDisable}
              disabled={loading || disableCode.length !== 6}
            >
              {loading
                ? <ActivityIndicator color="#ef4444" size="small" />
                : <Text style={styles.dangerBtnText}>Disable</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={() => { setShowDisable(false); setDisableCode(''); }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showRegen && (
        <View style={styles.card}>
          <Text style={styles.subTitle}>Regenerate Backup Codes</Text>
          <Text style={styles.pageSubtitle}>Enter your TOTP code to generate new backup codes.</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="000000"
            placeholderTextColor="#475569"
            value={regenCode}
            onChangeText={setRegenCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1 }, (loading || regenCode.length !== 6) && styles.disabled]}
              onPress={handleRegenerate}
              disabled={loading || regenCode.length !== 6}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.primaryBtnText}>Regenerate</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={() => { setShowRegen(false); setRegenCode(''); }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {newBackupCodes && (
        <View style={styles.card}>
          <Text style={styles.subTitle}>New Backup Codes</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Previous backup codes have been invalidated. Save these new codes safely.
            </Text>
          </View>
          <View style={styles.codesGrid}>
            {newBackupCodes.map(code => (
              <View key={code} style={styles.codeChip}>
                <Text style={styles.codeChipText} selectable>{code}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f13' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#f1f5f9' },
  pageSubtitle: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  card: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontSize: 15, fontWeight: '600', color: '#f1f5f9' },
  statusDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#2d2d3d',
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: '#22c55e' },
  badgeTextInactive: { color: '#64748b' },
  subTitle: { fontSize: 14, fontWeight: '600', color: '#e2e8f0' },
  secretBox: {
    backgroundColor: '#0f0f13',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 10,
    padding: 14,
  },
  secretLabel: { fontSize: 11, color: '#475569', marginBottom: 6, fontWeight: '600' },
  secretText: { color: '#7c3aed', fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  codesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  codeChip: {
    backgroundColor: '#0f0f13',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeChipText: { color: '#94a3b8', fontFamily: 'monospace', fontSize: 13 },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  warningText: { color: '#f59e0b', fontSize: 13, lineHeight: 20 },
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
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
  buttonRow: { flexDirection: 'row', gap: 10 },
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
});
