import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import { useAuth } from '../contexts/AuthContext';
import { colors, radius, shadow, typography } from '../theme';

function EventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {event.thumbnailUrl ? (
        <Image source={{ uri: event.thumbnailUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color={colors.gray300} />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardBadgeRow}>
          <View style={[styles.badge, event.status === 'active' ? styles.badgeActive : styles.badgeDefault]}>
            <Text style={[styles.badgeText, event.status === 'active' ? styles.badgeTextActive : styles.badgeTextDefault]}>
              {event.status === 'active' ? '진행중' : event.status === 'upcoming' ? '예정' : '종료'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
        {event.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>{event.description}</Text>
        )}
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={13} color={colors.gray400} />
          <Text style={styles.cardMetaText}>{event.location || '위치 정보 없음'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const data = await eventsApi.list('active');
      setEvents(data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
  }, [loadEvents]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>Land In</Text>
        <Text style={styles.greeting}>안녕하세요, {user?.displayName || '게스트'}님 👋</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>진행중인 이벤트</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>진행 중인 이벤트가 없습니다</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  logo: { fontSize: 22, fontWeight: '800', color: colors.primary },
  greeting: { ...typography.caption, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionTitle: { ...typography.h3, marginBottom: 16, marginTop: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 16 },
  cardBadgeRow: { flexDirection: 'row', marginBottom: 8 },
  badge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  badgeActive: { backgroundColor: colors.primarySoft },
  badgeDefault: { backgroundColor: colors.gray100 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: colors.primary },
  badgeTextDefault: { color: colors.gray500 },
  cardTitle: { ...typography.h3, marginBottom: 6 },
  cardDesc: { ...typography.body, lineHeight: 20, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { ...typography.caption },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { ...typography.body, color: colors.gray400 },
});
