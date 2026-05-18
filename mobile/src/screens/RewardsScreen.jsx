import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, RefreshControl,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rewardsApi } from '../api/rewards';
import EmptyState from '../components/common/EmptyState';
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
import { colors, radius, shadow, typography } from '../theme';

function RewardCodeModal({ reward, onClose, t }) {
  return (
    <Modal visible={!!reward} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalEmoji}>{reward?.emoji || '🎁'}</Text>
          <Text style={styles.modalTitle}>{reward?.title}</Text>
          {reward?.collectionName && <Text style={styles.modalCollection}>{reward.collectionName}</Text>}
          {reward?.couponCode && (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t('reward.couponLabel')}</Text>
              <Text style={styles.codeText}>{reward.couponCode}</Text>
            </View>
          )}
          {reward?.howToUse && (
            <View style={styles.howToUseBox}>
              <Text style={styles.howToUseLabel}>{t('reward.modalHowToUse')}</Text>
              <Text style={styles.howToUseText}>{reward.howToUse}</Text>
            </View>
          )}
          {reward?.validUntil && (
            <Text style={styles.validUntil}>
              {t('reward.validUntil')}: {new Date(reward.validUntil).toLocaleDateString('ko-KR')}
            </Text>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{t('reward.modalClose')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function RewardCard({ item, onUse, onView, t }) {
  const available = item.status === 'available';
  const color = item.accentColor || colors.primary;
  return (
    <TouchableOpacity style={[styles.card, !available && styles.cardDim]} onPress={() => available && onView(item)} activeOpacity={0.85}>
      <View style={[styles.cardEmoji, { backgroundColor: `${color}14` }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        {item.collectionName && <Text style={styles.cardSub} numberOfLines={1}>{item.collectionName}</Text>}
        {item.validUntil && available && (
          <Text style={styles.expiry}>~{new Date(item.validUntil).toLocaleDateString('ko-KR')}</Text>
        )}
        {item.status === 'used' && <Text style={styles.usedLabel}>{t('reward.statusUsed')}</Text>}
        {item.status === 'expired' && <Text style={styles.expiredLabel}>{t('reward.statusExpired')}</Text>}
      </View>
      {available && (
        <TouchableOpacity
          style={[styles.useBtn, { backgroundColor: color }]}
          onPress={() => onUse(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.useBtnText}>{t('rewardsExtra.useBtn')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function RewardsScreen() {
  const { t } = useLanguage();
  const FILTERS = [
    { label: t('rewardsExtra.allFilter'), value: undefined },
    { label: t('rewards.filters.available'), value: 'available' },
    { label: t('rewardsExtra.usedFilter'), value: 'used' },
    { label: t('rewardsExtra.expiredFilter'), value: 'expired' },
  ];
  const [filter, setFilter] = useState(undefined);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async (f) => {
    try {
      setRewards(await rewardsApi.list(f) || []);
    } catch { setRewards([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(filter); }, [filter, load]);

  const handleUse = useCallback((item) => {
    Alert.alert(t('rewardsExtra.modalTitle'), t('rewardsExtra.modalConfirm', { title: item.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('rewardsExtra.useBtn'),
        onPress: async () => {
          try {
            await rewardsApi.use(item.id);
            load(filter);
          } catch (err) {
            Alert.alert(t('rewardsExtra.errorTitle'), err.message || t('rewardsExtra.useError'));
          }
        },
      },
    ]);
  }, [load, filter, t]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <Text style={styles.pageTitle}>{t('rewards.title')}</Text>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => { setFilter(f.value); setLoading(true); }}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
        : (
          <FlatList
            data={rewards}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <RewardCard item={item} onUse={handleUse} onView={setViewing} t={t} />}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={<EmptyState icon="gift-outline" title={t('rewards.emptyTitle')} subtitle={t('rewards.emptyDescription')} />}
          />
        )
      }

      <RewardCodeModal reward={viewing} onClose={() => setViewing(null)} t={t} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pageTitle: { ...typography.h1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 16, flexWrap: 'wrap' },
  chip: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gray300 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow.card },
  cardDim: { opacity: 0.55 },
  cardEmoji: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.h3, fontSize: 15 },
  cardSub: { ...typography.caption, marginTop: 2 },
  expiry: { fontSize: 12, color: colors.warning, fontWeight: '600', marginTop: 3 },
  usedLabel: { fontSize: 12, color: colors.gray400, fontWeight: '600', marginTop: 3 },
  expiredLabel: { fontSize: 12, color: colors.gray400, fontWeight: '600', marginTop: 3 },
  useBtn: { borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 8 },
  useBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40, gap: 12 },
  modalEmoji: { fontSize: 40, textAlign: 'center' },
  modalTitle: { ...typography.h2, textAlign: 'center' },
  modalCollection: { ...typography.caption, textAlign: 'center' },
  codeBox: { backgroundColor: colors.gray100, borderRadius: radius.md, padding: 16, alignItems: 'center' },
  codeLabel: { ...typography.label, marginBottom: 6 },
  codeText: { fontSize: 22, fontWeight: '800', color: colors.gray900, letterSpacing: 3 },
  howToUseBox: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 14 },
  howToUseLabel: { ...typography.label, color: colors.primary, marginBottom: 4 },
  howToUseText: { fontSize: 13, color: colors.gray700 || colors.gray600, lineHeight: 20 },
  validUntil: { ...typography.caption, textAlign: 'center', color: colors.warning },
  closeBtn: { backgroundColor: colors.gray100, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  closeBtnText: { fontWeight: '700', color: colors.gray600, fontSize: 15 },
});
