import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../api/auth';
import { walletApi } from '../api/wallet';
import { useAuth } from '../contexts/useAuth';
import { formatWalletAddress, HOODI_CHAIN_ID, openMetaMask } from '../utils/wallet';
import { colors, font, radius, spacing } from '../theme';

export default function WalletConnectScreen({ navigation }) {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.walletAddress) navigation.goBack();
  }, [user?.walletAddress, navigation]);

  const syncProfile = useCallback(async () => {
    try { const p = await authApi.me(); await updateUserProfile(p); }
    catch { /* ignore */ }
  }, [updateUserProfile]);

  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      if (cancelled || attempts >= 30) { setPolling(false); return; }
      attempts += 1;
      await syncProfile();
      if (!cancelled) setTimeout(poll, 3000);
    };
    poll();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') syncProfile(); });
    return () => { cancelled = true; sub.remove(); };
  }, [polling, syncProfile]);

  const handleOpenMetaMask = async () => {
    setError(''); setLoading(true);
    try { await openMetaMask(); setPolling(true); }
    catch (err) { setError(err.message || 'MetaMask를 열지 못했습니다.'); }
    finally { setLoading(false); }
  };

  const handleManualConnect = async () => {
    const addr = manualAddress.trim();
    if (!addr.startsWith('0x') || addr.length !== 42) {
      setError('올바른 이더리움 주소를 입력하세요 (0x로 시작, 42자).');
      return;
    }
    setLoading(true); setError('');
    try {
      const profile = await walletApi.connect({ walletAddress: addr, chainId: HOODI_CHAIN_ID, walletProvider: 'manual' });
      await updateUserProfile(profile);
    } catch (err) { setError(err.message || '지갑 연결에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.badge}>Wallet Onboarding</Text>
          <Text style={styles.walletIcon}>💳</Text>
          <Text style={styles.title}>MetaMask 지갑을 연결하세요</Text>
          <Text style={styles.desc}>Land-in은 Hoodi testnet 지갑 연결을 사용하여 온체인 NFT 발행을 지원합니다.</Text>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>연결 전 확인사항</Text>
          {['MetaMask 앱이 기기에 설치되어 있어야 합니다.', 'Hoodi Testnet 네트워크를 사용합니다.', '지금 건너뛰고 나중에 연결할 수도 있습니다.'].map((item) => (
            <Text key={item} style={styles.noticeItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.networkCard}>
          <Text style={styles.networkLabel}>대상 네트워크</Text>
          <Text style={styles.networkName}>Ethereum Hoodi Testnet</Text>
          <Text style={styles.chainId}>Chain ID {HOODI_CHAIN_ID}</Text>
        </View>

        {user?.walletAddress && (
          <View style={styles.connectedCard}>
            <Text style={styles.connectedLabel}>현재 연결된 지갑</Text>
            <Text style={styles.connectedAddr}>{formatWalletAddress(user.walletAddress)}</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {polling ? <Text style={styles.polling}>MetaMask에서 승인 후 돌아오면 자동으로 동기화됩니다...</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.primaryBtn, (loading || polling) && styles.disabled]} onPress={handleOpenMetaMask} disabled={loading || polling}>
            <Text style={styles.primaryBtnText}>{loading ? 'MetaMask 열기...' : polling ? '승인 대기 중...' : 'MetaMask로 연결'}</Text>
          </TouchableOpacity>

          {polling && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={syncProfile}>
              <Text style={styles.secondaryBtnText}>승인했습니다, 다시 확인</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowManual((v) => !v)}>
            <Text style={styles.secondaryBtnText}>지갑 주소 직접 입력</Text>
          </TouchableOpacity>

          {showManual && (
            <View style={styles.manualWrap}>
              <TextInput style={styles.manualInput} value={manualAddress} onChangeText={setManualAddress}
                placeholder="0x..." placeholderTextColor={colors.gray400} autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleManualConnect} disabled={loading}>
                <Text style={styles.primaryBtnText}>주소로 연결</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.skipText}>지금은 건너뛰기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  badge: { backgroundColor: colors.primarySoft, borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: 4, fontSize: font.xs, color: colors.primary, fontWeight: '700' },
  walletIcon: { fontSize: 64 },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.gray900, textAlign: 'center' },
  desc: { fontSize: font.sm, color: colors.gray500, textAlign: 'center', lineHeight: 20 },
  noticeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  noticeTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900, marginBottom: spacing.xs },
  noticeItem: { fontSize: font.sm, color: colors.gray500, lineHeight: 22 },
  networkCard: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.lg, gap: spacing.xs },
  networkLabel: { fontSize: font.xs, color: colors.gray400 },
  networkName: { fontSize: font.sm, fontWeight: '700', color: colors.gray900 },
  chainId: { fontSize: font.xs, color: colors.gray500 },
  connectedCard: { backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', gap: spacing.xs },
  connectedLabel: { fontSize: font.xs, color: colors.success },
  connectedAddr: { fontSize: font.lg, fontWeight: '700', color: colors.gray900 },
  error: { fontSize: font.sm, color: colors.danger, textAlign: 'center' },
  polling: { fontSize: font.sm, color: colors.primary, textAlign: 'center' },
  actions: { gap: spacing.md },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: font.md },
  secondaryBtn: { backgroundColor: colors.gray100, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  secondaryBtnText: { color: colors.gray600, fontWeight: '600', fontSize: font.sm },
  disabled: { opacity: 0.6 },
  manualWrap: { gap: spacing.sm },
  manualInput: { backgroundColor: colors.gray100, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: font.md, color: colors.gray900 },
  skipBtn: { paddingVertical: spacing.sm, alignItems: 'center' },
  skipText: { color: colors.gray400, fontSize: font.sm },
});
