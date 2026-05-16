import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';

export default function EmptyState({ icon = 'albums-outline', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={52} color={colors.gray300} />
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32, gap: 10 },
  title: { ...typography.body, color: colors.gray400, textAlign: 'center' },
  subtitle: { ...typography.caption, textAlign: 'center', lineHeight: 18 },
});
