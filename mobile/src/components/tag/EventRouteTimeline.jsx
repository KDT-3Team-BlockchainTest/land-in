import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, shadow } from '../../theme';

const MARKER_CFG = {
  done:    { bg: colors.primary, border: null,           label: '✓' },
  current: { bg: '#fff',         border: colors.primary, label: ''  },
  locked:  { bg: '#eef2f6',      border: '#d8dee9',      label: ''  },
  reward:  { bg: '#eef2f6',      border: '#d8dee9',      label: '🏆' },
};

function Marker({ stepState }) {
  const m = MARKER_CFG[stepState] ?? MARKER_CFG.locked;
  return (
    <View style={[
      styles.marker,
      { backgroundColor: m.bg },
      m.border ? { borderWidth: 3, borderColor: m.border } : null,
    ]}>
      {!!m.label && <Text style={styles.markerLabel}>{m.label}</Text>}
    </View>
  );
}

function StepCard({ step, isFirst, isLast }) {
  const isDone    = step.stepState === 'done';
  const isCurrent = step.stepState === 'current';
  const isLocked  = step.stepState === 'locked';
  const isReward  = step.stepState === 'reward';

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.line, isFirst && styles.lineHidden]} />
        <Marker stepState={step.stepState} />
        <View style={[styles.line, isLast && styles.lineHidden]} />
      </View>

      <View style={[
        styles.card,
        isCurrent && styles.cardCurrent,
        isReward  && styles.cardReward,
        isLocked  && styles.cardLocked,
      ]}>
        <PlaceImage uri={step.image} style={styles.image} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={2}>{step.title}</Text>
              {!!step.subtitle && (
                <Text style={styles.cardSubtitle} numberOfLines={1}>{step.subtitle}</Text>
              )}
            </View>
            {isDone && <Text style={styles.doneBadge}>완료</Text>}
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>지금 여기</Text>
              </View>
            )}
          </View>

          {isCurrent && (
            <Text style={styles.statusText}>👉 NFC 태그를 인증하세요</Text>
          )}
          {!!step.nft && (
            <Text style={styles.nftLabel}>💎 {step.nft.name}</Text>
          )}
          {step.isFinalStep && (
            <View style={styles.rewardTag}>
              <Text style={styles.rewardTagText}>🏆 컬렉션 완성 리워드</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function EventRouteTimeline({ steps = [] }) {
  if (!steps.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>방문 루트</Text>
          <Text style={styles.subtitle}>순서대로 방문하고 NFC를 인증하세요</Text>
        </View>
        <View style={styles.legend}>
          {[
            { bg: colors.primary, border: null,           label: '완료' },
            { bg: '#fff',         border: colors.primary, label: '현재' },
            { bg: '#eef2f6',      border: '#d8dee9',      label: '잠김' },
          ].map(({ bg, border, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: bg }, border && { borderWidth: 2, borderColor: border }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View>
        {steps.map((step, i) => (
          <StepCard key={step.id ?? i} step={step} isFirst={i === 0} isLast={i === steps.length - 1} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', color: colors.gray900, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.gray400 },
  legend: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  legendText: { fontSize: 11, color: colors.gray400 },

  row: { flexDirection: 'row', gap: 12 },

  rail: { width: 36, alignItems: 'center' },
  marker: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  markerLabel: { fontSize: 13, fontWeight: '700', color: '#fff' },
  line: { flex: 1, width: 2, backgroundColor: '#e5e7eb' },
  lineHidden: { backgroundColor: 'transparent' },

  card: { flex: 1, flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.surface, marginVertical: 6, ...shadow.card },
  cardCurrent: { borderWidth: 1, borderColor: 'rgba(254,107,112,0.28)', backgroundColor: '#fffdfd' },
  cardReward:  { borderWidth: 1, borderColor: 'rgba(254,107,112,0.22)', backgroundColor: '#fffafa' },
  cardLocked:  { opacity: 0.45 },

  image: { width: 64, height: 64, borderRadius: 16 },
  cardBody: { flex: 1, minWidth: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.gray900, lineHeight: 21 },
  cardSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 2 },

  doneBadge: { fontSize: 12, fontWeight: '700', color: colors.primary, flexShrink: 0 },
  currentBadge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.primary, flexShrink: 0 },
  currentBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  statusText: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 8 },
  nftLabel: { fontSize: 12, fontWeight: '600', color: colors.violet, marginTop: 6 },
  rewardTag: { marginTop: 8, padding: 10, borderRadius: 14, backgroundColor: 'rgba(254,107,112,0.08)' },
  rewardTagText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
