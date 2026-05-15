import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptCollection, adaptNft } from '../api/adapters';
import { collectionsApi } from '../api/collections';
import { nftsApi } from '../api/nfts';
import CollectionFilterTabs from '../components/common/CollectionFilterTabs';
import CollectionNftCard from '../components/common/CollectionNftCard';
import CollectionOverviewCard from '../components/common/CollectionOverviewCard';
import CollectionSummaryPanel from '../components/common/CollectionSummaryPanel';
import EmptyState from '../components/common/EmptyState';
import { colors, spacing } from '../theme';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'ongoing', label: '진행 중' },
  { id: 'completed', label: '완성' },
  { id: 'ended', label: '종료' },
  { id: 'nft', label: 'NFT' },
];

const FILTER_DESC = {
  all: '참여한 모든 컬렉션을 한 번에 확인하세요',
  ongoing: '지금 여행 중인 컬렉션만 모아봤어요',
  completed: '완성한 컬렉션과 보상을 다시 감상해보세요',
  ended: '종료된 시즌 컬렉션도 기록으로 남아있어요',
  nft: '총 NFT를 갤러리처럼 보고, 탭하면 해당 컬렉션으로 이동해요',
};

export default function CollectionScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [rawCollections, setRawCollections] = useState([]);
  const [rawNfts, setRawNfts] = useState([]);

  useEffect(() => {
    collectionsApi.list().then((l) => setRawCollections(l ?? [])).catch(() => {});
    nftsApi.list().then((l) => setRawNfts(l ?? [])).catch(() => {});
  }, []);

  const nfts = rawNfts.map(adaptNft);
  const collections = rawCollections.map((c) => adaptCollection(c, rawNfts));

  const stats = useMemo(() => ({
    ongoingCount: collections.filter((c) => c.collectionStatus === 'ongoing').length,
    completedCount: collections.filter((c) => c.collectionStatus === 'completed').length,
    nftCount: nfts.length,
  }), [collections, nfts]);

  const filteredCollections = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'nft') return collections;
    return collections.filter((c) => c.collectionStatus === activeFilter);
  }, [activeFilter, collections]);

  const showNftList = activeFilter === 'nft';
  const isEmpty = showNftList ? nfts.length === 0 : filteredCollections.length === 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.pageTitle}>내 컬렉션</Text>
          <Text style={styles.subtitle}>카드를 탭하면 루트 & 상세 보기</Text>
        </View>

        <CollectionSummaryPanel
          ongoingCount={stats.ongoingCount}
          completedCount={stats.completedCount}
          nftCount={stats.nftCount}
        />

        <View style={styles.filterSection}>
          <CollectionFilterTabs filters={FILTERS} activeFilter={activeFilter} onChange={setActiveFilter} />
          <Text style={styles.filterDesc}>{FILTER_DESC[activeFilter]}</Text>
        </View>

        {isEmpty ? (
          <EmptyState
            icon="✦"
            title={showNftList ? '아직 수집한 NFT가 없어요' : '아직 컬렉션이 없어요'}
            description={showNftList ? '현장에서 NFC를 태그하면 첫 번째 NFT가 발행됩니다.' : '탐험을 시작해 새로운 컬렉션에 참여해보세요.'}
          />
        ) : showNftList ? (
          <View>
            <Text style={styles.nftCaption}>총 {nfts.length}개의 NFT</Text>
            <View style={styles.nftGrid}>
              {nfts.map((nft) => (
                <CollectionNftCard
                  key={nft.id}
                  nft={nft}
                  onPress={() => navigation.navigate('NftGallery', { eventId: nft.eventId })}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.collectionList}>
            {filteredCollections.map((c) => (
              <CollectionOverviewCard
                key={c.id}
                collection={c}
                onPress={() => navigation.navigate('NftGallery', { eventId: c.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900 },
  subtitle: { fontSize: 13, color: colors.gray400, marginTop: 4 },
  filterSection: { gap: spacing.sm },
  filterDesc: { fontSize: 13, color: colors.gray500 },
  nftCaption: { fontSize: 13, color: colors.gray500, marginBottom: spacing.md },
  nftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  collectionList: { gap: spacing.md },
});
