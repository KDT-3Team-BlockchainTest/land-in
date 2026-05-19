import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../../api/events';
import { useAuth } from '../../auth/AuthProvider';
import { colors, radius, shadow, typography } from '../../theme';

const STATUS_CONFIG = {
  ACTIVE:    { label: '진행중', color: '#22c55e' },
  UPCOMING:  { label: '예정',   color: '#f59e0b' },
  COMPLETED: { label: '완료',   color: colors.primary },
  ENDED:     { label: '종료',   color: '#94a3b8' },
};

function EventRow({ event, onEdit, onDelete }) {
  const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.ENDED;
  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.rowSub}>{event.city} · {event.country} · {cfg.label}</Text>
          {event.totalSteps != null && (
            <Text style={styles.rowMeta}>{event.totalSteps}개 스탬프</Text>
          )}
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(event)} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(event)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EventListScreen({ navigation }) {
  const { logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setEvents(await eventsApi.list() || []); }
    catch { setEvents([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  const handleDelete = useCallback((event) => {
    Alert.alert('이벤트 삭제', `"${event.title}"을(를) 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          try { await eventsApi.remove(event.id); load(); }
          catch (err) { Alert.alert('오류', err.message || '삭제에 실패했습니다.'); }
        },
      },
    ]);
  }, [load]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 4 }}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {loading
        ? <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
        : (
          <FlatList
            data={events}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <EventRow
                event={item}
                onEdit={(ev) => navigation.navigate('EventEditor', { eventId: ev.id })}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
                <Text style={styles.emptyText}>등록된 이벤트가 없습니다</Text>
              </View>
            }
          />
        )
      }

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EventEditor', {})} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, paddingBottom: 100 },
  row: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow.card },
  rowMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  rowTitle: { ...typography.h3, marginBottom: 3 },
  rowSub: { ...typography.caption },
  rowMeta: { ...typography.caption, marginTop: 2 },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  editBtn: { backgroundColor: colors.primarySoft, borderRadius: radius.sm, padding: 8 },
  deleteBtn: { backgroundColor: colors.dangerSoft, borderRadius: radius.sm, padding: 8 },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { ...typography.body, color: colors.gray400 },
});
