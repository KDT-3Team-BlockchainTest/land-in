import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Switch, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../../api/events';
import { colors, radius, shadow, typography } from '../../theme';

const STATUS_OPTIONS = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'ENDED'];
const RARITY_OPTIONS = ['COMMON', 'RARE', 'LEGENDARY'];

function Field({ label, children, required }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}{required && <Text style={{ color: colors.danger }}> *</Text>}</Text>
      {children}
    </View>
  );
}

function TextF({ value, onChange, placeholder, keyboardType, multiline, style }) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMulti, style]}
      value={String(value ?? '')}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.gray400}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
      autoCapitalize="none"
    />
  );
}

function SegmentControl({ options, value, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          style={[styles.segOpt, value === o && styles.segOptActive]}
          onPress={() => onChange(o)}
          activeOpacity={0.7}
        >
          <Text style={[styles.segText, value === o && styles.segTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ImagePickerField({ label, uri, onPick }) {
  return (
    <Field label={label}>
      <TouchableOpacity style={styles.imagePicker} onPress={onPick} activeOpacity={0.8}>
        {uri
          ? <Image source={{ uri }} style={styles.imagePreview} />
          : (
            <View style={styles.imageEmpty}>
              <Ionicons name="image-outline" size={28} color={colors.gray400} />
              <Text style={styles.imageEmptyText}>이미지 선택</Text>
            </View>
          )
        }
      </TouchableOpacity>
    </Field>
  );
}

function StepCard({ step, index, onChange, onRemove, onPickImage }) {
  const upd = (k) => (v) => onChange(index, { ...step, [k]: v });
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNum}>스텝 {index + 1}</Text>
        <TouchableOpacity onPress={() => onRemove(index)} style={styles.stepRemoveBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <Field label="장소명" required>
        <TextF value={step.placeName} onChange={upd('placeName')} placeholder="예: 경복궁" />
      </Field>
      <Field label="설명">
        <TextF value={step.placeDescription} onChange={upd('placeDescription')} placeholder="장소 설명" multiline />
      </Field>
      <Field label="NFC 태그 UID" required>
        <TextF value={step.tagUid} onChange={upd('tagUid')} placeholder="예: AA:BB:CC:DD" />
      </Field>

      <ImagePickerField label="장소 이미지" uri={step._imageUri} onPick={() => onPickImage(index, 'place')} />

      <View style={styles.divider} />
      <Text style={styles.subSection}>NFT 정보</Text>

      <Field label="NFT 이름">
        <TextF value={step.nftName} onChange={upd('nftName')} placeholder="예: 경복궁 수호 NFT" />
      </Field>
      <Field label="희귀도">
        <SegmentControl options={RARITY_OPTIONS} value={step.nftRarity || 'COMMON'} onChange={upd('nftRarity')} />
      </Field>
      <ImagePickerField label="NFT 이미지" uri={step._nftImageUri} onPick={() => onPickImage(index, 'nft')} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>최종 스텝 (리워드 지급)</Text>
        <Switch
          value={!!step.finalStep}
          onValueChange={upd('finalStep')}
          trackColor={{ false: colors.gray200, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}

const EMPTY_STEP = () => ({ placeName: '', placeDescription: '', tagUid: '', nftName: '', nftRarity: 'COMMON', finalStep: false, _imageUri: null, _nftImageUri: null });

export default function EventEditorScreen({ route, navigation }) {
  const { eventId } = route.params ?? {};
  const isEdit = !!eventId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', city: '', country: '', status: 'UPCOMING',
    featured: false, description: '', themeColor: '#fe6b70',
    startDate: '', endDate: '', _heroUri: null,
    rewardTitle: '', rewardDescription: '', rewardHowToUse: '',
    rewardEmoji: '🎁', validityDays: '30',
  });
  const [steps, setSteps] = useState([EMPTY_STEP()]);

  useEffect(() => {
    if (!isEdit) return;
    eventsApi.get(eventId).then((ev) => {
      if (!ev) return;
      setForm({
        title: ev.title || '',
        city: ev.city || '',
        country: ev.country || '',
        status: ev.status || 'UPCOMING',
        featured: ev.featured || false,
        description: ev.description || '',
        themeColor: ev.themeColor || '#fe6b70',
        startDate: ev.startDate || '',
        endDate: ev.endDate || '',
        _heroUri: ev.heroImageUrl || null,
        rewardTitle: ev.rewardTitle || '',
        rewardDescription: ev.rewardDescription || '',
        rewardHowToUse: ev.rewardHowToUse || '',
        rewardEmoji: ev.rewardEmoji || '🎁',
        validityDays: String(ev.rewardValidityDays || 30),
      });
      setSteps((ev.steps || []).map((s) => ({
        id: s.id,
        placeName: s.placeName || '',
        placeDescription: s.placeDescription || '',
        tagUid: s.tagUid || '',
        nftName: s.nftName || '',
        nftRarity: s.nftRarity || 'COMMON',
        finalStep: s.finalStep || false,
        _imageUri: s.imageUrl || null,
        _nftImageUri: s.nftImageUrl || null,
      })));
    }).catch(() => Alert.alert('오류', '이벤트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [eventId, isEdit]);

  const setF = (k) => (v) => setForm((prev) => ({ ...prev, [k]: v }));

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('권한 필요', '이미지 선택을 위해 갤러리 접근 권한이 필요합니다.'); return null; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    return result.canceled ? null : result.assets[0].uri;
  }, []);

  const handleHeroPick = useCallback(async () => {
    const uri = await pickImage();
    if (uri) setF('_heroUri')(uri);
  }, [pickImage]);

  const handleStepImagePick = useCallback(async (idx, type) => {
    const uri = await pickImage();
    if (!uri) return;
    setSteps((prev) => prev.map((s, i) => i === idx ? { ...s, [type === 'nft' ? '_nftImageUri' : '_imageUri']: uri } : s));
  }, [pickImage]);

  const addStep = () => setSteps((prev) => [...prev, EMPTY_STEP()]);
  const removeStep = (idx) => setSteps((prev) => prev.filter((_, i) => i !== idx));
  const updateStep = (idx, updated) => setSteps((prev) => prev.map((s, i) => i === idx ? updated : s));

  const validate = () => {
    if (!form.title.trim()) return '이벤트 제목을 입력하세요.';
    if (!form.city.trim() || !form.country.trim()) return '도시와 국가를 입력하세요.';
    if (steps.some((s) => !s.placeName.trim())) return '모든 스텝의 장소명을 입력하세요.';
    if (steps.some((s) => !s.tagUid.trim())) return '모든 스텝의 NFC UID를 입력하세요.';
    const uids = steps.map((s) => s.tagUid.trim());
    if (new Set(uids).size !== uids.length) return 'NFC 태그 UID가 중복되었습니다.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { Alert.alert('입력 오류', err); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        status: form.status,
        featured: form.featured,
        description: form.description.trim(),
        themeColor: form.themeColor,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        rewardTitle: form.rewardTitle.trim() || null,
        rewardDescription: form.rewardDescription.trim() || null,
        rewardHowToUse: form.rewardHowToUse.trim() || null,
        rewardEmoji: form.rewardEmoji,
        rewardValidityDays: Number(form.validityDays) || 30,
        steps: steps.map((s, i) => ({
          ...(s.id ? { id: s.id } : {}),
          orderIndex: i,
          placeName: s.placeName.trim(),
          placeDescription: s.placeDescription.trim() || null,
          tagUid: s.tagUid.trim(),
          nftName: s.nftName.trim() || null,
          nftRarity: s.nftRarity,
          finalStep: s.finalStep,
        })),
      };

      if (isEdit) {
        await eventsApi.update(eventId, payload);
      } else {
        await eventsApi.create(payload);
      }

      Alert.alert('저장 완료', `이벤트가 ${isEdit ? '수정' : '생성'}되었습니다.`, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('저장 실패', err.message || '다시 시도해주세요.');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

          {/* 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            <Field label="이벤트 제목" required><TextF value={form.title} onChange={setF('title')} placeholder="이벤트 이름" /></Field>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}><Field label="도시" required><TextF value={form.city} onChange={setF('city')} placeholder="서울" /></Field></View>
              <View style={{ flex: 1 }}><Field label="국가" required><TextF value={form.country} onChange={setF('country')} placeholder="한국" /></Field></View>
            </View>
            <Field label="상태">
              <SegmentControl options={STATUS_OPTIONS} value={form.status} onChange={setF('status')} />
            </Field>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>추천 이벤트 (Featured)</Text>
              <Switch value={form.featured} onValueChange={setF('featured')} trackColor={{ false: colors.gray200, true: colors.primary }} thumbColor="#fff" />
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}><Field label="시작일"><TextF value={form.startDate} onChange={setF('startDate')} placeholder="2025-01-01" /></Field></View>
              <View style={{ flex: 1 }}><Field label="종료일"><TextF value={form.endDate} onChange={setF('endDate')} placeholder="2025-12-31" /></Field></View>
            </View>
            <Field label="설명"><TextF value={form.description} onChange={setF('description')} placeholder="이벤트 설명" multiline /></Field>
            <ImagePickerField label="히어로 이미지" uri={form._heroUri} onPick={handleHeroPick} />
          </View>

          {/* 리워드 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>리워드 설정</Text>
            <Field label="리워드 제목"><TextF value={form.rewardTitle} onChange={setF('rewardTitle')} placeholder="컬렉션 완성 리워드" /></Field>
            <Field label="리워드 설명"><TextF value={form.rewardDescription} onChange={setF('rewardDescription')} placeholder="리워드 설명" multiline /></Field>
            <Field label="사용 방법"><TextF value={form.rewardHowToUse} onChange={setF('rewardHowToUse')} placeholder="1. 매장 방문 시..." multiline /></Field>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}><Field label="이모지"><TextF value={form.rewardEmoji} onChange={setF('rewardEmoji')} placeholder="🎁" /></Field></View>
              <View style={{ flex: 1 }}><Field label="유효기간(일)"><TextF value={form.validityDays} onChange={setF('validityDays')} placeholder="30" keyboardType="number-pad" /></Field></View>
            </View>
          </View>

          {/* 스텝 */}
          <View style={styles.section}>
            <View style={styles.stepsHeader}>
              <Text style={styles.sectionTitle}>스탬프 코스 ({steps.length}개)</Text>
              <TouchableOpacity style={styles.addStepBtn} onPress={addStep} activeOpacity={0.8}>
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.addStepText}>스텝 추가</Text>
              </TouchableOpacity>
            </View>
            {steps.map((step, i) => (
              <StepCard
                key={i}
                step={step}
                index={i}
                onChange={updateStep}
                onRemove={removeStep}
                onPickImage={handleStepImagePick}
              />
            ))}
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{saving ? '저장 중...' : isEdit ? '수정 완료' : '이벤트 생성'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16, paddingBottom: 48 },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14, ...shadow.card },
  sectionTitle: { ...typography.h3, marginBottom: 14, color: colors.primary },
  field: { marginBottom: 12 },
  fieldLabel: { ...typography.label, marginBottom: 6 },
  input: { backgroundColor: colors.gray100, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.gray200, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.gray900 },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 10 },
  segment: { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.sm, padding: 3 },
  segOpt: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: radius.sm - 2 },
  segOptActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  segText: { fontSize: 11, fontWeight: '600', color: colors.gray500 },
  segTextActive: { color: colors.primary },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, marginBottom: 4 },
  switchLabel: { fontSize: 13, color: colors.gray700, fontWeight: '500' },
  imagePicker: { borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.gray200, borderStyle: 'dashed', overflow: 'hidden' },
  imagePreview: { width: '100%', height: 160, resizeMode: 'cover' },
  imageEmpty: { height: 100, alignItems: 'center', justifyContent: 'center', gap: 6 },
  imageEmptyText: { fontSize: 13, color: colors.gray400 },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  addStepBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  addStepText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  stepCard: { backgroundColor: colors.gray100, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stepNum: { fontSize: 13, fontWeight: '800', color: colors.primary },
  stepRemoveBtn: { backgroundColor: colors.dangerSoft, borderRadius: 6, padding: 6 },
  divider: { height: 1, backgroundColor: colors.gray200, marginVertical: 12 },
  subSection: { fontSize: 12, fontWeight: '700', color: colors.gray500, marginBottom: 10, textTransform: 'uppercase' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
