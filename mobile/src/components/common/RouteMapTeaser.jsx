import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function RouteMapTeaser({ title, description, actionLabel, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.mapPlaceholder}><Text style={styles.mapIcon}>🗺</Text></View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
        <Text style={styles.action}>{actionLabel} →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  mapPlaceholder: { width: 100, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  mapIcon: { fontSize: 40 },
  info: { flex: 1, padding: spacing.lg, gap: spacing.xs },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  desc: { fontSize: font.sm, color: colors.gray500, lineHeight: 18 },
  action: { fontSize: font.sm, color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
});
