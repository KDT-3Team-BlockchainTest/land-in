import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardApi } from '../api/dashboard';
import { useAuth } from '../auth/useAuth';
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
import { colors, radius, shadow } from '../theme';

function MenuItem({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={s.menuIconWrap}>
        <Ionicons name={icon} size={18} color={colors.gray600} />
      </View>
      <Text style={s.menuLabel}>{label}</Text>
      {value && <Text style={s.menuValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={14} color={colors.gray300} />
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

  const displayName = user?.displayName || user?.email || t('mypage.defaultName');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.container}>

        {/* 제목 */}
        <Text style={s.pageTitle}>마이페이지</Text>

        {/* 프로필 카드 — .my-page__profile-card */}
        <View style={s.profileCard}>
          {/* 헤더 — .my-page__profile-header */}
          <View style={s.profileHeader}>
            {/* 아바타 — 56x56 borderRadius:16 gray-100 bg, 이모지 */}
            <View style={s.avatar}>
              <Text style={s.avatarEmoji}>🧑</Text>
            </View>
            {/* 이름/이메일/레벨 */}
            <View style={s.identity}>
              <Text style={s.displayName}>{displayName} 님</Text>
              <Text style={s.email}>{user?.email ?? ''}</Text>
              <View style={s.levelBadge}>
                <Text style={s.levelText}>City Explorer</Text>
              </View>
            </View>
          </View>

          {/* 스탯 그리드 — .my-page__profile-stats: repeat(4, 1fr) */}
          <View style={s.statsGrid}>
            {[
              { value: stats?.nftCount ?? 0,                 label: '보유 NFT' },
              { value: stats?.cityCount ?? 0,                label: '참여 도시' },
              { value: stats?.landmarkCount ?? 0,            label: '랜드마크' },
              { value: stats?.countryCount ?? 0,             label: '여행 국가' },
            ].map((item) => (
              <View key={item.label} style={s.miniStat}>
                <Text style={s.miniValue}>{item.value}</Text>
                <Text style={s.miniLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 지갑 카드 — .my-page__wallet-card */}
        <View style={s.walletCard}>
          {/* section-head */}
          <View style={s.walletSectionHead}>
            <View style={{ flex: 1 }}>
              <Text style={s.walletSectionTitle}>지갑 연결</Text>
              <Text style={s.walletSectionDesc}>NFT 수령을 위한 지갑을 연결하세요.</Text>
            </View>
            {/* pending badge */}
            <View style={s.walletBadgePending}>
              <Text style={s.walletBadgePendingText}>연결 대기</Text>
            </View>
          </View>
          {/* wallet-body */}
          <View style={s.walletBody}>
            <View style={{ flex: 1 }}>
              <Text style={s.walletLabel}>현재 연결된 지갑</Text>
              <Text style={s.walletValue}>없음</Text>
              <Text style={s.walletMeta}>지갑 연결 후 NFT를 수령할 수 있습니다.</Text>
            </View>
            <TouchableOpacity style={s.walletButton} onPress={() => navigation.navigate('WalletConnect')} activeOpacity={0.85}>
              <Text style={s.walletButtonText}>연결하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 설정 — .my-page__menu-section */}
        <View style={s.menuSection}>
          <View style={s.menuSectionHead}>
            <Text style={s.menuSectionTitle}>{t('mypage.settings.title')}</Text>
            <Text style={s.menuSectionDesc}>{t('mypage.settings.desc')}</Text>
          </View>
          <View style={s.menuGroup}>
            <MenuItem icon="person-outline"           label={t('mypageExtra.profileInfo')}   onPress={() => {}} />
            <MenuItem icon="stats-chart-outline"      label={t('nav.progress')}               onPress={() => navigation.navigate('MyProgress')} />
            <MenuItem icon="globe-outline"            label="언어 설정"                        onPress={() => navigation.navigate('Language')} />
            <MenuItem icon="notifications-outline"    label={t('mypageExtra.notifications')}  onPress={() => {}} />
            <MenuItem icon="information-circle-outline" label={t('mypageExtra.serviceIntro')} onPress={() => {}} />
            <MenuItem icon="shield-checkmark-outline" label={t('mypageExtra.privacyPolicy')}  onPress={() => {}} />
            <MenuItem icon="document-text-outline"    label={t('mypageExtra.termsOfService')} onPress={() => {}} />
          </View>
        </View>

        {/* 로그아웃 — .my-page__logout: full width, primary-soft bg, primary color */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutText}>{t('mypage.logout')}</Text>
        </TouchableOpacity>

        <Text style={s.footer}>Land-In © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── 스타일 (CSS 수치 그대로) ────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 48 },

  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.gray900, marginBottom: 16 },

  // 프로필 카드 — padding:20, borderRadius:22, surface, shadow
  profileCard: {
    padding: 20, borderRadius: 22,
    backgroundColor: colors.surface,
    marginBottom: 16,
    ...shadow.card,
  },

  // 프로필 헤더 — flex row, gap:14, mb:18
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },

  // 아바타 — 56x56, borderRadius:16, gray-100
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.gray100 || '#f3f4f6', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarEmoji: { fontSize: 26 },

  // identity
  identity: { flex: 1, minWidth: 0 },
  displayName: { fontSize: 18, fontWeight: '800', color: colors.gray900, marginBottom: 2 },
  email: { fontSize: 12, color: colors.gray400, marginBottom: 8 },

  // 레벨 배지 — primary bg, white text
  levelBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  levelText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // 스탯 그리드 — 4열, gap:8
  statsGrid: { flexDirection: 'row', gap: 8 },
  miniStat: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14, backgroundColor: colors.gray50 || '#f9fafb', alignItems: 'center' },
  miniValue: { fontSize: 18, fontWeight: '800', color: colors.gray900, marginBottom: 2 },
  miniLabel: { fontSize: 10, color: colors.gray500 },

  // 지갑 카드 — padding:20, borderRadius:22, surface, shadow, gap:14
  walletCard: {
    padding: 20, borderRadius: 22,
    backgroundColor: colors.surface,
    marginBottom: 24,
    gap: 14,
    ...shadow.card,
  },
  walletSectionHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  walletSectionTitle: { fontSize: 15, fontWeight: '800', color: colors.gray900, marginBottom: 4 },
  walletSectionDesc: { fontSize: 11, color: colors.gray400, lineHeight: 16 },

  // pending badge — amber
  walletBadgePending: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
  walletBadgePendingText: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },

  // wallet body
  walletBody: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  walletLabel: { fontSize: 11, color: colors.gray500, marginBottom: 4 },
  walletValue: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  walletMeta: { fontSize: 11, color: colors.gray400 },

  // 연결하기 버튼
  walletButton: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexShrink: 0 },
  walletButtonText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // 메뉴 섹션
  menuSection: { marginBottom: 24, gap: 12 },
  menuSectionHead: {},
  menuSectionTitle: { fontSize: 15, fontWeight: '800', color: colors.gray900, marginBottom: 4 },
  menuSectionDesc: { fontSize: 11, color: colors.gray400, lineHeight: 16 },
  menuGroup: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', ...shadow.card },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuIconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, color: colors.gray900 },
  menuValue: { fontSize: 13, color: colors.gray400 },

  // 로그아웃 — full width, primary-soft bg, primary text
  logoutBtn: { borderRadius: 18, backgroundColor: colors.primarySoft, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', marginBottom: 8 },
  logoutText: { fontSize: 14, fontWeight: '700', color: colors.primary },

  footer: { fontSize: 10, color: colors.gray300, textAlign: 'center', marginTop: -4 },
});
