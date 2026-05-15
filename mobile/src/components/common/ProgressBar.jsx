import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../../theme';

export default function ProgressBar({ value, max, color, style }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, backgroundColor: colors.gray100, borderRadius: radius.sm, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.sm },
});
