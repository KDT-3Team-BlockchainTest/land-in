import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptReward } from '../api/adapters';
import { rewardsApi } from '../api/rewards';
import EmptyState from '../components/common/EmptyState';
import RewardCodeModal from '../components/common/RewardCodeModal';
import RewardCouponCard from '../components/common/RewardCouponCard';
import StatSummaryGrid from '../components/common/StatSummaryGrid';
import { colors, font, radius, spacing } from '../theme';

const FILTERS = [
  { id: 'available', label: '사용 가능' },
  { id: 'used', label: '사용 완료' },
  { id: 'expired', label: '만료' },
];

export default function RewardsScreen() {
  const [activeFilter, setActiveFilter] = useState('available');
  const [selectedReward, setSelectedReward] = useState(null);
  const [rawRewards, setRawRewards] = useState([]);

  useEffect(() => {
    rewardsApi.list().then((l) => setRawRewards(l ?? [])).catch(() => {});
  }, []);

  const rewards = rawRewards.map(adaptReward);
  const filteredRewards = useMemo(
    () => rewards.filter((r) => r.status === activeFilter),
    [rewards, activeFilter],
  );

  const stats = [
    { label: '사용 가능', value: rewards.filter((r) => r.status === 'available').length, color: colors.primary, backgroundColor: colors.primarySoft, icon: '🎁' },
    { label: '사용 완료', value: rewards.filter((r) => r.status === 'used').length, color: colors.success, backgroundColor: colors.successSoft, icon: '✅' },
    { label: '만료', value: rewards.filter((r) => r.status === 'expired').length, color: colors.gray400, backgroundColor: colors.gray100, icon: '⏰' },
  ];

  const handleUseReward = async (reward) => {
    try {
      await rewardsApi.use(reward.id);
      setRawRewards((prev) => prev.map((r) => r.id === reward.id ? { ...r, status: 'USED' } : r));
      setSelectedReward(null);
    } catch { /* ignore */ }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.pageTitle}>내 리워드</Text>
          <Text style={styles.subtitle}>컬렉션 완성으로 받은 혜택을 확인하고 사용하세요.</Text>
        </View>

        <StatSummaryGrid items={stats} />

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterBtn, f.id === activeFilter && styles.activeFilterBtn]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.filterText, f.id === activeFilter && styles.activeFilterText]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredRewards.length === 0 ? (
          <EmptyState icon="🎫" title="표시할 리워드가 없어요" description="다른 탭을 확인하거나 컬렉션을 완성해 새로운 보상을 받아보세요." />
        ) : (
          <View style={styles.list}>
            {filteredRewards.map((r) => (
              <RewardCouponCard key={r.id} reward={r} onShowCode={setSelectedReward} />
            ))}
          </View>
        )}
      </ScrollView>

      <RewardCodeModal
        reward={selectedReward}
        onClose={() => setSelectedReward(null)}
        onUse={() => selectedReward && handleUseReward(selectedReward)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900 },
  subtitle: { fontSize: 13, color: colors.gray400, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterBtn: { flex: 1, backgroundColor: colors.gray100, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' },
  activeFilterBtn: { backgroundColor: colors.primary },
  filterText: { fontSize: font.sm, fontWeight: '600', color: colors.gray500 },
  activeFilterText: { color: colors.white },
  list: { gap: spacing.md },
});
