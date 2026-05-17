import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, radius, shadow } from '../../theme';

export default function UpcomingEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumb}>
        <PlaceImage uri={event.image} style={styles.image} />
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.region}>{event.region}</Text>
        <View style={styles.chips}>
          <View style={styles.timeChip}>
            <Ionicons name="time-outline" size={10} color={colors.gray500} />
            <Text style={styles.timeText}>{event.daysUntilOpen}일 후 오픈</Text>
          </View>
          {event.rewardLabel && (
            <View style={styles.rewardChip}>
              <Text style={styles.rewardChipText}>🎁 {event.rewardLabel}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.gray300} style={styles.arrow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: colors.surface, borderRadius: radius.md,
    overflow: 'hidden', marginBottom: 10, ...shadow.card,
  },
  thumb: { width: 80, flexShrink: 0, position: 'relative' },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,24,39,0.3)' },
  content: { flex: 1, padding: 12, justifyContent: 'center', gap: 3 },
  title: { fontSize: 13, fontWeight: '600', color: colors.gray900, lineHeight: 18 },
  region: { fontSize: 11, color: colors.gray400 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.gray100, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  timeText: { fontSize: 10, color: colors.gray500 },
  rewardChip: {
    backgroundColor: 'rgba(254,107,112,0.08)', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  rewardChipText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  arrow: { alignSelf: 'center', paddingRight: 4 },
});
