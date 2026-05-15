import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../api/events';
import { colors, font, radius, spacing } from '../theme';

const STATUS_OPTIONS  = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'ENDED'];
const RARITY_OPTIONS  = ['COMMON', 'RARE', 'LEGENDARY'];

const emptyStep = (orderIndex = 1, finalStep = false) => ({
  orderIndex, placeName: '', placeDescription: '', imageUrl: '',
  lat: '', lng: '', finalStep, tagUid: '',
  nftName: '', nftImageUrl: '', nftRarity: 'COMMON', nftDescription: '',
});

const emptyForm = () => ({
  title: '', city: '', country: '', status: 'UPCOMING', featured: false,
  startDate: '', endDate: '', description: '', heroImageUrl: '', themeColor: '#fe6b70',
  steps: [emptyStep(1, true)],
  reward: { title: '', description: '', howToUse: '', validityDays: 90, emoji: '', accentColor: '#fe6b70' },
});

function toForm(res) {
  return {
    title: res.title ?? '', city: res.city ?? '', country: res.country ?? '',
    status: res.status ?? 'UPCOMING', featured: Boolean(res.featured),
    startDate: res.startDate ?? '', endDate: res.endDate ?? '',
    description: res.description ?? '', heroImageUrl: res.heroImageUrl ?? '',
    themeColor: res.themeColor ?? '#fe6b70',
    steps: (res.steps?.length ? res.steps : [emptyStep(1, true)]).map((s, i) => ({
      orderIndex: s.orderIndex ?? i + 1, placeName: s.placeName ?? '',
      placeDescription: s.placeDescription ?? '', imageUrl: s.imageUrl ?? '',
      lat: s.lat ?? '', lng: s.lng ?? '', finalStep: Boolean(s.finalStep),
      tagUid: s.tagUid ?? '', nftName: s.nftName ?? '', nftImageUrl: s.nftImageUrl ?? '',
      nftRarity: s.nftRarity ?? 'COMMON', nftDescription: s.nftDescription ?? '',
    })),
    reward: res.reward
      ? { title: res.reward.title ?? '', description: res.reward.description ?? '',
          howToUse: res.reward.howToUse ?? '', validityDays: res.reward.validityDays ?? 90,
          emoji: res.reward.emoji ?? '', accentColor: res.reward.accentColor ?? '#fe6b70' }
      : emptyForm().reward,
  };
}

function Field({ label, children }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text>{children}</View>;
}

function Input({ value, onChangeText, placeholder, multiline, keyboardType }) {
  return (
    <TextInput style={[styles.input, multiline && styles.inputMulti]} value={value}
      onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.gray400}
      multiline={multiline} keyboardType={keyboardType} autoCapitalize="none" autoCorrect={false} />
  );
}

export default function EventEditorScreen({ route, navigation }) {
  const { eventId } = route.params ?? {};
  const isNew = !eventId;
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    eventsApi.detail(eventId)
      .then((res) => setForm(toForm(res)))
      .catch(() => Alert.alert('오류', '이벤트 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [eventId, isNew]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setStep = (i, key, value) => setForm((p) => {
    const steps = [...p.steps];
    steps[i] = { ...steps[i], [key]: value };
    return { ...p, steps };
  });
  const setReward = (key, value) => setForm((p) => ({ ...p, reward: { ...p.reward, [key]: value } }));
  const addStep = () => setForm((p) => ({ ...p, steps: [...p.steps, emptyStep(p.steps.length + 1, false)] }));
  const removeStep = (i) => setForm((p) => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, orderIndex: idx + 1 })) }));

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('검증 오류', '이벤트 제목을 입력하세요.'); return; }
    setSaving(true);
    try {
      if (isNew) await eventsApi.create(form);
      else await eventsApi.update(eventId, form);
      navigation.goBack();
    } catch (err) { Alert.alert('저장 실패', err.message || '저장에 실패했습니다.'); }
    finally { setSaving(false); }
  };

  if (loading) return <SafeAreaView style={styles.root}><Text style={styles.loadingText}>불러오는 중…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>기본 정보</Text>
          <Field label="이벤트 제목 *"><Input value={form.title} onChangeText={(v) => set('title', v)} placeholder="예: 서울 랜드마크 투어" /></Field>
          <Field label="도시"><Input value={form.city} onChangeText={(v) => set('city', v)} placeholder="Seoul" /></Field>
          <Field label="국가"><Input value={form.country} onChangeText={(v) => set('country', v)} placeholder="South Korea" /></Field>
          <Field label="시작일 (YYYY-MM-DD)"><Input value={form.startDate} onChangeText={(v) => set('startDate', v)} placeholder="2026-01-01" /></Field>
          <Field label="종료일 (YYYY-MM-DD)"><Input value={form.endDate} onChangeText={(v) => set('endDate', v)} placeholder="2026-12-31" /></Field>
          <Field label="히어로 이미지 URL"><Input value={form.heroImageUrl} onChangeText={(v) => set('heroImageUrl', v)} placeholder="https://..." /></Field>
          <Field label="설명"><Input value={form.description} onChangeText={(v) => set('description', v)} placeholder="이벤트 설명..." multiline /></Field>

          <Field label="상태">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity key={s} style={[styles.pill, form.status === s && styles.pillActive]} onPress={() => set('status', s)}>
                  <Text style={[styles.pillText, form.status === s && styles.pillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          <Field label="피처드">
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Featured 이벤트로 표시</Text>
              <Switch value={form.featured} onValueChange={(v) => set('featured', v)} trackColor={{ true: colors.primary }} />
            </View>
          </Field>

          <Text style={styles.section}>방문 루트 스텝</Text>
          {form.steps.map((step, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Step {i + 1}</Text>
                {form.steps.length > 1 && (
                  <TouchableOpacity onPress={() => removeStep(i)}><Text style={styles.removeText}>삭제</Text></TouchableOpacity>
                )}
              </View>
              <Field label="장소명"><Input value={step.placeName} onChangeText={(v) => setStep(i, 'placeName', v)} placeholder="경복궁" /></Field>
              <Field label="이미지 URL"><Input value={step.imageUrl} onChangeText={(v) => setStep(i, 'imageUrl', v)} placeholder="https://..." /></Field>
              <Field label="NFC Tag UID"><Input value={step.tagUid} onChangeText={(v) => setStep(i, 'tagUid', v)} placeholder="TAG-SEOUL-001" /></Field>
              <Field label="NFT 이름"><Input value={step.nftName} onChangeText={(v) => setStep(i, 'nftName', v)} placeholder="경복궁 NFT" /></Field>
              <Field label="NFT 희귀도">
                <View style={styles.pillRow}>
                  {RARITY_OPTIONS.map((r) => (
                    <TouchableOpacity key={r} style={[styles.pill, step.nftRarity === r && styles.pillActive]} onPress={() => setStep(i, 'nftRarity', r)}>
                      <Text style={[styles.pillText, step.nftRarity === r && styles.pillTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>마지막 스텝</Text>
                <Switch value={step.finalStep} onValueChange={(v) => setStep(i, 'finalStep', v)} trackColor={{ true: colors.primary }} />
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
            <Text style={styles.addStepText}>+ 스텝 추가</Text>
          </TouchableOpacity>

          <Text style={styles.section}>완성 리워드</Text>
          <Field label="리워드 제목"><Input value={form.reward.title} onChangeText={(v) => setReward('title', v)} placeholder="특별 할인 쿠폰" /></Field>
          <Field label="설명"><Input value={form.reward.description} onChangeText={(v) => setReward('description', v)} placeholder="10% 할인 혜택" multiline /></Field>
          <Field label="사용 방법"><Input value={form.reward.howToUse} onChangeText={(v) => setReward('howToUse', v)} placeholder="코드 입력..." multiline /></Field>
          <Field label="유효 기간 (일)">
            <Input value={String(form.reward.validityDays)} onChangeText={(v) => setReward('validityDays', Number(v) || 90)} keyboardType="numeric" placeholder="90" />
          </Field>

          <TouchableOpacity style={[styles.saveBtn, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? '저장 중…' : isNew ? '이벤트 생성' : '변경 사항 저장'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
  loadingText: { textAlign: 'center', marginTop: 100, color: colors.gray400 },
  section: { fontSize: font.lg, fontWeight: '800', color: colors.gray900, marginTop: spacing.lg, marginBottom: spacing.xs },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: font.sm, fontWeight: '600', color: colors.gray600 },
  input: { backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: font.md, color: colors.gray900, borderWidth: 1, borderColor: colors.gray300 },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  pill: { borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.gray100, marginRight: spacing.sm },
  pillActive: { backgroundColor: colors.primary },
  pillText: { fontSize: font.sm, fontWeight: '600', color: colors.gray400 },
  pillTextActive: { color: colors.white },
  pillRow: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.gray300 },
  switchLabel: { fontSize: font.sm, color: colors.gray600 },
  stepCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.gray300 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { fontSize: font.md, fontWeight: '700', color: colors.gray900 },
  removeText: { fontSize: font.sm, color: colors.danger, fontWeight: '600' },
  addStepBtn: { backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed' },
  addStepText: { color: colors.primary, fontWeight: '700', fontSize: font.sm },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: colors.white, fontWeight: '800', fontSize: font.md },
  disabled: { opacity: 0.6 },
});
