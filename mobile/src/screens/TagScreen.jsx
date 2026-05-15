import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { adaptCollection } from '../api/adapters';
import { collectionsApi } from '../api/collections';
import { nfcApi } from '../api/nfc';
import { nftsApi } from '../api/nfts';
import PlaceImage from '../components/common/PlaceImage';
import { colors, font, radius, spacing } from '../theme';

const VERIFY_DELAY_MS = 2500;
const VERIFIED_DELAY_MS = 1700;
const MINT_POLL_INTERVAL_MS = 3000;
const MINT_POLL_TIMEOUT_MS = 45000;

NfcManager.start().catch(() => {});

function parseTagValue(tag) {
  for (const record of tag.ndefMessage || []) {
    try {
      const text = Ndef.text.decodePayload(new Uint8Array(record.payload));
      if (/^TAG-[A-Z0-9-]+$/i.test(text.trim())) return text.trim();
      try {
        const url = new URL(text);
        const uid = url.searchParams.get('tagUid');
        if (uid) return uid.trim();
      } catch { /* not url */ }
    } catch { /* ignore */ }
  }
  return tag.id ? tag.id.map((b) => b.toString(16).padStart(2, '0')).join(':').toUpperCase() : '';
}

async function readNfcTag() {
  const isSupported = await NfcManager.isSupported();
  if (!isSupported) throw new Error('이 기기는 NFC를 지원하지 않습니다.');
  const isEnabled = await NfcManager.isEnabled();
  if (!isEnabled) throw new Error('NFC가 꺼져 있습니다. 기기 설정에서 NFC를 켜주세요.');
  await NfcManager.requestTechnology(NfcTech.Ndef);
  try {
    const tag = await NfcManager.getTag();
    const value = parseTagValue(tag);
    if (!value) throw new Error('태그에서 값을 읽지 못했습니다.');
    return value;
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export default function TagScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [phase, setPhase] = useState('ready');
  const [tagUid, setTagUid] = useState('');
  const [mintedNft, setMintedNft] = useState(null);
  const [mintError, setMintError] = useState('');
  const [nfcReading, setNfcReading] = useState(false);

  useEffect(() => {
    collectionsApi.list('ongoing')
      .then((list) => setCollections((list ?? []).map((c) => adaptCollection(c))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setTimeout(() => setPhase('verified'), VERIFY_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'verified') return;
    const t = setTimeout(async () => {
      setPhase('minting');
      try {
        const result = await nfcApi.verify(tagUid);
        setMintedNft(result.mintedNft);
        setPhase('minted');
      } catch (error) {
        setMintError(error.message || 'NFC 인증에 실패했습니다.');
        setPhase('error');
      }
    }, VERIFIED_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, tagUid]);

  useEffect(() => {
    if (!mintedNft?.id || mintedNft.mintStatus !== 'PENDING_ONCHAIN') return;
    let cancelled = false;
    const startedAt = Date.now();
    const poll = async () => {
      try {
        const refreshed = await nftsApi.getById(mintedNft.id);
        if (cancelled || !refreshed) return;
        setMintedNft(refreshed);
        if (refreshed.mintStatus !== 'PENDING_ONCHAIN') return;
        if (Date.now() - startedAt < MINT_POLL_TIMEOUT_MS) setTimeout(poll, MINT_POLL_INTERVAL_MS);
      } catch {
        if (!cancelled && Date.now() - startedAt < MINT_POLL_TIMEOUT_MS) setTimeout(poll, MINT_POLL_INTERVAL_MS);
      }
    };
    const t = setTimeout(poll, MINT_POLL_INTERVAL_MS);
    return () => { cancelled = true; clearTimeout(t); };
  }, [mintedNft]);

  const activeCollection = collections[0] ?? null;
  const resetToReady = () => { setPhase('ready'); setTagUid(''); setMintError(''); setMintedNft(null); };

  const handleReadNfc = async () => {
    setMintError(''); setNfcReading(true);
    try {
      const value = await readNfcTag();
      setTagUid(value);
      setPhase('scanning');
    } catch (error) {
      setMintError(error.message || 'NFC 태그를 읽지 못했습니다.');
    } finally {
      setNfcReading(false);
    }
  };

  if (!activeCollection) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>방문 인증</Text>
          <View style={styles.statusCard}>
            <Text style={styles.icon}>📵</Text>
            <Text style={styles.statusTitle}>인증할 컬렉션이 없어요</Text>
            <Text style={styles.statusDesc}>현재 진행 중인 컬렉션이 없어서 NFC 방문 인증을 시작할 수 없습니다.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>방문 인증</Text>

        {phase === 'ready' && (
          <>
            <View style={styles.statusCard}>
              <Text style={styles.icon}>📱</Text>
              <Text style={styles.statusTitle}>인증 준비 완료</Text>
              <Text style={styles.statusDesc}>NFC 태그를 읽거나 tag UID를 직접 입력하세요.</Text>
              <TextInput
                style={styles.input}
                value={tagUid}
                onChangeText={setTagUid}
                placeholder="예: TAG-SEOUL-001"
                placeholderTextColor={colors.gray400}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, !tagUid.trim() && styles.disabled]}
                onPress={() => { if (tagUid.trim()) { setMintError(''); setPhase('scanning'); } }}
                disabled={!tagUid.trim() || nfcReading}
              >
                <Text style={styles.primaryBtnText}>입력값으로 인증하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, nfcReading && styles.disabled]}
                onPress={handleReadNfc}
                disabled={nfcReading}
              >
                <Text style={styles.secondaryBtnText}>
                  {nfcReading ? '태그 읽는 중...' : '📡 휴대폰으로 태그 읽기'}
                </Text>
              </TouchableOpacity>
              {mintError ? <Text style={styles.errorText}>{mintError}</Text> : null}
            </View>

            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>사용 방법</Text>
              {['랜드마크의 NFC 태그를 찾으세요.', '휴대폰을 태그에 가까이 대세요.', '스캔 후 NFT 발행이 끝날 때까지 기다리세요.'].map((step, i) => (
                <View key={step} style={styles.guideStep}>
                  <View style={styles.guideNum}><Text style={styles.guideNumText}>{i + 1}</Text></View>
                  <Text style={styles.guideStepText}>{step}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {phase === 'scanning' && (
          <View style={styles.statusCard}>
            <Text style={styles.icon}>📡</Text>
            <Text style={styles.statusTitle}>NFC 인증 확인 중...</Text>
            <Text style={styles.statusDesc}>태그 값: {tagUid}</Text>
          </View>
        )}

        {phase === 'verified' && (
          <View style={[styles.statusCard, styles.successCard]}>
            <Text style={styles.icon}>✅</Text>
            <Text style={styles.statusTitle}>방문 인증 완료</Text>
            <Text style={styles.statusDesc}>NFT를 발행하고 있어요.</Text>
          </View>
        )}

        {phase === 'minting' && (
          <View style={styles.statusCard}>
            <Text style={styles.icon}>✨</Text>
            <Text style={styles.statusTitle}>NFT 발행 중...</Text>
            <Text style={styles.statusDesc}>컬렉션 보상을 준비하고 있습니다.</Text>
          </View>
        )}

        {phase === 'error' && (
          <View style={[styles.statusCard, styles.errorCard]}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.statusTitle}>인증 실패</Text>
            <Text style={styles.statusDesc}>{mintError}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={resetToReady}>
              <Text style={styles.primaryBtnText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'minted' && mintedNft && (
          <View style={styles.mintCard}>
            <View style={styles.mintImageWrap}>
              <PlaceImage src={mintedNft.imageUrl} fallbackSrc={activeCollection.image} alt={mintedNft.name} style={styles.mintImage} />
            </View>
            <View style={styles.mintBody}>
              <Text style={styles.mintCongrats}>축하합니다! 🎉</Text>
              <Text style={styles.mintTitle}>{mintedNft.name}</Text>
              <Text style={styles.mintSub}>NFT 발행 완료</Text>
            </View>
            <View style={styles.mintActions}>
              <TouchableOpacity style={styles.primaryBtn}
                onPress={() => navigation.navigate('NftGallery', { eventId: activeCollection.id })}>
                <Text style={styles.primaryBtnText}>컬렉션 보기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={resetToReady}>
                <Text style={styles.secondaryBtnText}>다시 인증하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900 },
  statusCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  successCard: { borderWidth: 2, borderColor: colors.success },
  errorCard: { borderWidth: 2, borderColor: colors.danger },
  icon: { fontSize: 48 },
  statusTitle: { fontSize: 20, fontWeight: '800', color: colors.gray900, textAlign: 'center' },
  statusDesc: { fontSize: 14, color: colors.gray500, textAlign: 'center', lineHeight: 22 },
  input: { width: '100%', backgroundColor: colors.gray100, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 15, color: colors.gray900, textAlign: 'center' },
  primaryBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  secondaryBtn: { width: '100%', backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.5 },
  errorText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  guideCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  guideTitle: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  guideStep: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  guideNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  guideNumText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  guideStepText: { flex: 1, fontSize: 14, color: colors.gray600 },
  mintCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  mintImageWrap: { height: 240 },
  mintImage: { width: '100%', height: '100%' },
  mintBody: { padding: spacing.lg, alignItems: 'center', gap: spacing.xs },
  mintCongrats: { fontSize: 18, fontWeight: '700', color: colors.primary },
  mintTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900 },
  mintSub: { fontSize: 13, color: colors.gray400 },
  mintActions: { padding: spacing.lg, gap: spacing.md },
});
