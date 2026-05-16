import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collectionsApi } from '../api/collections';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import { colors, radius, shadow, typography } from '../theme';

const FILTERS = [
  { label: '전체', value: 'all' },
  { label: '진행 중', value: 'ongoing' },
  { label: '완성', value: 'completed' },
  { label: '종료', value: 'ended' },
];

function CollectionCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <PlaceImage uri={item.image} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardRegion}>{item.flag} {item.region}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${item.accentColor}18` }]}>
            <Text style={[styles.statusText, { color: item.accentColor }]}>{item.statusLabel}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <ProgressBar percent={item.progressPercent} color={item.accentColor || colors.primary} />
          <Text style={styles.progressLabel}>{item.collected}/{item.landmarkCount}</Text>
        </View>
        {item.rewardTitle && (
          <View style={styles.rewardRow}>
            <Ionicons name="gift-outline" size={12} color={colors.gray400} />
            <Text style={styles.rewardText} numberOfLines={1}>{item.rewardTitle}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function CollectionScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f) => {
    try {
      const data = await collectionsApi.list(f);
      setCollections(data || []);
    } catch { setCollections([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(filter); }, [filter, load]);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>내 컬렉션</Text>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => { setFilter(f.value); setLoading(true); }}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
        : (
          <FlatList
            data={collections}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CollectionCard item={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
            )}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={<EmptyState icon="albums-outline" title="컬렉션이 없습니다" subtitle="이벤트에 참여하여 스탬프를 모아보세요" />}
          />
        )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pageTitle: { ...typography.h1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  chip: { borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gray300 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', marginBottom: 14, ...shadow.card },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardRegion: { fontSize: 11, color: colors.gray500, fontWeight: '600', marginBottom: 3 },
  cardTitle: { ...typography.h3, fontSize: 15 },
  statusBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressLabel: { fontSize: 11, color: colors.gray500, fontWeight: '600', flexShrink: 0 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardText: { fontSize: 12, color: colors.gray500, flex: 1 },
});
