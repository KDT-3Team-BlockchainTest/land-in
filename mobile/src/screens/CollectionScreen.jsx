import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collectionsApi } from '../api/collections';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
import { colors, radius, shadow, typography } from '../theme';

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
  const { t } = useLanguage();
  const FILTERS = [
    { label: t('collection.filters.all'), value: 'all' },
    { label: t('collection.filters.ongoing'), value: 'ongoing' },
    { label: t('collection.filters.completed'), value: 'completed' },
    { label: t('collection.filters.ended'), value: 'ended' },
  ];
  const [filter, setFilter] = useState('all');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (f) => {
    setError(null);
    try {
      const data = await collectionsApi.list(f);
      setCollections(data || []);
    } catch (err) {
      setCollections([]);
      setError(err?.message || '불러오기에 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(filter); }, [filter, load]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <Text style={styles.pageTitle}>{t('collection.title')}</Text>
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
        : error
          ? (
            <View style={styles.errorWrap}>
              <Ionicons name="wifi-outline" size={40} color={colors.gray300} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(filter); }}>
                <Text style={styles.retryText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )
          : (
            <FlatList
              data={collections}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CollectionCard item={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
              )}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
              ListEmptyComponent={<EmptyState icon="albums-outline" title={t('collection.emptyCollectionTitle')} subtitle={t('collection.emptyCollectionDescription')} />}
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
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, color: colors.gray500, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
