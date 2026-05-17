import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, typography } from '../../theme';

export default function SectionHeader({ title, description, action, onAction }) {
  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  content: { flex: 1 },
  title: { ...typography.h3 },
  description: { fontSize: 11, color: colors.gray400, marginTop: 2, lineHeight: 16 },
  action: { fontSize: 12, fontWeight: '600', color: colors.primary },
});
