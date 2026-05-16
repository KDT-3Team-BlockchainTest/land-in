import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, radius, shadow } from '../../theme';

const { width } = Dimensions.get('window');

export default function FeaturedEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <PlaceImage uri={event.image} style={styles.image} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={styles.overlay} />

      {/* 상단 칩들 */}
      <View style={styles.top}>
        <View style={styles.chips}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>✨ 추천</Text>
          </View>
          <View style={styles.regionChip}>
            <Text style={styles.regionText}>{event.flag} {event.region}</Text>
          </View>
        </View>
        {event.daysLeft > 0 && (
          <View style={styles.timer}>
            <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.timerText}>{event.daysLeft}일 남음</Text>
          </View>
        )}
      </View>

      {/* 하단 정보 */}
      <View style={styles.bottom}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metaText}>{event.landmarkCount}개 랜드마크</Text>
          {event.daysLeft > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{event.daysLeft}일 남음</Text>
            </>
          )}
        </View>

        {/* CTA footer - 웹의 "루트 및 리워드 보기 / 이어하기"와 동일 */}
        <View style={styles.footer}>
          <Text style={styles.footerMeta}>루트 및 리워드 보기</Text>
          <View style={styles.footerCta}>
            {event.isJoined && <Ionicons name="sparkles" size={13} color="#fff" />}
            <Text style={styles.footerCtaText}>{event.isJoined ? '이어하기' : '시작하기'}</Text>
            <Ionicons name="arrow-forward" size={13} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: width - 40, height: 240, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  top: {
    position: 'absolute', top: 14, left: 14, right: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  chips: { flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  regionChip: {
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  regionText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  timer: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  timerText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  metaDot: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 10,
  },
  footerMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  footerCta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerCtaText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
