import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptProfileSummary } from '../api/adapters';
import { dashboardApi } from '../api/dashboard';
import { walletApi } from '../api/wallet';
import { useAuth } from '../contexts/useAuth';
import { formatWalletAddress, HOODI_CHAIN_ID } from '../utils/wallet';
import { colors, font, radius, shadow, spacing } from '../theme';

const ACHIEVEMENTS = [
  { id: 'first-nft',    label: '첫 NFT 수집',   emoji: '🥇', check: (s) => s.nftCount >= 1 },
  { id: 'five-nfts',   label: '5개 NFT',        emoji: '🌟', check: (s) => s.nftCount >= 5 },
  { id: 'first-city',  label: '첫 도시 탐험',    emoji: '🏙', check: (s) => s.cityCount >= 1 },
  { id: 'three-cities',label: '3개 도시',        emoji: '🌍', check: (s) => s.cityCount >= 3 },
];

const defaultSummary = { nftCount: 0, cityCount: 0, countryCount: 0, completedCollectionCount: 0, landmarkCount: 0, totalDistanceLabel: '0 km' };

export default function MyPageScreen({ navigation }) {
  const { user, logout, updateUserProfile } = useAuth();
  const [summary, setSummary] = useState(defaultSummary);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    dashboardApi.stats().then((s) => setSummary(adaptProfileSummary(s))).catch(() => {});
  }, []);

  const achievements = ACHIEVEMENTS.map((a) => ({ ...a, state: a.check(summary) ? 'unlocked' : 'locked' }));
  const unlockedCount = achievements.filter((a) => a.state === 'unlocked').length;

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  const handleWalletDisconnect = () => {
    Alert.alert('지갑 연결 해제', '현재 연결된 지갑을 해제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '해제', style: 'destructive', onPress: async () => {
        setWalletLoading(true);
        try { const p = await walletApi.disconnect(); await updateUserProfile(p); }
        catch (e) { Alert.alert('오류', e.message || '실패했습니다.'); }
        finally { setWalletLoading(false); }
      }},
    ]);
  };

  const travelStats = [
    { id: 'lm', emoji: 'LM', label: 'Landmarks', value: summary.landmarkCount, color: colors.primary, bg: colors.primarySoft },
    { id: 'ct', emoji: 'CT', label: 'Countries',  value: summary.countryCount,  color: colors.violet,  bg: colors.violetSoft  },
    { id: 'km', emoji: 'KM', label: 'Distance',   value: summary.totalDistanceLabel, color: colors.cyan, bg: colors.cyanSoft },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Page</Text>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileAccent} />
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {user?.avatarUrl
                ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
                : <Text style={styles.avatarLetter}>{(user?.displayName?.[0] ?? 'U').toUpperCase()}</Text>}
            </View>
            <View style={styles.identity}>
              <Text style={styles.displayName}>{user?.displayName ?? 'Land-in User'}</Text>
              <Text style={styles.email}>{user?.email ?? ''}</Text>
              <View style={styles.levelBadge}><Text style={styles.levelText}>City Explorer</Text></View>
            </View>
          </View>
          <View style={styles.miniStats}>
            <View style={[styles.miniStat, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.miniValue, { color: colors.primary }]}>{summary.nftCount}</Text>
              <Text style={styles.miniLabel}>Owned NFTs</Text>
            </View>
            <View style={[styles.miniStat, { backgroundColor: colors.violetSoft }]}>
              <Text style={[styles.miniValue, { color: colors.violet }]}>{summary.cityCount}</Text>
              <Text style={styles.miniLabel}>Visited Cities</Text>
            </View>
          </View>
        </View>

        {/* 지갑 카드 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Wallet Connection</Text>
            <View style={[styles.walletBadge, user?.walletAddress ? styles.connectedBadge : styles.pendingBadge]}>
              <Text style={[styles.walletBadgeText, { color: user?.walletAddress ? colors.success : colors.gray400 }]}>
                {user?.walletAddress ? 'Connected' : 'Not linked'}
              </Text>
            </View>
          </View>
          <Text style={styles.walletAddr}>
            {user?.walletAddress ? formatWalletAddress(user.walletAddress) : '아직 연결된 지갑이 없습니다.'}
          </Text>
          {user?.walletAddress && (
            <Text style={styles.walletMeta}>Hoodi Testnet · Chain ID {user.walletChainId ?? HOODI_CHAIN_ID}</Text>
          )}
          <TouchableOpacity style={styles.walletBtn} onPress={() => navigation.navigate('WalletConnect')} disabled={walletLoading}>
            <Text style={styles.walletBtnText}>{user?.walletAddress ? '지갑 재연결' : '지갑 연결하기'}</Text>
          </TouchableOpacity>
          {user?.walletAddress && (
            <TouchableOpacity onPress={handleWalletDisconnect} disabled={walletLoading}>
              <Text style={styles.disconnectText}>{walletLoading ? '해제 중...' : '연결 해제'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 리워드 바로가기 */}
        <TouchableOpacity style={styles.rewardBtn} onPress={() => navigation.navigate('Rewards')}>
          <Text style={styles.rewardBtnIcon}>🎁</Text>
          <View style={styles.rewardBtnCopy}>
            <Text style={styles.rewardBtnTitle}>내 리워드</Text>
            <Text style={styles.rewardBtnSub}>컬렉션 완성으로 받은 혜택 보기</Text>
          </View>
          <Text style={styles.rewardBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Travel Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Travel Stats</Text>
          {travelStats.map((item) => (
            <View key={item.id} style={styles.travelRow}>
              <View style={[styles.travelIcon, { backgroundColor: item.bg }]}>
                <Text style={[styles.travelIconText, { color: item.color }]}>{item.emoji}</Text>
              </View>
              <Text style={styles.travelLabel}>{item.label}</Text>
              <Text style={[styles.travelValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>{unlockedCount}/{achievements.length}</Text>
          </View>
          <View style={styles.achievementGrid}>
            {achievements.map((a) => (
              <View key={a.id} style={[styles.achievement, a.state === 'locked' && styles.achievementLocked]}>
                <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                <Text style={styles.achievementLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>land-in v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900 },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  profileAccent: { height: 6, backgroundColor: colors.primary },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarLetter: { fontSize: 22, fontWeight: '700', color: colors.primary },
  identity: { flex: 1, gap: 2 },
  displayName: { fontSize: font.lg, fontWeight: '700', color: colors.gray900 },
  email: { fontSize: font.xs, color: colors.gray400 },
  levelBadge: { alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: 4 },
  levelText: { fontSize: font.xs, fontWeight: '600', color: colors.primary },
  miniStats: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingTop: 0 },
  miniStat: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 2 },
  miniValue: { fontSize: font.xl, fontWeight: '800' },
  miniLabel: { fontSize: font.xs, color: colors.gray400 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadow.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  walletBadge: { borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  connectedBadge: { backgroundColor: colors.successSoft },
  pendingBadge: { backgroundColor: colors.gray100 },
  walletBadgeText: { fontSize: font.xs, fontWeight: '700' },
  walletAddr: { fontSize: font.md, fontWeight: '600', color: colors.gray900 },
  walletMeta: { fontSize: font.xs, color: colors.gray400 },
  walletBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  walletBtnText: { color: colors.white, fontWeight: '700', fontSize: font.sm },
  disconnectText: { textAlign: 'center', color: colors.gray400, fontSize: font.sm, paddingVertical: spacing.xs },
  travelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  travelIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  travelIconText: { fontSize: font.xs, fontWeight: '800' },
  travelLabel: { flex: 1, fontSize: font.sm, color: colors.gray600 },
  travelValue: { fontSize: font.lg, fontWeight: '800' },
  achievementCount: { fontSize: font.sm, color: colors.gray400 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  achievement: { width: '47%', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  achievementLocked: { backgroundColor: colors.gray100, opacity: 0.5 },
  achievementEmoji: { fontSize: 28 },
  achievementLabel: { fontSize: font.xs, fontWeight: '600', color: colors.gray600 },
  rewardBtn: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow.card },
  rewardBtnIcon: { fontSize: 28 },
  rewardBtnCopy: { flex: 1 },
  rewardBtnTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  rewardBtnSub: { fontSize: font.xs, color: colors.gray400, marginTop: 2 },
  rewardBtnArrow: { fontSize: font.xl, color: colors.primary },
  logoutBtn: { backgroundColor: colors.gray100, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  logoutText: { fontSize: font.md, fontWeight: '700', color: colors.danger },
  version: { textAlign: 'center', fontSize: font.xs, color: colors.gray300 },
});
