import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function ProgressBanner({ title, description, onClick }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onClick} activeOpacity={0.85}>
      <View style={styles.dot} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  copy: { flex: 1 },
  title: { fontSize: font.sm, fontWeight: '700', color: colors.gray900 },
  desc: { fontSize: font.xs, color: colors.gray500, marginTop: 2 },
  arrow: { fontSize: font.xl, color: colors.primary },
});
