import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../../theme';

export default function EmptyState({ icon, title, description, children }) {
  return (
    <View style={styles.wrap}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing.xxxl, gap: spacing.sm },
  icon: { fontSize: 40, marginBottom: spacing.sm },
  title: { fontSize: font.lg, fontWeight: '700', color: colors.gray900, textAlign: 'center' },
  desc: { fontSize: font.sm, color: colors.gray400, textAlign: 'center', lineHeight: 20 },
});
