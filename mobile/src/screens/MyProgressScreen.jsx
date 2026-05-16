import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collectionsApi } from '../api/collections';
import { dashboardApi } from '../api/dashboard';
import StatSummaryGrid from '../components/common/StatSummaryGrid';
import SectionHeader from '../components/common/SectionHeader';
import EmptyState from '../components/common/EmptyState';
import TagCampaignCard from '../components/tag/TagCampaignCard';
import { colors, radius, shadow, typography } from '../theme';

export default function MyProgressScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        dashboardApi.stats().catch(() => ({})),
        collectionsApi.list('ongoing').catch(() => []),
      ]);
      setStats(s);
      setActive(c || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statItems = [
    { label: '수집한 NFT', value: stats?.totalNfts ?? 0, color: colors.primary },
    { label: '참여 도시', value: stats?.joinedCities ?? 0, color: colors.violet },
    { label: '진행 중', value: stats?.activeEventsCount ?? 0, color: colors.success },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.container}>
          <StatSummaryGrid stats={statItems} />

          <View style={styles.section}>
            <SectionHeader title="진행중인 캠페인" />
            {active.length === 0
              ? <EmptyState icon="albums-outline" title="진행중인 캠페인이 없습니다" subtitle="이벤트에 참여하여 루트를 시작해보세요!" />
              : active.map((ev) => (
                  <TagCampaignCard
                    key={ev.id}
                    event={ev}
                    onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
                  />
                ))
            }
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  section: { marginTop: 28 },
});
