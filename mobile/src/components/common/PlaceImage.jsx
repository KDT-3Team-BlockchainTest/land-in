import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

export default function PlaceImage({ uri, style, iconSize = 32 }) {
  if (uri) return <Image source={{ uri }} style={style} resizeMode="cover" />;
  return (
    <View style={[style, styles.placeholder]}>
      <Ionicons name="image-outline" size={iconSize} color={colors.gray300} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
});
