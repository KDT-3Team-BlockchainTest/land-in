import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

export default function ProgressBar({ percent = 0, color = colors.primary, height = 6, style }) {
  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.gray100, borderRadius: 100, overflow: 'hidden' },
  fill: { borderRadius: 100 },
});
