import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const tagConfig = {
  featured:  { icon: '★', label: '추천',  bg: '#fe6b70' },
  hot:       { icon: '●', label: '인기',  bg: '#ff4d00' },
  new:       { icon: '＋', label: 'NEW',   bg: '#22c55e' },
  ongoing:   { icon: '●', label: '진행중', bg: '#fe6b70' },
  completed: { icon: '✓', label: '완료',  bg: '#22c55e' },
  ended:     { icon: '○', label: '종료',  bg: '#94a3b8' },
};

export default function EventTagBadge({ tag }) {
  const config = tagConfig[tag];
  if (!config) return null;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  icon: { color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 13 },
  label: { color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 13 },
});
