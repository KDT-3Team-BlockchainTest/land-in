import { StyleSheet, Text, View } from 'react-native';
import PlaceImage from './PlaceImage';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function NftGalleryTokenCard({ nft, locked, accentColor, fallbackSrc }) {
  if (locked) {
    return (
      <View style={[styles.card, styles.locked]}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedText}>미수집</Text>
      </View>
    );
  }
  return (
    <View style={[styles.card, { borderColor: accentColor || colors.primary }]}>
      <View style={styles.imageWrap}><PlaceImage src={nft?.image} fallbackSrc={fallbackSrc} alt={nft?.name} style={styles.image} /></View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{nft?.name}</Text>
        <Text style={styles.serial}>{nft?.serial}</Text>
        {nft?.rarity && <Text style={[styles.rarity, { color: accentColor || colors.primary }]}>{nft.rarity}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1.5, borderColor: 'transparent', ...shadow.card },
  locked: { borderStyle: 'dashed', borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center', height: 160, gap: spacing.xs },
  lockIcon: { fontSize: 28 },
  lockedText: { fontSize: font.xs, color: colors.gray400 },
  imageWrap: { height: 130 },
  image: { width: '100%', height: '100%' },
  info: { padding: spacing.sm, gap: 2 },
  name: { fontSize: font.sm, fontWeight: '700', color: colors.gray900 },
  serial: { fontSize: font.xs, color: colors.gray400 },
  rarity: { fontSize: font.xs, fontWeight: '600' },
});
