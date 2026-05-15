import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Dimensions, FlatList, Image,
  Modal, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nftsApi } from '../api/nfts';
import EmptyState from '../components/common/EmptyState';
import { colors, radius, shadow, typography } from '../theme';

const { width } = Dimensions.get('window');
const ITEM = (width - 48 - 12) / 2;

const RARITY_COLOR = { legendary: '#f59e0b', rare: colors.violet, common: colors.gray500 };

function NftCard({ nft, onPress }) {
  const rc = RARITY_COLOR[nft.rarity] || colors.gray400;
  return (
    <TouchableOpacity style={[styles.nftCard, { width: ITEM }]} onPress={onPress} activeOpacity={0.85}>
      {nft.image
        ? <Image source={{ uri: nft.image }} style={styles.nftImage} />
        : <View style={[styles.nftImage, styles.nftPlaceholder]}><Ionicons name="diamond-outline" size={32} color={colors.violet} /></View>
      }
      <View style={styles.nftBody}>
        <Text style={styles.nftName} numberOfLines={1}>{nft.name}</Text>
        <View style={styles.nftMeta}>
          <Text style={styles.nftSerial}>{nft.serial}</Text>
          {nft.rarity && <Text style={[styles.nftRarity, { color: rc }]}>{nft.rarity.toUpperCase()}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function NftModal({ nft, onClose }) {
  if (!nft) return null;
  const rc = RARITY_COLOR[nft.rarity] || colors.gray400;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          {nft.image
            ? <Image source={{ uri: nft.image }} style={styles.modalImage} resizeMode="contain" />
            : <View style={[styles.modalImage, styles.nftPlaceholder]}><Ionicons name="diamond-outline" size={64} color={colors.violet} /></View>
          }
          <View style={styles.modalBody}>
            <Text style={styles.modalName}>{nft.name}</Text>
            {nft.rarity && (
              <View style={[styles.rarityBadge, { borderColor: rc }]}>
                <Text style={[styles.rarityText, { color: rc }]}>{nft.rarity.toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.modalSerial}>{nft.serial}</Text>
            {nft.mintedAt && (
              <Text style={styles.modalDate}>획득일 {new Date(nft.mintedAt).toLocaleDateString('ko-KR')}</Text>
            )}
          </View>
        </View>
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
    nftsApi.list(eventId).then(setNfts).catch(() => setNfts([])).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.primary} /></View>;
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
        ListEmptyComponent={<EmptyState icon="diamond-outline" title="아직 획득한 NFT가 없습니다" subtitle="이벤트 스탬프를 모두 채우면 NFT를 받을 수 있어요" />}
      />
      <NftModal nft={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 32 },
  row: { gap: 12, marginBottom: 12 },
  nftCard: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  nftImage: { width: '100%', aspectRatio: 1 },
  nftPlaceholder: { backgroundColor: 'rgba(139,92,246,0.08)', alignItems: 'center', justifyContent: 'center' },
  nftBody: { padding: 10 },
  nftName: { fontSize: 13, fontWeight: '700', color: colors.gray900 },
  nftMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  nftSerial: { fontSize: 11, color: colors.gray400 },
  nftRarity: { fontSize: 11, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', width: '100%' },
  modalImage: { width: '100%', aspectRatio: 1 },
  modalBody: { padding: 20, alignItems: 'center', gap: 8 },
  modalName: { ...typography.h2 },
  rarityBadge: { borderRadius: 100, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 4 },
  rarityText: { fontSize: 12, fontWeight: '800' },
  modalSerial: { ...typography.caption },
  modalDate: { ...typography.caption },
});
