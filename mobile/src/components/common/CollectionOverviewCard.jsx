import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from './PlaceImage';
import ProgressBar from './ProgressBar';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function CollectionOverviewCard({ collection, onPress }) {
  const accentColor = { ongoing: colors.primary, completed: colors.success, ended: colors.gray400 }[collection.collectionStatus] || colors.primary;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}>
        <PlaceImage src={collection.image} alt={collection.title} style={styles.image} />
        <View style={[styles.statusBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.statusText}>{collection.statusLabel}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.region}>{collection.flag} {collection.region}</Text>
        <Text style={styles.title} numberOfLines={2}>{collection.title}</Text>
        <Text style={styles.period}>{collection.period}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{collection.collected}/{collection.landmarkCount}</Text>
          <Text style={styles.progressPct}>{collection.progressPercent}%</Text>
        </View>
        <ProgressBar value={collection.collected} max={collection.landmarkCount} color={accentColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  imageWrap: { height: 140, position: 'relative' },
  image: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { color: colors.white, fontSize: font.xs, fontWeight: '700' },
  body: { padding: spacing.lg, gap: 4 },
  region: { fontSize: font.xs, color: colors.gray400 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  period: { fontSize: font.xs, color: colors.gray500 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  progressLabel: { fontSize: font.xs, color: colors.gray500 },
  progressPct: { fontSize: font.xs, fontWeight: '700', color: colors.gray600 },
});
