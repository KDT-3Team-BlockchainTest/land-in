import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardApi } from '../api/dashboard';
import { useAuth } from '../auth/useAuth';
import StatSummaryGrid from '../components/common/StatSummaryGrid';
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
import { colors, radius, shadow, typography } from '../theme';

function MenuItem({ icon, label, value, onPress, chevron = true }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={18} color={colors.gray600} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      {chevron && <Ionicons name="chevron-forward" size={14} color={colors.gray300} />}
    </TouchableOpacity>
  );
}

export default function MyPageScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi.stats().then(setStats).catch(() => {});
  }, []);

  function handleLogout() {
    Alert.alert(t('mypageExtra.logoutTitle'), t('mypageExtra.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('mypage.logout'), style: 'destructive', onPress: logout },
    ]);
  }

  const initial = (user?.displayName || user?.email || '?')[0].toUpperCase();

  const nftCount = stats?.nftCount ?? 0;
  const cityCount = stats?.cityCount ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.displayName}>{user?.displayName || t('mypage.defaultName')}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{t('mypage.level')}</Text>
            </View>
          </View>
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatVal, { color: colors.primary }]}>{nftCount}</Text>
              <Text style={styles.miniStatLabel}>{t('mypage.ownedNfts')}</Text>
            </View>
            <View style={[styles.miniStatDivider]} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatVal, { color: colors.violet }]}>{cityCount}</Text>
              <Text style={styles.miniStatLabel}>{t('mypage.visitedCities')}</Text>
            </View>
          </View>
        </View>

        {/* 지갑 */}
        <TouchableOpacity
          style={[styles.walletCard, user?.walletAddress ? styles.walletConnected : styles.walletEmpty]}
          onPress={() => navigation.navigate('WalletConnect')}
          activeOpacity={0.85}
        >
          <Ionicons name="wallet-outline" size={20} color={user?.walletAddress ? colors.violet : colors.gray400} />
          <View style={{ flex: 1 }}>
            {user?.walletAddress ? (
              <>
                <Text style={[styles.walletLabel, { color: colors.violet }]}>{t('mypage.wallet.connected')}</Text>
                <Text style={styles.walletAddr}>
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </Text>
              </>
            ) : (
              <Text style={styles.walletEmpty}>{t('mypageExtra.walletConnect')}</Text>
            )}
          </View>
          {user?.walletAddress && <View style={styles.connectedDot} />}
        </TouchableOpacity>

        {/* 여행 통계 */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mypage.travel.title')}</Text>
            <StatSummaryGrid stats={[
              { label: t('mypage.travel.landmarks'), value: stats.landmarkCount, color: colors.primary, backgroundColor: colors.primarySoft },
              { label: t('mypage.travel.countries'), value: stats.countryCount, color: colors.violet, backgroundColor: 'rgba(139,92,246,0.08)' },
              { label: t('mypageExtra.collections'), value: stats.completedCollectionCount, color: colors.success, backgroundColor: colors.successSoft },
            ]} />
            {stats.totalDistanceLabel && (
              <View style={styles.distanceRow}>
                <Ionicons name="walk-outline" size={14} color={colors.gray500} />
                <Text style={styles.distanceText}>{t('mypageExtra.totalDistance', { label: stats.totalDistanceLabel })}</Text>
              </View>
            )}
          </View>
        )}

        {/* 메뉴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mypageExtra.accountSection')}</Text>
          <View style={styles.menuGroup}>
            <MenuItem icon="person-outline" label={t('mypageExtra.profileInfo')} onPress={() => {}} />
            <MenuItem icon="stats-chart-outline" label={t('nav.progress')} onPress={() => navigation.navigate('MyProgress')} />
            <MenuItem icon="notifications-outline" label={t('mypageExtra.notifications')} onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mypageExtra.appInfoSection')}</Text>
          <View style={styles.menuGroup}>
            <MenuItem icon="information-circle-outline" label={t('mypageExtra.serviceIntro')} onPress={() => {}} />
            <MenuItem icon="shield-checkmark-outline" label={t('mypageExtra.privacyPolicy')} onPress={() => {}} />
            <MenuItem icon="document-text-outline" label={t('mypageExtra.termsOfService')} onPress={() => {}} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={styles.logoutText}>{t('mypage.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 48 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, marginBottom: 12, ...shadow.card },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.primary },
  displayName: { fontSize: 16, fontWeight: '700', color: colors.gray900 },
  email: { fontSize: 12, color: colors.gray500, marginTop: 1 },
  levelBadge: { marginTop: 5, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  miniStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniStat: { alignItems: 'center' },
  miniStatVal: { fontSize: 18, fontWeight: '800' },
  miniStatLabel: { fontSize: 10, color: colors.gray500, fontWeight: '500' },
  miniStatDivider: { width: 1, height: 24, backgroundColor: colors.gray100 },
  walletCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.md, padding: 14, marginBottom: 24 },
  walletConnected: { backgroundColor: 'rgba(139,92,246,0.08)' },
  walletEmpty: { backgroundColor: colors.gray100 },
  walletLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  walletAddr: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  section: { marginBottom: 24 },
  sectionTitle: { ...typography.label, marginBottom: 10, paddingLeft: 2 },
  menuGroup: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', ...shadow.card },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuIconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, color: colors.gray900 },
  menuValue: { fontSize: 13, color: colors.gray400 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  distanceText: { fontSize: 13, color: colors.gray500 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, padding: 14 },
  logoutText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
