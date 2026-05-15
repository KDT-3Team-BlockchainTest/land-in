import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collectionsApi } from '../api/collections';
import { colors, radius, shadow, typography } from '../theme';

const FILTERS = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'ongoing' },
  { label: '완료', value: 'completed' },
  { label: '종료됨', value: 'ended' },
];

function CollectionCard({ item, onPress }) {
  const pct = item.totalSteps > 0 ? item.completedSteps / item.totalSteps : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name="albums-outline" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.eventTitle || item.title}</Text>
          <Text style={styles.cardSub}>{item.completedSteps ?? 0} / {item.totalSteps ?? 0} 스탬프</Text>
        </View>
        {item.status === 'completed' && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          </View>
        )}
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

export default function CollectionScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f = filter) => {
    try {
      const data = await collectionsApi.list(f);
      setCollections(data || []);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const changeFilter = useCallback((f) => {
    setFilter(f);
    setLoading(true);
    load(f);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>내 컬렉션</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => changeFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => String(item.id ?? item.eventId)}
          renderItem={({ item }) => (
            <CollectionCard
              item={item}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.eventId ?? item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="albums-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>컬렉션이 없습니다</Text>
              <Text style={styles.emptyHint}>이벤트에 참여하여 스탬프를 모아보세요</Text>
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
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterChip: {
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray200 || colors.gray300,
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
    ...shadow.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...typography.h3, fontSize: 15 },
  cardSub: { ...typography.caption, marginTop: 2 },
  completedBadge: { marginLeft: 8 },
  progressBar: { height: 6, backgroundColor: colors.gray100, borderRadius: 100, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { ...typography.body, color: colors.gray400 },
  emptyHint: { ...typography.caption, textAlign: 'center' },
});
