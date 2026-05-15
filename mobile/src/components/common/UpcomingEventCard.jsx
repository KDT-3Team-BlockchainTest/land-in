import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function UpcomingEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.left}>
        <Text style={styles.flag}>{event.flag}</Text>
        <View>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.region}>{event.region}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.daysLabel}>오픈까지</Text>
        <Text style={styles.days}>D-{event.daysUntilOpen}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow.card },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  flag: { fontSize: 28 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  region: { fontSize: font.xs, color: colors.gray400, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  daysLabel: { fontSize: font.xs, color: colors.gray400 },
  days: { fontSize: font.lg, fontWeight: '800', color: colors.primary },
});
