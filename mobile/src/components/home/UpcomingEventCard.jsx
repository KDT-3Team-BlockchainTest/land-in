import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, radius, shadow } from '../../theme';

export default function UpcomingEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <PlaceImage uri={event.image} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>D-{event.daysUntilOpen}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={12} color={colors.gray400} />
          <Text style={styles.metaText}>{event.region}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.md, overflow: 'hidden', marginBottom: 10, ...shadow.card,
  },
  image: { width: 80, height: 80 },
  body: { flex: 1, padding: 12, justifyContent: 'center' },
  badgeRow: { marginBottom: 4 },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.gray100, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.gray500 },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: colors.gray500 },
});
