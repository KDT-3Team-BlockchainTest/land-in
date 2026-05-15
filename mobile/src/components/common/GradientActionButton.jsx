import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function GradientActionButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity style={[styles.btn, disabled && styles.disabled]} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.lg, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  label: { color: colors.white, fontSize: font.md, fontWeight: '800', letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
});
