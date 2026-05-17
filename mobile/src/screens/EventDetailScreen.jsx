import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import GradientActionButton from '../components/common/GradientActionButton';
import EventRouteTimeline from '../components/tag/EventRouteTimeline';
import { colors, radius, shadow, typography } from '../theme';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    try {
      setEvent(await eventsApi.detail(eventId));
    } catch { Alert.alert('오류', '이벤트 정보를 불러오지 못했습니다.'); }
    finally { setLoading(false); }
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
    } finally { setJoining(false); }
  }, [eventId, load]);

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!event) return null;

  const theme = event.themeColor || colors.primary;
  const pct = event.landmarkCount > 0 ? (event.collected / event.landmarkCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PlaceImage uri={event.image} style={styles.hero} />

        <View style={styles.body}>
          {/* 기본 정보 */}
          <View style={styles.infoRow}>
            <View style={[styles.statusChip, { backgroundColor: `${theme}18` }]}>
              <Text style={[styles.statusText, { color: theme }]}>
                {event.status === 'active' ? '진행중' : event.status === 'upcoming' ? '예정' : '종료'}
              </Text>
            </View>
            {event.daysLeft > 0 && <Text style={styles.daysLeft}>{event.daysLeft}일 남음</Text>}
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.region}>{event.flag} {event.region} · {event.period}</Text>

          {event.description && <Text style={styles.desc}>{event.description}</Text>}

          {/* 진행 현황 */}
          {event.joined && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>내 진행 현황</Text>
                <Text style={[styles.progressCount, { color: theme }]}>{event.collected} / {event.landmarkCount}</Text>
              </View>
              <ProgressBar percent={pct} color={theme} height={8} />
            </View>
          )}

          {/* 루트 타임라인 */}
          {event.routeSteps?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>루트 코스</Text>
            </View>
          )}
        </View>

        {event.routeSteps?.length > 0 && (
          <EventRouteTimeline steps={event.routeSteps} />
        )}

        <View style={[styles.body, { marginTop: 24 }]}>
          {/* 리워드 정보 */}
          {event.rewardTitle && (
            <View style={[styles.rewardCard, { borderColor: `${theme}30` }]}>
              <Text style={styles.rewardEmoji}>{event.rewardEmoji || '🎁'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rewardTitle, { color: theme }]}>{event.rewardTitle}</Text>
                <Text style={styles.rewardDesc}>{event.rewardDescription}</Text>
              </View>
            </View>
          )}

          {/* NFT 갤러리 버튼 */}
          {event.joined && (
            <TouchableOpacity
              style={styles.nftBtn}
              onPress={() => navigation.navigate('NftGallery', { eventId })}
              activeOpacity={0.85}
            >
              <Ionicons name="diamond-outline" size={18} color={colors.violet} />
              <Text style={styles.nftBtnText}>NFT 갤러리 보기</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.violet} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: event.joined ? 20 : 100 }} />
      </ScrollView>

      {!event.joined && event.status === 'active' && (
        <View style={styles.footer}>
          <GradientActionButton
            label={joining ? '참여 중...' : '이벤트 참여하기'}
            onPress={handleJoin}
            disabled={joining}
            colors={[theme, `${theme}cc`]}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: { width: '100%', height: 260 },
  body: { paddingHorizontal: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 8 },
  statusChip: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  daysLeft: { fontSize: 12, color: colors.gray400, fontWeight: '600' },
  title: { ...typography.h1, marginBottom: 6 },
  region: { fontSize: 13, color: colors.gray500, marginBottom: 16 },
  desc: { ...typography.body, lineHeight: 24, color: colors.gray600, marginBottom: 20 },
  progressCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 24, ...shadow.card },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { ...typography.label },
  progressCount: { ...typography.label },
  section: { marginBottom: 12 },
  sectionTitle: { ...typography.h3 },
  rewardCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 16, borderWidth: 1, marginBottom: 14, ...shadow.card,
  },
  rewardEmoji: { fontSize: 28 },
  rewardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  rewardDesc: { ...typography.caption, lineHeight: 18 },
  nftBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: radius.md, padding: 14, marginBottom: 14,
  },
  nftBtnText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.violet },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.gray100 },
});
