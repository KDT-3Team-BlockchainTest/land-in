import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function StatSummaryGrid({ items }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={[styles.card, { backgroundColor: item.backgroundColor || colors.primarySoft }]}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.value, { color: item.color || colors.primary }]}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: spacing.sm },
  card: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: spacing.xs },
  icon: { fontSize: 20 },
  value: { fontSize: font.xl, fontWeight: '800' },
  label: { fontSize: font.xs, color: colors.gray500, textAlign: 'center' },
});
