import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../contexts/useLanguage';
import { colors } from '../../theme';

const logoIcon = require('../../assets/icon_logo.png');

export default function AppHeader() {
  const { language, toggleLanguage } = useLanguage();
  const nextLabel = language === 'ko' ? 'EN' : 'KO';

  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {/* 왼쪽: 로고 + 앱 이름 */}
        <View style={styles.brand}>
          <Image source={logoIcon} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.brandText}>land-in</Text>
        </View>

        {/* 오른쪽: 언어 토글 */}
        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage} activeOpacity={0.7}>
          <Ionicons name="globe-outline" size={20} color="#374151" />
          <View style={styles.langTag}>
            <Text style={styles.langTagText}>{nextLabel}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 32,
    height: 32,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  langBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTag: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: colors.primary,
    borderRadius: 999,
    alignItems: 'center',
  },
  langTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
});
