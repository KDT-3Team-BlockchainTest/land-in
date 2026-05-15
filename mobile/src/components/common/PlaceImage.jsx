import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

export default function PlaceImage({ src, fallbackSrc, alt, style }) {
  const [failed, setFailed] = useState(false);
  const uri = (failed ? fallbackSrc : src) || fallbackSrc;
  if (!uri) return <View style={[styles.placeholder, style]} />;
  return (
    <Image source={{ uri }} style={[styles.img, style]} accessibilityLabel={alt}
      onError={() => { if (!failed) setFailed(true); }} resizeMode="cover" />
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: colors.gray100 },
});
