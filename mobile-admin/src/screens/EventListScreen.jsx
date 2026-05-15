import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import { useAuth } from '../contexts/useAuth';
import { colors, font, radius, spacing } from '../theme';

const STATUS_COLOR = { ACTIVE: colors.success, UPCOMING: colors.warning, ENDED: colors.gray400 };

function EventRow({ event, onEdit, onDelete, busy }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
          {event.featured && <Text style={styles.featured}>★</Text>}
        </View>
        <Text style={styles.rowMeta}>{event.city} · {event.country}</Text>
        <View style={[styles.statusPill, { backgroundColor: (STATUS_COLOR[event.status] || colors.gray400) + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[event.status] || colors.gray400 }]}>{event.status}</Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editBtnText}>편집</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} disabled={busy}>
          <Text style={styles.deleteBtnText}>{busy ? '…' : '삭제'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EventListScreen({ navigation }) {
  const { logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    setLoading(true);
    eventsApi.list()
      .then((rows) => setEvents(rows || []))
      .catch((err) => setError(err.message || '목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = (id, title) => {
    Alert.alert('삭제 확인', `"${title}"를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        setBusyId(id);
        try { await eventsApi.remove(id); refresh(); }
        catch (err) { Alert.alert('오류', err.message || '삭제에 실패했습니다.'); }
        finally { setBusyId(null); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>이벤트 관리</Text>
          <Text style={styles.pageSubtitle}>총 {events.length}개</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('EventEditor', { eventId: null })}>
            <Text style={styles.newBtnText}>+ 새 이벤트</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}><Text style={styles.logoutText}>로그아웃</Text></TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.center}><Text style={styles.loadingText}>불러오는 중…</Text></View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>등록된 이벤트가 없습니다.</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('EventEditor', { eventId: null })}>
            <Text style={styles.newBtnText}>첫 이벤트 만들기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EventRow
              event={item}
              onEdit={() => navigation.navigate('EventEditor', { eventId: item.id })}
              onDelete={() => handleDelete(item.id, item.title)}
              busy={busyId === item.id}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray300, backgroundColor: colors.surface },
  pageTitle: { fontSize: font.xl, fontWeight: '800', color: colors.gray900 },
  pageSubtitle: { fontSize: font.xs, color: colors.gray400, marginTop: 2 },
  headerActions: { gap: spacing.sm, alignItems: 'flex-end' },
  newBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  newBtnText: { color: colors.white, fontWeight: '700', fontSize: font.sm },
  logoutText: { color: colors.gray400, fontSize: font.xs },
  error: { color: colors.danger, padding: spacing.lg, fontSize: font.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  loadingText: { color: colors.gray400, fontSize: font.md },
  emptyText: { color: colors.gray500, fontSize: font.md },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  rowInfo: { flex: 1, gap: spacing.xs },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900, flex: 1 },
  featured: { color: colors.primary, fontWeight: '700' },
  rowMeta: { fontSize: font.xs, color: colors.gray400 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { fontSize: font.xs, fontWeight: '700' },
  rowActions: { gap: spacing.xs },
  editBtn: { backgroundColor: colors.gray100, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  editBtnText: { fontSize: font.xs, fontWeight: '600', color: colors.gray600 },
  deleteBtn: { backgroundColor: '#fee2e2', borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  deleteBtnText: { fontSize: font.xs, fontWeight: '600', color: colors.danger },
});
