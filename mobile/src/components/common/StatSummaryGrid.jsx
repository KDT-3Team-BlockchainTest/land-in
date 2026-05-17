import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

export default function StatSummaryGrid({ stats }) {
  return (
    <View style={styles.grid}>
      {stats.map((s) => (
        <View key={s.label} style={[styles.card, { backgroundColor: s.backgroundColor || colors.primarySoft }]}>
          {s.icon ? <Text style={styles.icon}>{s.icon}</Text> : null}
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
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  icon: { fontSize: 16, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  label: { fontSize: 11, color: colors.gray500, lineHeight: 16, marginTop: 2, textAlign: 'center' },
});
