import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from './PlaceImage';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function ActiveEventCard({ event, onJoin, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}>
        <PlaceImage src={event.image} fallbackSrc={event.heroImageFallbackUrl} alt={event.title} style={styles.image} />
        <View style={styles.overlay} />
        <View style={[styles.badge, { backgroundColor: event.themeColor || colors.primary }]}>
          <Text style={styles.badgeText}>D-{event.daysLeft}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.region}>{event.flag} {event.region}</Text>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.meta}>{event.landmarkCount}개 랜드마크</Text>
        {!event.joined ? (
          <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
            <Text style={styles.joinText}>참여하기</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedText}>참여 중</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 180, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  imageWrap: { height: 120, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  badge: { position: 'absolute', top: spacing.sm, right: spacing.sm, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { color: colors.white, fontSize: font.xs, fontWeight: '700' },
  body: { padding: spacing.md, gap: 4 },
  region: { fontSize: font.xs, color: colors.gray400 },
  title: { fontSize: font.sm, fontWeight: '700', color: colors.gray900 },
  meta: { fontSize: font.xs, color: colors.gray500 },
  joinBtn: { marginTop: spacing.xs, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  joinText: { color: colors.white, fontSize: font.xs, fontWeight: '700' },
  joinedBadge: { marginTop: spacing.xs, backgroundColor: colors.primarySoft, borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  joinedText: { color: colors.primary, fontSize: font.xs, fontWeight: '700' },
});
