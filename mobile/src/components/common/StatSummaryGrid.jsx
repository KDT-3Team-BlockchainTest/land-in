import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../../theme';

export default function StatSummaryGrid({ stats }) {
  return (
    <View style={styles.grid}>
      {stats.map((s) => (
        <View key={s.label} style={[styles.card, { borderTopColor: s.color || colors.primary }]}>
          <Text style={[styles.value, { color: s.color || colors.primary }]}>{s.value}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderTopWidth: 3,
    padding: 14,
    alignItems: 'center',
    ...shadow.card,
  },
  value: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  label: { fontSize: 12, color: colors.gray500, fontWeight: '500', marginTop: 4, textAlign: 'center' },
});
