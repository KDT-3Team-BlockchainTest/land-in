import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, radius, shadow } from '../../theme';

const CARD_WIDTH = Dimensions.get('window').width * 0.68;

export default function ActiveEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <PlaceImage uri={event.image} style={styles.image} />

      {/* 상단 배지 */}
      <View style={styles.imageOverlay}>
        {event.daysLeft > 0 && (
          <View style={styles.timer}>
            <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.timerText}>{event.daysLeft}일 남음</Text>
          </View>
        )}
        <Text style={styles.flag}>{event.flag}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleGroup}>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.location}>{event.region}</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>📍 {event.landmarkCount}개 명소</Text>
          <Text style={styles.metaText}>🎁 리워드</Text>
        </View>

        {/* CTA - 웹과 동일 */}
        <View style={[styles.cta, event.isJoined && styles.ctaJoined]}>
          {event.isJoined && (
            <Ionicons name="sparkles" size={13} color={event.isJoined ? colors.primary : '#fff'} />
          )}
          <Text style={[styles.ctaText, event.isJoined && styles.ctaTextJoined]}>
            {event.isJoined ? '이어하기' : '루트 보기 & 참여하기'}
          </Text>
          <Ionicons name="arrow-forward" size={13} color={event.isJoined ? colors.primary : '#fff'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  image: { width: '100%', height: 140 },
  imageOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 10,
  },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 4 },
  timerText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  flag: { fontSize: 20 },
  body: { padding: 12, gap: 8 },
  titleGroup: { gap: 3 },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray900, lineHeight: 19 },
  location: { fontSize: 12, color: colors.gray500 },
  meta: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 12, color: colors.gray500 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 8,
  },
  ctaJoined: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryMid },
  ctaText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  ctaTextJoined: { color: colors.primary },
});
