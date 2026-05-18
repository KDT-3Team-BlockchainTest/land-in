import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { collectionsApi } from '../api/collections';
import { nftsApi } from '../api/nfts';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
import { colors, radius, shadow, typography } from '../theme';

const RARITY_COLOR = { legendary: '#f59e0b', rare: colors.violet, common: colors.gray500 };

function NftMiniCard({ item }) {
  const rc = RARITY_COLOR[item.rarity] || colors.gray400;
  return (
    <View style={nftStyles.card}>
      {item.image
        ? <Image source={{ uri: item.image }} style={nftStyles.image} />
        : <View style={[nftStyles.image, nftStyles.placeholder]}><Ionicons name="diamond-outline" size={28} color={colors.violet} /></View>
      }
      <View style={nftStyles.body}>
        <Text style={nftStyles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={nftStyles.serial}>{item.serial}</Text>
        {item.rarity && <Text style={[nftStyles.rarity, { color: rc }]}>{item.rarity.toUpperCase()}</Text>}
      </View>
    </View>
  );
}

function CollectionCard({ item, onPress }) {
  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <PlaceImage uri={item.image} style={styles.cardImage} />
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.cardRegion}>{item.flag} {item.region}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${item.accentColor}18` }]}>
                <Text style={[styles.statusText, { color: item.accentColor }]}>{item.statusLabel}</Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <View style={{ flex: 1 }}>
                <ProgressBar percent={item.progressPercent} color={item.accentColor || colors.primary} />
              </View>
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
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaBtn} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name="book-outline" size={14} color={colors.primary} />
            <Text style={styles.ctaBtnText}>루트 & 상세 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctaBtn, styles.ctaBtnSecondary]} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name="sparkles-outline" size={14} color={colors.gray600} />
            <Text style={[styles.ctaBtnText, styles.ctaBtnTextSecondary]}>NFT 감상</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CollectionScreen({ navigation }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const FILTERS = [
    { label: t('collection.filters.all'), value: 'all' },
    { label: t('collection.filters.ongoing'), value: 'ongoing' },
    { label: t('collection.filters.completed'), value: 'completed' },
    { label: t('collection.filters.ended'), value: 'ended' },
    { label: t('collection.filters.nft'), value: 'nft' },
  ];

  const [filter, setFilter] = useState('all');
  const [collections, setCollections] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (f) => {
    setError(null);
    try {
      if (f === 'nft') {
        const data = await nftsApi.list();
        setNfts(data || []);
        setCollections([]);
      } else {
        const data = await collectionsApi.list(f);
        setCollections(data || []);
        setNfts([]);
      }
    } catch (err) {
      setCollections([]);
      setNfts([]);
      setError(err?.message || '불러오기에 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    collectionsApi.list('all').then(data => setAllCollections(data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(filter); }, [filter, load]);

  const stats = {
    ongoing: allCollections.filter(c => c.collectionStatus === 'ongoing').length,
    completed: allCollections.filter(c => c.collectionStatus === 'completed').length,
    nft: allCollections.reduce((sum, c) => sum + (c.collected || 0), 0),
  };

  const ListHeader = (
    <View>
      <Text style={styles.pageTitle}>{t('collection.title')}</Text>
      <Text style={styles.pageSubtitle}>{t('collection.subtitle')}</Text>
      <View style={styles.summaryPanel}>
        <View style={[styles.summaryStat, styles.summaryOngoing]}>
          <Text style={[styles.summaryValue, { color: '#fe6b70' }]}>{stats.ongoing}</Text>
          <Text style={styles.summaryLabel}>{t('event.summaryOngoing')}</Text>
        </View>
        <View style={[styles.summaryStat, styles.summaryCompleted]}>
          <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{stats.completed}</Text>
          <Text style={styles.summaryLabel}>{t('event.summaryCompleted')}</Text>
        </View>
        <View style={[styles.summaryStat, styles.summaryNft]}>
          <Text style={[styles.summaryValue, { color: '#6366f1' }]}>{stats.nft}</Text>
          <Text style={styles.summaryLabel}>{t('event.summaryNfts')}</Text>
        </View>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => { setFilter(f.value); setLoading(true); }}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]} numberOfLines={1}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading && <ActivityIndicator style={{ marginVertical: 40 }} size="large" color={colors.primary} />}
      {error && (
        <View style={styles.errorWrap}>
          <Ionicons name="wifi-outline" size={40} color={colors.gray300} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(filter); }}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const isNftMode = filter === 'nft';

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <FlatList
        key={isNftMode ? 'nft-grid' : 'collection-list'}
        style={styles.flatList}
        data={loading || error ? [] : (isNftMode ? nfts : collections)}
        keyExtractor={(item) => String(item.id)}
        numColumns={isNftMode ? 2 : 1}
        columnWrapperStyle={isNftMode ? styles.nftRow : undefined}
        renderItem={({ item }) =>
          isNftMode
            ? <NftMiniCard item={item} />
            : <CollectionCard item={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
        }
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading && !error
            ? <EmptyState
                icon={isNftMode ? 'diamond-outline' : 'albums-outline'}
                title={isNftMode ? t('collection.emptyNftTitle') : t('collection.emptyCollectionTitle')}
                subtitle={isNftMode ? t('collection.emptyNftDescription') : t('collection.emptyCollectionDescription')}
              />
            : null
        }
        contentContainerStyle={[styles.list, { paddingBottom: 72 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pageTitle: { ...typography.h1, paddingTop: 20, paddingBottom: 4 },
  pageSubtitle: { fontSize: 13, color: colors.gray500, paddingBottom: 14 },
  summaryPanel: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  summaryStat: { flex: 1, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  summaryOngoing: { backgroundColor: 'rgba(254,107,112,0.08)', borderColor: 'rgba(254,107,112,0.12)' },
  summaryCompleted: { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.12)' },
  summaryNft: { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.12)' },
  summaryValue: { fontSize: 20, fontWeight: '800', lineHeight: 24, marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: '#6b7280', lineHeight: 14 },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 6,
    gap: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chip: { flex: 1, borderRadius: 12, paddingHorizontal: 4, paddingVertical: 10, alignItems: 'center' },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.gray500 },
  chipTextActive: { color: '#fff' },
  flatList: { flex: 1 },
  list: { paddingHorizontal: 20 },
  cardShadow: { borderRadius: radius.xl, marginBottom: 14, ...shadow.card },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden' },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardRegion: { fontSize: 11, color: colors.gray500, fontWeight: '600', marginBottom: 3 },
  cardTitle: { ...typography.h3, fontSize: 15 },
  statusBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressLabel: { fontSize: 11, color: colors.gray500, fontWeight: '600', flexShrink: 0 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rewardText: { fontSize: 12, color: colors.gray500, flex: 1 },
  ctaRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  ctaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: radius.sm,
    backgroundColor: `${colors.primary}12`, borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  ctaBtnSecondary: { backgroundColor: colors.gray100, borderColor: colors.gray300 },
  ctaBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  ctaBtnTextSecondary: { color: colors.gray600 },
  errorWrap: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 40 },
  errorText: { fontSize: 14, color: colors.gray500, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  nftRow: { gap: 12, marginBottom: 12 },
});

const nftStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  image: { width: '100%', aspectRatio: 1 },
  placeholder: { backgroundColor: 'rgba(139,92,246,0.08)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 10 },
  name: { fontSize: 13, fontWeight: '700', color: colors.gray900 },
  serial: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  rarity: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
