import { useCallback, useEffect, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptEventDetail } from '../api/adapters';
import { eventsApi } from '../api/events';
import EventRouteTimeline from '../components/common/EventRouteTimeline';
import GradientActionButton from '../components/common/GradientActionButton';
import PlaceImage from '../components/common/PlaceImage';
import ProgressBar from '../components/common/ProgressBar';
import useJoinedEventIds from '../hooks/useJoinedEventIds';
import { colors, font, radius, spacing } from '../theme';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params ?? {};
  const { joinEvent } = useJoinedEventIds();
  const [raw, setRaw] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    if (!eventId) return;
    eventsApi.detail(eventId)
      .then((res) => { setRaw(res); setNotFound(false); })
      .catch((err) => { if (err.status === 404) setNotFound(true); });
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => sub.remove();
  }, [load]);

  if (notFound) { navigation.goBack(); return null; }
  if (!raw) return null;

  const event = adaptEventDetail(raw);
  const isJoined = raw.joined;
  const isJoinable = event.participationState === 'joinable';
  const hasCurrentStep = event.routeSteps.some((s) => s.stepState === 'current');

  let actionLabel = event.bottomCtaLabel;
  if (isJoinable && !isJoined) actionLabel = '루트 보기 & 참여하기';
  else if (hasCurrentStep) actionLabel = '방문 인증하기';

  const handleAction = async () => {
    if (isJoinable && !isJoined) {
      try { await joinEvent(event.id); } catch { /* ignore */ }
      navigation.navigate('방문인증');
      return;
    }
    if (hasCurrentStep) { navigation.navigate('방문인증'); return; }
    navigation.navigate('컬렉션');
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <PlaceImage src={event.image} fallbackSrc={event.heroImageFallbackUrl} alt={event.title} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroRegion}>{event.flag} {event.region}</Text>
            <Text style={styles.heroTitle}>{event.title}</Text>
            <Text style={styles.heroPeriod}>{event.period} · D-{event.daysLeft}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>진행률</Text>
              <Text style={styles.cardValue}>{event.collected}/{event.landmarkCount}</Text>
            </View>
            <ProgressBar value={event.collected} max={event.landmarkCount} />
          </View>

          {event.highlights?.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>하이라이트</Text>
              <View style={styles.chips}>
                {event.highlights.map((h) => (
                  <View key={h} style={styles.chip}><Text style={styles.chipText}>{h}</Text></View>
                ))}
              </View>
            </View>
          )}

          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: event.themeColor || colors.primary }]}>
            <Text style={styles.cardTitle}>{event.rewardTitle}</Text>
            <Text style={styles.cardDesc}>{event.rewardDescription}</Text>
          </View>

          {event.routeSteps.length > 0 && (
            <EventRouteTimeline steps={event.routeSteps} fallbackImage={event.image} />
          )}

          <GradientActionButton label={actionLabel} onPress={handleAction} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxxl },
  hero: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, gap: 4 },
  heroRegion: { fontSize: font.sm, color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontSize: font.xxl, fontWeight: '800', color: colors.white },
  heroPeriod: { fontSize: font.xs, color: 'rgba(255,255,255,0.7)' },
  body: { padding: spacing.lg, gap: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  cardValue: { fontSize: font.sm, color: colors.gray400 },
  cardDesc: { fontSize: font.sm, color: colors.gray500, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  chip: { backgroundColor: colors.primarySoft, borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 4 },
  chipText: { fontSize: font.xs, color: colors.primary, fontWeight: '600' },
});
