import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function CollectionSummaryPanel({ ongoingCount, completedCount, nftCount }) {
  return (
    <View style={styles.panel}>
      {[{ label: '진행 중', value: ongoingCount, color: colors.primary }, { label: '완성', value: completedCount, color: colors.success }, { label: '총 NFT', value: nftCount, color: colors.violet }].map(({ label, value, color }) => (
        <View key={label} style={styles.item}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontSize: font.xxl, fontWeight: '800' },
  label: { fontSize: font.xs, color: colors.gray400 },
});
