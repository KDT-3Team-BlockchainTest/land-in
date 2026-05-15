import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../../theme';

export default function RewardCouponCard({ reward, onShowCode }) {
  const accent = reward.accentColor || colors.primary;
  const statusLabel = { available: '사용 가능', used: '사용 완료', expired: '만료' }[reward.status] || '';
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.top}>
        <Text style={styles.emoji}>{reward.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.partner}>{reward.partner}</Text>
          <Text style={styles.title} numberOfLines={2}>{reward.title}</Text>
          <Text style={styles.collection}>{reward.collectionName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: accent + '20' }]}>
          <Text style={[styles.statusText, { color: accent }]}>{statusLabel}</Text>
        </View>
      </View>
      {reward.description ? <Text style={styles.desc}>{reward.description}</Text> : null}
      {reward.status === 'available' && reward.couponCode && (
        <TouchableOpacity style={[styles.useBtn, { backgroundColor: accent }]} onPress={() => onShowCode?.(reward)}>
          <Text style={styles.useBtnText}>코드 보기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderLeftWidth: 4, padding: spacing.lg, gap: spacing.sm, ...shadow.card },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  emoji: { fontSize: 32 },
  info: { flex: 1, gap: 2 },
  partner: { fontSize: font.xs, color: colors.gray400 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  collection: { fontSize: font.xs, color: colors.gray500 },
  statusBadge: { borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  statusText: { fontSize: font.xs, fontWeight: '700' },
  desc: { fontSize: font.sm, color: colors.gray500, lineHeight: 20 },
  useBtn: { borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  useBtnText: { color: colors.white, fontSize: font.sm, fontWeight: '700' },
});
