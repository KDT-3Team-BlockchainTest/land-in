import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, spacing } from '../../theme';

export default function SectionHeader({ title, description, actionLabel, onAction }) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  copy: { flex: 1 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  desc: { fontSize: font.xs, color: colors.gray400, marginTop: 2 },
  action: { fontSize: font.sm, color: colors.primary, fontWeight: '600', paddingLeft: spacing.sm },
});
