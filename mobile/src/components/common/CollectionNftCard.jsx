import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from './PlaceImage';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function CollectionNftCard({ nft, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}><PlaceImage src={nft.image} alt={nft.name} style={styles.image} /></View>
      <Text style={styles.name} numberOfLines={1}>{nft.name}</Text>
      <Text style={styles.serial}>{nft.serial}</Text>
      {nft.rarity && <Text style={styles.rarity}>{nft.rarity}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', ...shadow.card },
  imageWrap: { height: 120 },
  image: { width: '100%', height: '100%' },
  name: { fontSize: font.sm, fontWeight: '700', color: colors.gray900, padding: spacing.sm, paddingBottom: 2 },
  serial: { fontSize: font.xs, color: colors.gray400, paddingHorizontal: spacing.sm },
  rarity: { fontSize: font.xs, color: colors.primary, fontWeight: '600', padding: spacing.sm, paddingTop: 2 },
});
