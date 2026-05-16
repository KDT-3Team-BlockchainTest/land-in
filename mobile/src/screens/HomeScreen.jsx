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
import { colors, radius, shadow, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
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
      const joinedIds = (joined || []).map((item) =>
        typeof item === 'number' ? item : item?.id
      ).filter(Boolean);

      setJoinedCount(joinedIds.length);
      setFeatured((f || []).map((ev) => adaptEventSummary(ev, joinedIds)));
      setActive((a || []).map((ev) => adaptEventSummary(ev, joinedIds)));
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
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 80 }} size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const featuredEvent = featured[0] || active[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Land In</Text>
            <Text style={styles.greeting}>안녕하세요, {user?.displayName || '게스트'}님 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MyProgress')}>
            <Ionicons name="stats-chart-outline" size={24} color={colors.gray600} />
          </TouchableOpacity>
        </View>

        {/* 진행 현황 배너 (웹 ProgressBanner와 동일) */}
        {joinedCount > 0 && (
          <TouchableOpacity
            style={styles.progressBanner}
            onPress={() => navigation.navigate('MyProgress')}
            activeOpacity={0.85}
          >
            <View style={styles.progressBannerLeft}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <View>
                <Text style={styles.progressBannerTitle}>현재 진행 현황</Text>
                <Text style={styles.progressBannerDesc}>
                  현재 {joinedCount}개의 루트를 탐험 중입니다.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* 추천 이벤트 */}
        {featuredEvent && (
          <View style={styles.section}>
            <SectionHeader title="🌟 추천 루트" />
            <FeaturedEventCard event={featuredEvent} onPress={() => goDetail(featuredEvent.id)} />
          </View>
        )}

        {/* 진행중 이벤트 */}
        {active.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="진행중인 이벤트" action="전체 보기" onAction={() => navigation.navigate('Collection')} />
            <FlatList
              data={active}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ActiveEventCard event={item} onPress={() => goDetail(item.id)} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </View>
        )}

        {/* 예정 이벤트 */}
        {upcoming.length > 0 && (
          <View style={[styles.section, { marginBottom: 32 }]}>
            <SectionHeader title="곧 시작하는 이벤트" />
            {upcoming.slice(0, 4).map((ev) => (
              <UpcomingEventCard key={ev.id} event={ev} onPress={() => goDetail(ev.id)} />
            ))}
          </View>
        )}

        {!featuredEvent && active.length === 0 && upcoming.length === 0 && (
          <EmptyState icon="calendar-outline" title="진행중인 이벤트가 없습니다" subtitle="새 이벤트를 기다려주세요!" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  logo: { fontSize: 22, fontWeight: '800', color: colors.primary },
  greeting: { ...typography.caption, marginTop: 2 },
  progressBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md, padding: 14,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
    ...shadow.card,
  },
  progressBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  progressBannerTitle: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 2 },
  progressBannerDesc: { fontSize: 13, color: colors.gray600 },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  hList: { paddingRight: 4 },
});
