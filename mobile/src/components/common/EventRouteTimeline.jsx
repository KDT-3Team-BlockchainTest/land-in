import { StyleSheet, Text, View } from 'react-native';
import PlaceImage from './PlaceImage';
import { colors, font, radius, spacing } from '../../theme';

const STATE_CONFIG = {
  completed: { color: colors.success, label: '완료', icon: '✓' },
  current:   { color: colors.primary, label: '현재', icon: '→' },
  locked:    { color: colors.gray300, label: '잠김', icon: '🔒' },
  reward:    { color: colors.warning, label: '보상', icon: '🏆' },
};

export default function EventRouteTimeline({ steps, fallbackImage }) {
  if (!steps?.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>방문 루트</Text>
      {steps.map((step, i) => {
        const cfg = STATE_CONFIG[step.stepState] || STATE_CONFIG.locked;
        const isLast = i === steps.length - 1;
        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.lineCol}>
              <View style={[styles.dot, { backgroundColor: cfg.color }]}>
                <Text style={styles.dotIcon}>{cfg.icon}</Text>
              </View>
              {!isLast && <View style={[styles.line, { backgroundColor: cfg.color }]} />}
            </View>
            <View style={[styles.card, step.stepState === 'current' && styles.currentCard]}>
              <View style={styles.cardImageWrap}><PlaceImage src={step.image} fallbackSrc={fallbackImage} alt={step.title} style={styles.cardImage} /></View>
              <View style={styles.cardBody}>
                <Text style={styles.stepNum}>Step {i + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.subtitle ? <Text style={styles.stepSub}>{step.subtitle}</Text> : null}
                <View style={[styles.stateBadge, { backgroundColor: cfg.color + '20' }]}>
                  <Text style={[styles.stateText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  heading: { fontSize: font.md, fontWeight: '700', color: colors.gray900, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  lineCol: { alignItems: 'center', width: 32 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotIcon: { fontSize: 14, color: colors.white },
  line: { width: 2, flex: 1, marginTop: 4, opacity: 0.3 },
  card: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  currentCard: { borderWidth: 1.5, borderColor: colors.primary },
  cardImageWrap: { width: 72, height: 72 },
  cardImage: { width: '100%', height: '100%' },
  cardBody: { flex: 1, padding: spacing.sm, gap: 2 },
  stepNum: { fontSize: font.xs, color: colors.gray400 },
  stepTitle: { fontSize: font.sm, fontWeight: '700', color: colors.gray900 },
  stepSub: { fontSize: font.xs, color: colors.gray500 },
  stateBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: 2 },
  stateText: { fontSize: font.xs, fontWeight: '700' },
});
