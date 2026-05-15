import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import ProgressBar from '../common/ProgressBar';
import { colors, radius, shadow } from '../../theme';

const CARD_WIDTH = Dimensions.get('window').width * 0.68;

export default function ActiveEventCard({ event, collected = 0, onPress }) {
  const pct = event.landmarkCount > 0 ? (collected / event.landmarkCount) * 100 : 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <PlaceImage uri={event.image} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.region}>{event.flag} {event.region}</Text>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.progressRow}>
          <ProgressBar percent={pct} color={event.themeColor || colors.primary} />
          <Text style={styles.progressLabel}>{collected}/{event.landmarkCount}</Text>
        </View>
        {event.daysLeft > 0 && (
          <Text style={styles.days}>{event.daysLeft}일 남음</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  image: { width: '100%', height: 140 },
  body: { padding: 12 },
  region: { fontSize: 11, color: colors.gray500, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginBottom: 10, lineHeight: 19 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  progressLabel: { fontSize: 11, color: colors.gray500, fontWeight: '600', flexShrink: 0 },
  days: { fontSize: 11, color: colors.primary, fontWeight: '600' },
});
