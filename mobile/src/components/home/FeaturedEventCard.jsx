import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, radius, shadow } from '../../theme';

const { width } = Dimensions.get('window');

export default function FeaturedEventCard({ event, onPress }) {
  const theme = event.themeColor || colors.primary;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <PlaceImage uri={event.image} style={styles.image} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={styles.overlay} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>✨ 추천</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.region}>{event.flag} {event.region}</Text>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metaText}>{event.landmarkCount}개 랜드마크</Text>
          {event.daysLeft > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{event.daysLeft}일 남음</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: width - 40, height: 220, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  badge: {
    position: 'absolute', top: 14, left: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  region: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  metaDot: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});
