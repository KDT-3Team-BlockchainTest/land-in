import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Clipboard, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { walletApi } from '../api/wallet';
import { authApi } from '../api/auth';
import { useAuth } from '../auth/useAuth';
import GradientActionButton from '../components/common/GradientActionButton';
import { colors, radius, shadow, typography } from '../theme';

const HOODI_CHAIN_ID = 560048;

export default function WalletConnectScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [inputError, setInputError] = useState('');

  const connected = !!user?.walletAddress;

  async function handleConnect() {
    const address = addressInput.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setInputError('올바른 지갑 주소를 입력하세요 (0x 포함 42자리)');
      return;
    }
    setInputError('');
    setLoading(true);
    try {
      await walletApi.connect({ walletAddress: address, chainId: HOODI_CHAIN_ID, walletProvider: 'metamask' });
      const me = await authApi.me();
      await updateUser(me);
      Alert.alert('연결 완료', '지갑이 연결되었습니다.\n대기 중인 NFT가 있으면 자동으로 민팅됩니다.');
    } catch (err) {
      Alert.alert('연결 실패', err.message || '지갑 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    const text = await Clipboard.getString();
    if (text) setAddressInput(text.trim());
  }

  async function handleDisconnect() {
    Alert.alert('지갑 연결 해제', '지갑 연결을 해제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await walletApi.disconnect();
            const me = await authApi.me();
            await updateUser(me);
          } catch (err) {
            Alert.alert('오류', err.message || '연결 해제에 실패했습니다.');
          } finally { setLoading(false); }
        },
      },
    ]);
  }

  function handleOpenMetaMask() {
    Linking.openURL('https://metamask.app.link/').catch(() => {
      Linking.openURL('https://metamask.io/download/');
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 히어로 */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.foxEmoji}>🦊</Text>
          </View>
          <Text style={styles.heroTitle}>
            {connected ? '지갑이 연결되어 있어요' : 'MetaMask 지갑을 연결하세요'}
          </Text>
          <Text style={styles.heroSub}>
            {connected
              ? 'NFT가 블록체인에 안전하게 기록됩니다'
              : '지갑을 연결하면 수집한 NFT를 블록체인에서 소유할 수 있어요'}
          </Text>
        </View>

        {/* 연결된 경우 */}
        {connected && (
          <View style={styles.connectedCard}>
            <View style={styles.connectedRow}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedLabel}>연결됨</Text>
            </View>
            <Text style={styles.walletAddr}>{user.walletAddress}</Text>
            {user.walletChainId && (
              <Text style={styles.chainId}>Chain ID: {user.walletChainId}</Text>
            )}
          </View>
        )}

        {/* 네트워크 정보 */}
        <View style={styles.networkCard}>
          <Ionicons name="globe-outline" size={18} color={colors.violet} />
          <View style={{ flex: 1 }}>
            <Text style={styles.networkLabel}>지원 네트워크</Text>
            <Text style={styles.networkName}>Ethereum Holesky Testnet</Text>
          </View>
        </View>

        {/* 안내 + 주소 입력 */}
        {!connected && (
          <>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>📱 연결 방법</Text>
              <Text style={styles.noticeStep}>1. MetaMask 앱을 열어 지갑 주소를 복사하세요</Text>
              <Text style={styles.noticeStep}>2. 아래 입력란에 주소를 붙여넣으세요</Text>
              <Text style={styles.noticeStep}>3. "연결하기" 버튼을 눌러 완료하세요</Text>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>지갑 주소</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, inputError ? styles.inputError : null]}
                  placeholder="0x..."
                  placeholderTextColor={colors.gray400}
                  value={addressInput}
                  onChangeText={(t) => { setAddressInput(t); setInputError(''); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste} activeOpacity={0.7}>
                  <Ionicons name="clipboard-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
              <View style={styles.chainRow}>
                <Ionicons name="link-outline" size={14} color={colors.gray400} />
                <Text style={styles.chainText}>Hoodi Testnet · Chain ID {HOODI_CHAIN_ID}</Text>
              </View>
            </View>
          </>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          {connected ? (
            <>
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect} disabled={loading} activeOpacity={0.85}>
                <Text style={styles.disconnectText}>{loading ? '처리 중...' : '지갑 연결 해제'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                <Text style={styles.backBtnText}>돌아가기</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <GradientActionButton
                label="MetaMask 열기"
                onPress={handleOpenMetaMask}
                colors={['#f6851b', '#e2761b']}
              />
              <TouchableOpacity
                style={[styles.connectBtn, (!addressInput || loading) && styles.connectBtnDisabled]}
                onPress={handleConnect}
                disabled={!addressInput || loading}
                activeOpacity={0.85}
              >
                <Text style={styles.connectBtnText}>{loading ? '연결 중...' : '연결하기'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                <Text style={styles.skipText}>나중에 연결하기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(246,133,27,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  foxEmoji: { fontSize: 44 },
  heroTitle: { ...typography.h2, textAlign: 'center', marginBottom: 8 },
  heroSub: { ...typography.body, textAlign: 'center', color: colors.gray500, lineHeight: 22 },
  connectedCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14, ...shadow.card, borderLeftWidth: 4, borderLeftColor: colors.success },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  connectedLabel: { fontSize: 12, fontWeight: '700', color: colors.success },
  walletAddr: { fontSize: 13, fontWeight: '600', color: colors.gray900, fontFamily: 'monospace' || undefined },
  chainId: { fontSize: 12, color: colors.gray500, marginTop: 4 },
  networkCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: radius.md, padding: 14, marginBottom: 14 },
  networkLabel: { fontSize: 11, fontWeight: '600', color: colors.violet, marginBottom: 2 },
  networkName: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  noticeCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 28, ...shadow.card, gap: 6 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  noticeStep: { fontSize: 13, color: colors.gray600, lineHeight: 20 },
  actions: { gap: 12 },
  disconnectBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  disconnectText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  backBtn: { backgroundColor: colors.gray100, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: colors.gray600, fontWeight: '700', fontSize: 15 },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: colors.gray400, fontWeight: '600', fontSize: 14 },
  inputCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 20, ...shadow.card },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.gray500, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  input: { flex: 1, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: colors.gray900, fontFamily: undefined },
  inputError: { borderColor: colors.primary },
  pasteBtn: { padding: 10, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.sm },
  errorText: { fontSize: 12, color: colors.primary, marginBottom: 4 },
  chainRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chainText: { fontSize: 11, color: colors.gray400 },
  connectBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  connectBtnDisabled: { opacity: 0.4 },
  connectBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
