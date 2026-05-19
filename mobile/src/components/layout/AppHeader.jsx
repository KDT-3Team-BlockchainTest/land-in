import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../contexts/useLanguage';
import { colors, shadow } from '../../theme';

const logoIcon = require('../../assets/icon_logo.png');

const LANGUAGES = [
  { id: 'ko', label: '한국어 Korean', isDefault: true },
  { id: 'en', label: '영어 English' },
  { id: 'ja', label: '일본어 日本語' },
  { id: 'zh', label: '중국어 中文' },
];

export default function AppHeader() {
  const { lang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {/* 왼쪽: 로고 + 앱 이름 */}
        <View style={styles.brand}>
          <Image source={logoIcon} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.brandText}>land-in</Text>
        </View>

        {/* 오른쪽: 언어 선택 */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setOpen(true)} activeOpacity={0.7} aria-label="언어 선택">
          <Ionicons name="globe-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 언어 선택 팝업 */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.popup}>
          {LANGUAGES.map((item, index) => {
            const isSelected = lang === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={[styles.popupItem, isSelected && styles.popupItemSelected]}
                  onPress={() => { changeLanguage(item.id); setOpen(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.popupItemLabel}>
                    {item.label}{item.isDefault ? ' (기본)' : ''}
                  </Text>
                  {isSelected && <Text style={styles.popupItemCheck}>✓</Text>}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && <View style={styles.popupDivider} />}
              </View>
            );
          })}
        </View>
      </Modal>
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -2,
  },

  // 팝업 backdrop (전체 화면 투명)
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // lang-popup: top:60, right:16, width:220, borderRadius:16, shadow
  popup: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    ...shadow.card,
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
  },

  // lang-popup__item: padding 14 18, flex row, justify-between
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  popupItemSelected: {
    backgroundColor: 'rgba(254, 107, 112, 0.08)',
  },
  popupItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  popupItemCheck: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },

  // lang-popup__divider: 1px gray-100, margin 0 18
  popupDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginHorizontal: 18,
  },
});
