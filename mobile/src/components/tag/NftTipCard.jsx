import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

export default function NftTipCard({ nft }) {
  if (!nft) return null;
  const rarityColor = {
    legendary: '#f59e0b',
    rare: colors.violet,
    common: colors.gray500,
  }[nft.rarity?.toLowerCase()] || colors.gray500;

  return (
    <View style={styles.card}>
      <Ionicons name="diamond-outline" size={18} color={rarityColor} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>획득 예정 NFT</Text>
        <Text style={styles.name}>{nft.name}</Text>
      </View>
      <View style={[styles.rarity, { borderColor: rarityColor }]}>
        <Text style={[styles.rarityText, { color: rarityColor }]}>{nft.rarity?.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 12, borderWidth: 1, borderColor: colors.gray100,
  },
  label: { fontSize: 11, color: colors.gray500, fontWeight: '500' },
  name: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  rarity: { borderRadius: 100, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 3 },
  rarityText: { fontSize: 11, fontWeight: '800' },
});
