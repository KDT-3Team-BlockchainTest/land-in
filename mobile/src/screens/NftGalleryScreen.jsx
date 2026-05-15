import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptCollection, adaptNft } from '../api/adapters';
import { collectionsApi } from '../api/collections';
import { nftsApi } from '../api/nfts';
import GradientActionButton from '../components/common/GradientActionButton';
import NftGalleryTokenCard from '../components/common/NftGalleryTokenCard';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import { colors, font, radius, spacing } from '../theme';

export default function NftGalleryScreen({ route, navigation }) {
  const { eventId } = route.params ?? {};
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    collectionsApi.list().then((list) => {
      const raw = (list ?? []).find((c) => c.eventId === eventId);
      if (!raw) { setNotFound(true); return; }
      setCollection(adaptCollection(raw));
    }).catch(() => setNotFound(true));
    nftsApi.list(eventId).then((l) => setNfts((l ?? []).map(adaptNft))).catch(() => {});
  }, [eventId]);

  if (notFound) { navigation.replace('컬렉션'); return null; }
  if (!collection) return null;

  const nftCount = nfts.length;
  const remainingCount = Math.max(collection.landmarkCount - nftCount, 0);
  const progressPct = collection.landmarkCount > 0
    ? Math.round((collection.collected / collection.landmarkCount) * 100) : 0;

  const bannerConfig = {
    completed: { icon: '🏆', title: '컬렉션 완성!', text: '모든 NFT를 수집했고 리워드가 열렸어요.', bg: colors.successSoft, color: colors.success },
    ended:     { icon: '🗂', title: '시즌이 종료된 컬렉션', text: '수집한 NFT와 기록은 계속 내 컬렉션에 보관돼요.', bg: colors.gray100, color: colors.gray500 },
    ongoing:   { icon: '🎁', title: '완성 리워드', text: collection.rewardDescription, bg: colors.primarySoft, color: colors.primary },
  };
  const banner = bannerConfig[collection.collectionStatus] || bannerConfig.ongoing;

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <PlaceImage src={collection.image} alt={collection.title} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.statusBadge, { backgroundColor: collection.accentColor }]}>
              <Text style={styles.statusBadgeText}>{collection.statusLabel}</Text>
            </View>
            <Text style={styles.heroRegion}>{collection.flag} {collection.region}</Text>
            <Text style={styles.heroTitle}>{collection.title}</Text>
            <Text style={styles.heroPeriod}>{collection.period}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}><Text style={styles.statValue}>{nftCount}</Text><Text style={styles.statLabel}>수집</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{progressPct}%</Text><Text style={styles.statLabel}>진행률</Text></View>
            <View style={[styles.statCard, { opacity: 0.6 }]}><Text style={[styles.statValue, { color: colors.gray400 }]}>{remainingCount}</Text><Text style={styles.statLabel}>잠금</Text></View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>컬렉션 진행률</Text>
              <Text style={[styles.progressPct, { color: collection.accentColor }]}>{progressPct}%</Text>
            </View>
            <ProgressBar value={collection.collected} max={collection.landmarkCount} color={collection.accentColor} />
            <View style={styles.progressMeta}>
              <Text style={styles.progressMetaText}>{collection.collected}/{collection.landmarkCount} 수집</Text>
              <Text style={styles.progressMetaText}>{remainingCount}개 남음</Text>
            </View>
          </View>

          <View style={[styles.banner, { backgroundColor: banner.bg }]}>
            <Text style={styles.bannerIcon}>{banner.icon}</Text>
            <View>
              <Text style={[styles.bannerTitle, { color: banner.color }]}>{banner.title}</Text>
              <Text style={styles.bannerText}>{banner.text}</Text>
            </View>
          </View>

          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>내 NFT 컬렉션</Text>
            <Text style={styles.galleryCount}>{nftCount}개</Text>
          </View>

          {nftCount === 0 ? (
            <View style={styles.emptyGallery}>
              <Text style={styles.emptyIcon}>✦</Text>
              <Text style={styles.emptyTitle}>아직 수집한 NFT가 없어요</Text>
              <Text style={styles.emptyDesc}>현장에서 NFC를 태그하면 첫 번째 NFT가 발행돼요.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {nfts.map((nft) => (
                <NftGalleryTokenCard key={nft.id} nft={nft} accentColor={collection.accentColor} fallbackSrc={collection.image} />
              ))}
              {Array.from({ length: remainingCount }).map((_, i) => (
                <NftGalleryTokenCard key={`locked-${i}`} locked />
              ))}
            </View>
          )}

          <GradientActionButton label="방문 루트 보기" onPress={() => navigation.navigate('EventDetail', { eventId })} />
          <TouchableOpacity onPress={() => navigation.navigate('컬렉션')}>
            <Text style={styles.backLink}>전체 컬렉션으로</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxxl },
  hero: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, gap: 4 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: 4 },
  statusBadgeText: { color: colors.white, fontSize: font.xs, fontWeight: '700' },
  heroRegion: { fontSize: font.sm, color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontSize: font.xxl, fontWeight: '800', color: colors.white },
  heroPeriod: { fontSize: font.xs, color: 'rgba(255,255,255,0.7)' },
  body: { padding: spacing.lg, gap: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: font.xl, fontWeight: '800', color: colors.gray900 },
  statLabel: { fontSize: font.xs, color: colors.gray400 },
  progressCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  progressPct: { fontSize: font.md, fontWeight: '800' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMetaText: { fontSize: font.xs, color: colors.gray400 },
  banner: { borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bannerIcon: { fontSize: 32 },
  bannerTitle: { fontSize: font.md, fontWeight: '700' },
  bannerText: { fontSize: font.sm, color: colors.gray500, marginTop: 2 },
  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  galleryTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  galleryCount: { fontSize: font.sm, color: colors.gray400 },
  emptyGallery: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 32, color: colors.gray300 },
  emptyTitle: { fontSize: font.lg, fontWeight: '700', color: colors.gray900 },
  emptyDesc: { fontSize: font.sm, color: colors.gray400, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  backLink: { textAlign: 'center', color: colors.primary, fontSize: font.sm, fontWeight: '600', paddingVertical: spacing.sm },
});
