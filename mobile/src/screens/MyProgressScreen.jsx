import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptCollection, adaptDashboard } from '../api/adapters';
import { collectionsApi } from '../api/collections';
import { dashboardApi } from '../api/dashboard';
import EmptyState from '../components/common/EmptyState';
import NftTipCard from '../components/common/NftTipCard';
import RouteMapTeaser from '../components/common/RouteMapTeaser';
import StatSummaryGrid from '../components/common/StatSummaryGrid';
import TagCampaignCard from '../components/common/TagCampaignCard';
import { colors, spacing } from '../theme';

export default function MyProgressScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [activeCollections, setActiveCollections] = useState([]);

  useEffect(() => {
    dashboardApi.stats().then((s) => setStats(adaptDashboard(s))).catch(() => {});
    collectionsApi.list('ongoing')
      .then((list) => setActiveCollections((list ?? []).map((c) => adaptCollection(c))))
      .catch(() => {});
  }, []);

  const statItems = [
    { label: '수집한 NFT', value: stats?.totalNfts ?? 0, color: colors.primary, backgroundColor: colors.primarySoft, icon: '✨' },
    { label: '참여 도시', value: stats?.joinedCities ?? 0, color: colors.violet, backgroundColor: colors.violetSoft, icon: '📍' },
    { label: '진행 중', value: stats?.activeEventsCount ?? 0, color: colors.success, backgroundColor: colors.successSoft, icon: '🗺' },
  ];

  const primaryEventId = activeCollections[0]?.id;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.pageTitle}>내 진행 현황</Text>
          <Text style={styles.subtitle}>참여 중인 컬렉션의 루트와 NFT 진행 상태를 한 번에 확인하세요.</Text>
        </View>

        <StatSummaryGrid items={statItems} />

        <RouteMapTeaser
          title="주요 루트 확인"
          description="지금 진행 중인 컬렉션의 다음 목적지와 수집 현황을 빠르게 살펴볼 수 있어요."
          actionLabel="자세히 보기"
          onPress={() => {
            if (primaryEventId) navigation.navigate('EventDetail', { eventId: primaryEventId });
            else navigation.navigate('컬렉션');
          }}
        />

        {activeCollections.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이벤트 상세 루트</Text>
            {activeCollections.map((c) => (
              <TagCampaignCard
                key={c.id}
                collection={c}
                onPress={() => navigation.navigate('EventDetail', { eventId: c.id })}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="🧭"
            title="아직 진행 중인 이벤트가 없어요"
            description="홈에서 마음에 드는 이벤트를 선택하고 첫 번째 NFT 수집을 시작해보세요."
          />
        )}

        <NftTipCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900 },
  subtitle: { fontSize: 13, color: colors.gray400, marginTop: 4, lineHeight: 20 },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
});
