import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from './PlaceImage';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function FeaturedEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}>
        <PlaceImage src={event.image} fallbackSrc={event.heroImageFallbackUrl} alt={event.title} style={styles.image} />
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.featuredBadge}><Text style={styles.featuredText}>★ FEATURED</Text></View>
          <Text style={styles.region}>{event.flag} {event.region}</Text>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.period}>{event.period}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.stat}><Text style={styles.statValue}>{event.landmarkCount}</Text><Text style={styles.statLabel}>랜드마크</Text></View>
        <View style={styles.stat}><Text style={styles.statValue}>D-{event.daysLeft}</Text><Text style={styles.statLabel}>마감</Text></View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.hero },
  imageWrap: { height: 220, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  content: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, gap: 4 },
  featuredBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.xs },
  featuredText: { color: colors.white, fontSize: font.xs, fontWeight: '700' },
  region: { fontSize: font.xs, color: 'rgba(255,255,255,0.8)' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.white },
  period: { fontSize: font.xs, color: 'rgba(255,255,255,0.7)' },
  footer: { flexDirection: 'row', padding: spacing.lg, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { fontSize: font.lg, fontWeight: '800', color: colors.gray900 },
  statLabel: { fontSize: font.xs, color: colors.gray400 },
});
