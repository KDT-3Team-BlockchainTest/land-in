import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function NftTipCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>💡 NFT 수집 방법</Text>
      <Text style={styles.desc}>랜드마크 현장에서 NFC를 인증하면 즉시 NFT가 발행돼요. 컬렉션을 완성하면 리워드도 자동으로 해제됩니다.</Text>
      <View style={styles.chips}>
        {['현장 NFC 인증', '즉시 NFT 발행', '리워드 자동 해제'].map((chip) => (
          <View key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  desc: { fontSize: font.sm, color: colors.gray600, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.primaryMid, borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 4 },
  chipText: { fontSize: font.xs, color: colors.primary, fontWeight: '600' },
});
