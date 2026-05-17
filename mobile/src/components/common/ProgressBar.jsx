import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

export default function ProgressBar({ percent = 0, color = colors.primary, height = 8, style }) {
  const pct = Math.min(100, Math.max(0, percent));
  return (
    <View style={[styles.track, { height }, style]}>
      <LinearGradient
        colors={['#ff8f78', color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${pct}%`, height }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', backgroundColor: '#eceff3', borderRadius: 999, overflow: 'hidden' },
  fill: { borderRadius: 999 },
});
