import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rewardsApi } from '../api/rewards';
import { colors, radius, shadow, typography } from '../theme';

const FILTERS = [
  { label: '전체', value: undefined },
  { label: '사용 가능', value: 'available' },
  { label: '사용됨', value: 'used' },
  { label: '만료됨', value: 'expired' },
];

function RewardCard({ item, onUse }) {
  const isAvailable = item.status === 'available';

  return (
    <View style={[styles.card, !isAvailable && styles.cardDim]}>
      <View style={styles.cardLeft}>
        <View style={[styles.cardIcon, { backgroundColor: isAvailable ? colors.primarySoft : colors.gray100 }]}>
          <Ionicons name="gift-outline" size={24} color={isAvailable ? colors.primary : colors.gray400} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name || item.title}</Text>
          {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
          {item.expiresAt && (
            <Text style={styles.expiryText}>
              {item.status === 'expired' ? '만료됨' : `만료일: ${new Date(item.expiresAt).toLocaleDateString('ko-KR')}`}
            </Text>
          )}
        </View>
      </View>
      {isAvailable && (
        <TouchableOpacity style={styles.useBtn} onPress={() => onUse(item)} activeOpacity={0.8}>
          <Text style={styles.useBtnText}>사용</Text>
        </TouchableOpacity>
      )}
      {item.status === 'used' && (
        <View style={styles.usedBadge}>
          <Text style={styles.usedBadgeText}>사용됨</Text>
        </View>
      )}
    </View>
  );
}

export default function RewardsScreen() {
  const [rewards, setRewards] = useState([]);
  const [filter, setFilter] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f = filter) => {
    try {
      const data = await rewardsApi.list(f);
      setRewards(data || []);
    } catch {
      setRewards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleUse = useCallback((item) => {
    Alert.alert(
      '리워드 사용',
      `"${item.name || item.title}"을(를) 사용하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '사용하기',
          onPress: async () => {
            try {
              await rewardsApi.use(item.id);
              await load();
              Alert.alert('완료', '리워드가 사용되었습니다.');
            } catch (err) {
              Alert.alert('오류', err.message || '리워드 사용에 실패했습니다.');
            }
          },
        },
      ]
    );
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const changeFilter = useCallback((f) => {
    setFilter(f);
    setLoading(true);
    load(f);
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>리워드</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => changeFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <RewardCard item={item} onUse={handleUse} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="gift-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>리워드가 없습니다</Text>
              <Text style={styles.emptyHint}>이벤트를 완료하면 리워드를 받을 수 있어요</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pageTitle: { ...typography.h1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.card,
  },
  cardDim: { opacity: 0.6 },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...typography.h3, fontSize: 15 },
  cardDesc: { ...typography.caption, marginTop: 3, lineHeight: 18 },
  expiryText: { fontSize: 12, color: colors.warning, marginTop: 4 },
  useBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
  },
  useBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  usedBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.gray100,
    marginLeft: 8,
  },
  usedBadgeText: { fontSize: 12, fontWeight: '600', color: colors.gray400 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { ...typography.body, color: colors.gray400 },
  emptyHint: { ...typography.caption, textAlign: 'center' },
});
