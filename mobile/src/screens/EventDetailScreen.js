import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import { colors, radius, shadow, typography } from '../theme';

function StepItem({ step, index }) {
  const done = step.completed;
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, done ? styles.stepDotDone : styles.stepDotPending]}>
        {done
          ? <Ionicons name="checkmark" size={14} color="#fff" />
          : <Text style={styles.stepNumber}>{index + 1}</Text>
        }
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.name}</Text>
        {step.description && <Text style={styles.stepDesc}>{step.description}</Text>}
      </View>
    </View>
  );
}

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    eventsApi.detail(eventId)
      .then((data) => setEvent(data))
      .catch(() => Alert.alert('오류', '이벤트 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleJoin = useCallback(async () => {
    setJoining(true);
    try {
      await eventsApi.join(eventId);
      const updated = await eventsApi.detail(eventId);
      setEvent(updated);
      Alert.alert('참여 완료!', '이벤트에 참여하셨습니다. NFC 태그를 스캔하여 스탬프를 모아보세요!');
    } catch (err) {
      Alert.alert('오류', err.message || '이벤트 참여에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) return null;

  const completedSteps = (event.steps || []).filter((s) => s.completed).length;
  const totalSteps = (event.steps || []).length;
  const progressPct = totalSteps > 0 ? completedSteps / totalSteps : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView>
        {event.thumbnailUrl ? (
          <Image source={{ uri: event.thumbnailUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Ionicons name="image-outline" size={48} color={colors.gray300} />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>

          {event.description && (
            <Text style={styles.desc}>{event.description}</Text>
          )}

          {totalSteps > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>진행 현황</Text>
                <Text style={styles.progressCount}>{completedSteps} / {totalSteps}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
              </View>
            </View>
          )}

          {event.steps && event.steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>스탬프 코스</Text>
              {event.steps.map((step, i) => (
                <StepItem key={step.id ?? i} step={step} index={i} />
              ))}
            </View>
          )}

          {event.nftReward && (
            <TouchableOpacity
              style={styles.nftBanner}
              onPress={() => navigation.navigate('NftGallery', { eventId })}
              activeOpacity={0.85}
            >
              <Ionicons name="diamond-outline" size={20} color={colors.violet} />
              <Text style={styles.nftBannerText}>NFT 갤러리 보기</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.violet} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {!event.joined && event.status === 'active' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={joining}
            activeOpacity={0.8}
          >
            <Text style={styles.joinBtnText}>{joining ? '참여 중...' : '이벤트 참여하기'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: 240 },
  heroPlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20 },
  title: { ...typography.h1, marginBottom: 12 },
  desc: { ...typography.body, lineHeight: 22, marginBottom: 20, color: colors.gray600 },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
    ...shadow.card,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { ...typography.label },
  progressCount: { ...typography.label, color: colors.primary },
  progressBar: { height: 8, backgroundColor: colors.gray100, borderRadius: 100, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 100 },
  section: { marginBottom: 20 },
  sectionTitle: { ...typography.h3, marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stepDotDone: { backgroundColor: colors.primary },
  stepDotPending: { backgroundColor: colors.gray200 || colors.gray100, borderWidth: 2, borderColor: colors.gray300 },
  stepNumber: { fontSize: 12, fontWeight: '700', color: colors.gray500 },
  stepContent: { flex: 1 },
  stepTitle: { ...typography.h3, fontSize: 15 },
  stepTitleDone: { color: colors.gray400, textDecorationLine: 'line-through' },
  stepDesc: { ...typography.caption, marginTop: 2 },
  nftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
  },
  nftBannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.violet },
  footer: { padding: 20, paddingBottom: 8, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.gray100 },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
