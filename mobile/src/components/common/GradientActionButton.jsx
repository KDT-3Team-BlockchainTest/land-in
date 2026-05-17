import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '../../theme';

export default function GradientActionButton({ label, onPress, disabled, colors: gradColors, style }) {
  const gc = gradColors || ['#ff8c77', colors.primary];
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[styles.wrap, style]}>
      <LinearGradient
        colors={disabled ? [colors.gray300, colors.gray400] : gc}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.content}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 10,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
