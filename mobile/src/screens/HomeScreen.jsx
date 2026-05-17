import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptEventSummary } from '../api/adapters';
import { eventsApi } from '../api/events';
import { useAuth } from '../auth/useAuth';
import ActiveEventCard from '../components/home/ActiveEventCard';
import FeaturedEventCard from '../components/home/FeaturedEventCard';
import UpcomingEventCard from '../components/home/UpcomingEventCard';
import EmptyState from '../components/common/EmptyState';
import SectionHeader from '../components/common/SectionHeader';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
import { colors, radius, shadow, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [active, setActive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [joinedCount, setJoinedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, a, u, joined] = await Promise.all([
        eventsApi.listRaw('featured').catch(() => []),
        eventsApi.listRaw('active').catch(() => []),
        eventsApi.listRaw('upcoming').catch(() => []),
        eventsApi.joinedIds().catch(() => []),
      ]);
      // 백엔드는 string[] 반환 (e.g. ["jeju-summer-2026"])
      const joinedIds = (joined || []).map((item) =>
        item !== null && typeof item === 'object' ? item.id : String(item)
      ).filter(Boolean);

      setJoinedCount(joinedIds.length);
      setFeatured((f || []).map((ev) => adaptEventSummary(ev, joinedIds)));
      // 추천(featured) 이벤트를 리스트 맨 앞으로 정렬
      const activeArr = (a || []).map((ev) => adaptEventSummary(ev, joinedIds));
      activeArr.sort((x, y) => {
        if (x.tag === 'featured' && y.tag !== 'featured') return -1;
        if (y.tag === 'featured' && x.tag !== 'featured') return 1;
        return 0;
      });
      setActive(activeArr);
      setUpcoming((u || []).map((ev) => adaptEventSummary(ev, joinedIds)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  const goDetail = (eventId) => navigation.navigate('EventDetail', { eventId });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator style={{ marginTop: 80 }} size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const featuredEvent = featured[0] || active[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* 인사말 */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {t('home.greeting')} <Text style={styles.greetingName}>{user?.displayName || t('home.traveler')}</Text>.
          </Text>
          <Text style={styles.greetingTitle}>{t('home.title')}</Text>
        </View>

        {/* 진행 현황 배너 */}
        {joinedCount > 0 && (
          <TouchableOpacity
            style={styles.progressBanner}
            onPress={() => navigation.navigate('MyProgress')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#fe6b70', '#ff9a6c']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.progressIcon}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.progressBannerContent}>
              <Text style={styles.progressBannerTitle}>{t('homeExtra.progressBannerTitle')}</Text>
              <Text style={styles.progressBannerDesc}>
                {t('homeExtra.progressBannerDesc', { count: joinedCount })}
              </Text>
            </View>
            <View style={styles.progressArrow}>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* 추천 이벤트 */}
        {featuredEvent && (
          <View style={styles.section}>
            <SectionHeader title={t('home.featuredTitle')} description={t('home.featuredDescription')} />
            <FeaturedEventCard event={featuredEvent} onPress={() => goDetail(featuredEvent.id)} />
          </View>
        )}

        {/* 진행중 이벤트 */}
        {active.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t('home.activeTitle')} action={t('home.activeAction')} onAction={() => navigation.navigate('Collection')} />
            <FlatList
              data={active}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ActiveEventCard event={item} onPress={() => goDetail(item.id)} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              style={styles.hListWrapper}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </View>
        )}

        {/* 예정 이벤트 */}
        {upcoming.length > 0 && (
          <View style={[styles.section, { marginBottom: 32 }]}>
            <SectionHeader
              title={t('home.upcomingTitle')}
              description={t('home.upcomingDescription')}
              action={t('home.upcomingAction')}
              onAction={() => {}}
            />
            {upcoming.slice(0, 4).map((ev) => (
              <UpcomingEventCard key={ev.id} event={ev} onPress={() => goDetail(ev.id)} />
            ))}
          </View>
        )}

        {!featuredEvent && active.length === 0 && upcoming.length === 0 && (
          <EmptyState icon="calendar-outline" title={t('homeExtra.noEvents')} subtitle={t('homeExtra.noEventsDesc')} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  greeting: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  greetingText: { fontSize: 13, color: colors.gray400, lineHeight: 18, marginBottom: 4 },
  greetingName: { color: colors.primary, fontWeight: '600' },
  greetingTitle: { ...typography.h1 },
  progressBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: 'rgba(254,107,112,0.06)',
    borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(254,107,112,0.18)',
  },
  progressIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  progressBannerContent: { flex: 1, gap: 2 },
  progressBannerTitle: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  progressBannerDesc: { fontSize: 12, color: colors.gray500, lineHeight: 17 },
  progressArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  hListWrapper: { overflow: 'visible', paddingVertical: 6 },
  hList: { paddingRight: 4 },
});
