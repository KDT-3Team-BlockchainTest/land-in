import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from './PlaceImage';
import ProgressBar from './ProgressBar';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function TagCampaignCard({ collection, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}><PlaceImage src={collection.image} alt={collection.title} style={styles.image} /></View>
      <View style={styles.body}>
        <Text style={styles.region}>{collection.flag} {collection.region}</Text>
        <Text style={styles.title} numberOfLines={2}>{collection.title}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{collection.collected}/{collection.landmarkCount}</Text>
          <Text style={styles.pct}>{collection.progressPercent}%</Text>
        </View>
        <ProgressBar value={collection.collected} max={collection.landmarkCount} />
        <Text style={styles.hint}>탭해서 루트 상세 보기 →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  imageWrap: { height: 120 },
  image: { width: '100%', height: '100%' },
  body: { padding: spacing.lg, gap: spacing.xs },
  region: { fontSize: font.xs, color: colors.gray400 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  progressText: { fontSize: font.xs, color: colors.gray500 },
  pct: { fontSize: font.xs, fontWeight: '700', color: colors.primary },
  hint: { fontSize: font.xs, color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
});
