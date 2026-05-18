import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../common/ProgressBar';
import PlaceImage from '../common/PlaceImage';
import { colors, radius, shadow } from '../../theme';

export default function TagCampaignCard({ event, onPress }) {
  const pct = event.landmarkCount > 0 ? (event.collected / event.landmarkCount) * 100 : 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <PlaceImage uri={event.image} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.region}>{event.flag} {event.region}</Text>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <ProgressBar percent={pct} color={event.themeColor || colors.primary} />
          </View>
          <Text style={styles.pct}>{Math.round(pct)}%</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={12} color={colors.gray400} />
          <Text style={styles.metaText}>{event.collected ?? 0}/{event.landmarkCount} 랜드마크</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', marginBottom: 10, ...shadow.card },
  image: { width: 88, alignSelf: 'stretch' },
  body: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  region: { fontSize: 11, color: colors.gray500, fontWeight: '600' },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pct: { fontSize: 11, color: colors.gray500, fontWeight: '600', flexShrink: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: colors.gray500 },
});
