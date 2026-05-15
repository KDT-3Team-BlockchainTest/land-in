import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function RewardCodeModal({ reward, onClose, onUse }) {
  if (!reward) return null;
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.emoji}>{reward.emoji}</Text>
          <Text style={styles.title}>{reward.title}</Text>
          <Text style={styles.partner}>{reward.partner}</Text>
          {reward.couponCode && (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>쿠폰 코드</Text>
              <Text style={styles.code}>{reward.couponCode}</Text>
            </View>
          )}
          {reward.howToUse && <Text style={styles.howToUse}>{reward.howToUse}</Text>}
          <TouchableOpacity style={styles.useBtn} onPress={onUse}>
            <Text style={styles.useBtnText}>사용 완료로 표시</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  panel: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xxl, gap: spacing.md, alignItems: 'center' },
  emoji: { fontSize: 48 },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.gray900, textAlign: 'center' },
  partner: { fontSize: font.sm, color: colors.gray400 },
  codeBox: { backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', width: '100%' },
  codeLabel: { fontSize: font.xs, color: colors.gray400, marginBottom: spacing.xs },
  code: { fontSize: font.xxl, fontWeight: '900', color: colors.gray900, letterSpacing: 4 },
  howToUse: { fontSize: font.sm, color: colors.gray500, textAlign: 'center', lineHeight: 20 },
  useBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.md, width: '100%', alignItems: 'center' },
  useBtnText: { color: colors.white, fontWeight: '700', fontSize: font.md },
  closeBtn: { paddingVertical: spacing.sm },
  closeBtnText: { color: colors.gray500, fontSize: font.sm },
});
