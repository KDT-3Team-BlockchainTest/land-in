import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/useLanguage';
import { colors, shadow } from '../theme';

const LANGUAGES = [
  { id: 'ko', label: '한국어 Korean', isDefault: true },
  { id: 'en', label: '영어 English' },
  { id: 'ja', label: '일본어 日本語' },
  { id: 'zh', label: '중국어 中文' },
];

export default function LanguageScreen({ navigation }) {
  const { lang, changeLanguage } = useLanguage();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* settings-back 버튼 */}
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>언어 설정</Text>
        </TouchableOpacity>

        {/* language-card: borderRadius:22, surface, shadow, padding:4 0 */}
        <View style={s.card}>
          {LANGUAGES.map((item, index) => {
            const isSelected = lang === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={[s.item, isSelected && s.itemSelected]}
                  onPress={() => changeLanguage(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={s.itemLabel}>
                    {item.label}{item.isDefault ? ' (기본)' : ''}
                  </Text>
                  {isSelected && <Text style={s.itemCheck}>✓</Text>}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && <View style={s.divider} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* settings-fab-back: fixed bottom-right */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Text style={s.fabText}>←</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 20 },

  // settings-back: transparent, gray900, fontSize 16, fontWeight 800
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 16, fontWeight: '800', color: colors.gray900 },

  // language-card: borderRadius:22, surface, shadow, paddingVertical:4
  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingVertical: 4,
    ...shadow.card,
  },

  // language-item: padding:18, flex row, full width
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: 'transparent',
  },
  itemSelected: {
    backgroundColor: colors.primarySoft,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray900,
  },
  itemCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  // language-divider: 1px gray-100, margin 0 18
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginHorizontal: 18,
  },

  // settings-fab-back: fixed bottom-right, 48x48, borderRadius 50%
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gray100,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { fontSize: 20, color: colors.gray600 },
});
