import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../theme';

export default function GradientActionButton({ label, onPress, disabled, colors: gradColors, style }) {
  const gc = gradColors || [colors.primary, '#ff8f70'];
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[styles.wrap, style]}>
      <LinearGradient colors={disabled ? [colors.gray300, colors.gray400] : gc} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: 'hidden' },
  gradient: { paddingVertical: 16, alignItems: 'center' },
  label: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
