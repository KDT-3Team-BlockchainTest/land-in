import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import GradientActionButton from '../components/common/GradientActionButton';
import EventRouteTimeline from '../components/tag/EventRouteTimeline';
import { colors, shadow, typography } from '../theme';

function statusLabel(event) {
  if (event.joined) return '참여 중';
  if (event.status === 'active') return '참여 가능';
  if (event.status === 'upcoming') return '오픈 예정';
  return '종료';
}

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    try {
      setEvent(await eventsApi.detail(eventId));
    } catch {
      Alert.alert('오류', '이벤트 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const handleJoin = useCallback(async () => {
    setJoining(true);
    try {
      await eventsApi.join(eventId);
      await load();
      Alert.alert('참여 완료!', 'NFC 태그를 스캔하여 스탬프를 모아보세요!');
    } catch (err) {
      Alert.alert('오류', err.message || '이벤트 참여에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  }, [eventId, load]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!event) return null;

  const theme = event.themeColor || colors.primary;
  const pct = event.landmarkCount > 0 ? (event.collected / event.landmarkCount) * 100 : 0;
  const remaining = Math.max(0, event.landmarkCount - event.collected);
  const label = statusLabel(event);
  const dayChip = event.daysLeft > 0 ? `🕐 ${event.daysLeft}일 남음` : null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={styles.heroWrap}>
          <PlaceImage uri={event.image} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.80)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <View style={[styles.statusPill, { backgroundColor: theme }]}>
              <Text style={styles.statusPillText}>{label}</Text>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroRegion}>{event.flag}  {event.region}</Text>
            <Text style={styles.heroTitle}>{event.title}</Text>
            <View style={styles.heroChips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{event.period}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>📍 {event.landmarkCount}개 랜드마크</Text>
              </View>
              {dayChip && (
                <View style={[styles.chip, styles.chipAccent]}>
                  <Text style={styles.chipText}>{dayChip}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── CARDS ── */}
        <View style={styles.content}>

          {/* 진행 현황 (joined only) */}
          {event.joined && (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>진행 현황</Text>
                <Text style={[styles.pctText, { color: theme }]}>{Math.round(pct)}%</Text>
              </View>
              <View style={styles.barWrap}>
                <ProgressBar percent={pct} color={theme} height={10} />
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.footerText}>{event.collected}/{event.landmarkCount} 수집</Text>
                <Text style={styles.footerText}>{remaining}개 남음</Text>
              </View>
            </View>
          )}

          {/* 이벤트 특징 */}
          {event.highlights?.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardRowStart}>
                <Text style={styles.highlightIcon}>✨</Text>
                <Text style={styles.cardTitle}>이벤트 특징</Text>
              </View>
              <View style={styles.chipWrap}>
                {event.highlights.map((h) => (
                  <View key={h} style={styles.highlightChip}>
                    <Text style={styles.highlightChipText}>✨ {h}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 리워드 */}
          {event.rewardTitle && (
            <LinearGradient colors={['#332d80', '#2d2772']} style={styles.rewardCard}>
              <View style={styles.cardRowStart}>
                <Text style={styles.rewardBadge}>🏆</Text>
                <Text style={styles.rewardCardTitle}>{event.rewardTitle}</Text>
              </View>
              <View style={styles.rewardBody}>
                <Text style={styles.rewardGift}>🎁</Text>
                <Text style={styles.rewardDesc}>{event.rewardDescription}</Text>
              </View>
            </LinearGradient>
          )}

        </View>

        {/* 루트 타임라인 */}
        {event.routeSteps?.length > 0 && (
          <View style={styles.routeWrap}>
            <EventRouteTimeline steps={event.routeSteps} />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {event.joined && event.collected >= event.landmarkCount ? (
          <GradientActionButton
            label="완성! 🏆"
            disabled
          />
        ) : event.joined ? (
          <GradientActionButton
            label="태그하기"
            onPress={() => navigation.navigate('Tag')}
            colors={[theme, `${theme}cc`]}
          />
        ) : event.status === 'active' ? (
          <GradientActionButton
            label={joining ? '참여 중...' : '이벤트 참여하기'}
            onPress={handleJoin}
            disabled={joining}
            colors={[theme, `${theme}cc`]}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },

  /* ── HERO ── */
  heroWrap: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: 300 },
  heroTop: { position: 'absolute', top: 14, left: 16 },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  statusPillText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  heroBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  heroRegion: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 30, marginBottom: 12 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.18)' },
  chipAccent: { backgroundColor: 'rgba(254,107,112,0.88)' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  /* ── CONTENT ── */
  content: { padding: 20, gap: 14 },

  /* White cards */
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, ...shadow.card },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRowStart: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.gray900 },
  pctText: { fontSize: 14, fontWeight: '700' },
  barWrap: { marginVertical: 14 },
  footerText: { fontSize: 13, color: colors.gray400 },
  highlightIcon: { fontSize: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  highlightChip: {
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(254,107,112,0.18)',
    backgroundColor: 'rgba(254,107,112,0.05)',
  },
  highlightChipText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  /* Reward card */
  rewardCard: { borderRadius: 22, padding: 18, ...shadow.card },
  rewardBadge: { fontSize: 18 },
  rewardCardTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  rewardBody: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.09)',
  },
  rewardGift: { fontSize: 18 },
  rewardDesc: { flex: 1, fontSize: 15, color: '#fff', lineHeight: 22 },

  /* Route */
  routeWrap: { marginBottom: 20 },

  /* Footer */
  footer: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.gray100,
  },
});
