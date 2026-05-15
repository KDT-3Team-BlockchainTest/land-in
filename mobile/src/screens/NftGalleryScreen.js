import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nftsApi } from '../api/nfts';
import { colors, radius, shadow, typography } from '../theme';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48 - 12) / 2;

function NftCard({ nft, onPress }) {
  return (
    <TouchableOpacity style={[styles.nftCard, { width: ITEM_SIZE }]} onPress={onPress} activeOpacity={0.85}>
      {nft.imageUrl ? (
        <Image source={{ uri: nft.imageUrl }} style={styles.nftImage} />
      ) : (
        <View style={[styles.nftImage, styles.nftImagePlaceholder]}>
          <Ionicons name="diamond-outline" size={32} color={colors.violet} />
        </View>
      )}
      <View style={styles.nftBody}>
        <Text style={styles.nftName} numberOfLines={1}>{nft.name}</Text>
        {nft.rarity && <Text style={styles.nftRarity}>{nft.rarity}</Text>}
      </View>
    </TouchableOpacity>
  );
}

function NftDetailModal({ nft, onClose }) {
  return (
    <Modal visible={!!nft} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
          {nft?.imageUrl ? (
            <Image source={{ uri: nft.imageUrl }} style={styles.modalImage} resizeMode="contain" />
          ) : (
            <View style={[styles.modalImage, styles.nftImagePlaceholder]}>
              <Ionicons name="diamond-outline" size={64} color={colors.violet} />
            </View>
          )}
          <Text style={styles.modalName}>{nft?.name}</Text>
          {nft?.description && <Text style={styles.modalDesc}>{nft.description}</Text>}
          {nft?.rarity && (
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>{nft.rarity}</Text>
            </View>
          )}
          {nft?.mintedAt && (
            <Text style={styles.mintedAt}>
              획득일: {new Date(nft.mintedAt).toLocaleDateString('ko-KR')}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function NftGalleryScreen({ route }) {
  const { eventId } = route.params ?? {};
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    nftsApi.list(eventId)
      .then((data) => setNfts(data || []))
      .catch(() => setNfts([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={nfts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <NftCard nft={item} onPress={() => setSelected(item)} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="diamond-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyText}>아직 획득한 NFT가 없습니다</Text>
            <Text style={styles.emptyHint}>이벤트 스탬프를 모두 채우면 NFT를 받을 수 있어요</Text>
          </View>
        }
      />
      <NftDetailModal nft={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 32 },
  row: { gap: 12, marginBottom: 12 },
  nftCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  nftImage: { width: '100%', aspectRatio: 1 },
  nftImagePlaceholder: { backgroundColor: 'rgba(139,92,246,0.08)', alignItems: 'center', justifyContent: 'center' },
  nftBody: { padding: 10 },
  nftName: { ...typography.label, fontSize: 13, color: colors.gray900 },
  nftRarity: { fontSize: 11, color: colors.violet, fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    padding: 0,
  },
  modalImage: { width: '100%', aspectRatio: 1 },
  modalName: { ...typography.h2, padding: 20, paddingBottom: 8 },
  modalDesc: { ...typography.body, paddingHorizontal: 20, lineHeight: 22, textAlign: 'center' },
  rarityBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  rarityText: { fontSize: 12, fontWeight: '700', color: colors.violet },
  mintedAt: { ...typography.caption, marginTop: 10, marginBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { ...typography.body, color: colors.gray400 },
  emptyHint: { ...typography.caption, textAlign: 'center' },
});
