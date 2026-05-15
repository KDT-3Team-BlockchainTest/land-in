import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import { useAuth } from '../auth/useAuth';
import ActiveEventCard from '../components/home/ActiveEventCard';
import FeaturedEventCard from '../components/home/FeaturedEventCard';
import UpcomingEventCard from '../components/home/UpcomingEventCard';
import EmptyState from '../components/common/EmptyState';
import SectionHeader from '../components/common/SectionHeader';
import { colors, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [active, setActive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, a, u] = await Promise.all([
        eventsApi.list('featured').catch(() => []),
        eventsApi.list('active').catch(() => []),
        eventsApi.list('upcoming').catch(() => []),
      ]);
      setFeatured(f || []);
      setActive(a || []);
      setUpcoming(u || []);
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
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Land In</Text>
            <Text style={styles.greeting}>안녕하세요, {user?.displayName || '게스트'}님 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MyProgress')}>
            <Ionicons name="stats-chart-outline" size={24} color={colors.gray600} />
          </TouchableOpacity>
        </View>

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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  logo: { fontSize: 22, fontWeight: '800', color: colors.primary },
  greeting: { ...typography.caption, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  hList: { paddingRight: 4 },
});
