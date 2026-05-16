import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Image, Linking, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nfcApi } from '../api/nfc';
import { collectionsApi } from '../api/collections';
import TagCampaignCard from '../components/tag/TagCampaignCard';
import SectionHeader from '../components/common/SectionHeader';
import { colors, radius, typography } from '../theme';

let NfcManager = null;
let NfcTech = null;
try {
  const nfc = require('react-native-nfc-manager');
  NfcManager = nfc.default;
  NfcTech = nfc.NfcTech;
} catch {}

const PHASE = { READY: 'ready', SCANNING: 'scanning', VERIFYING: 'verifying', MINTING: 'minting', MINTED: 'minted', ERROR: 'error' };
const MINT_STATUS = { MINTED_ONCHAIN: 'MINTED_ONCHAIN', PENDING_ONCHAIN: 'PENDING_ONCHAIN', PENDING_WALLET: 'PENDING_WALLET' };

export default function TagScreen({ navigation }) {
  const [phase, setPhase] = useState(PHASE.READY);
  const [nfcSupported, setNfcSupported] = useState(null);
  const [mintedNft, setMintedNft] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanning = useRef(false);
  const pollTimer = useRef(null);

  useEffect(() => {
    if (!NfcManager) {
      setNfcSupported(false);
      collectionsApi.list('ongoing').then(setCampaigns).catch(() => {});
      return;
    }
    NfcManager.isSupported().then((ok) => {
      setNfcSupported(ok);
      if (ok) NfcManager.start().catch(() => {});
    });
    collectionsApi.list('ongoing').then(setCampaigns).catch(() => {});
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== PHASE.SCANNING) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [phase, pulseAnim]);

  const parseTagUid = (tag) => {
    if (!tag?.id) return null;
    return Array.from(tag.id).map((b) => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
  };

  const verifyTag = useCallback(async (tagUid) => {
    setPhase(PHASE.VERIFYING);
    try {
      const result = await nfcApi.verify(tagUid);
      if (!result) throw new Error('서버 응답이 없습니다.');
      setMintedNft(result);

      if (result.mintStatus === MINT_STATUS.PENDING_ONCHAIN) {
        setPhase(PHASE.MINTING);
        let attempts = 0;
        pollTimer.current = setInterval(async () => {
          attempts++;
          if (attempts > 15) {
            clearInterval(pollTimer.current);
            setPhase(PHASE.MINTED);
            return;
          }
          try {
            const updated = await nfcApi.verify(tagUid);
            if (updated?.mintStatus !== MINT_STATUS.PENDING_ONCHAIN) {
              clearInterval(pollTimer.current);
              setMintedNft(updated);
              setPhase(PHASE.MINTED);
            }
          } catch { /* keep polling */ }
        }, 3000);
      } else {
        setPhase(PHASE.MINTED);
      }
    } catch (err) {
      setErrorMsg(err.message || '인증에 실패했습니다.');
      setPhase(PHASE.ERROR);
    }
  }, []);

  const startScan = useCallback(async () => {
    if (!NfcManager || scanning.current) return;
    scanning.current = true;
    setPhase(PHASE.SCANNING);
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      const uid = parseTagUid(tag);
      if (!uid) throw new Error('NFC 태그 UID를 읽지 못했습니다.');
      await verifyTag(uid);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('cancel') || msg.includes('Cancel') || msg.includes('cancelled')) {
        setPhase(PHASE.READY);
      } else if (phase === PHASE.SCANNING) {
        setErrorMsg(msg || '태그 인식에 실패했습니다.');
        setPhase(PHASE.ERROR);
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      scanning.current = false;
    }
  }, [verifyTag, phase]);

  const reset = useCallback(() => {
    setPhase(PHASE.READY);
    setMintedNft(null);
    setErrorMsg('');
    if (pollTimer.current) clearInterval(pollTimer.current);
  }, []);

  const rarityColor = {
    legendary: '#f59e0b',
    rare: colors.violet,
    common: colors.gray500,
  }[mintedNft?.rarity?.toLowerCase()] || colors.primary;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>NFC 스캔</Text>

          <View style={styles.scanCard}>
            {phase === PHASE.READY && (
              <>
                <View style={styles.nfcIconWrap}>
                  <Ionicons name="wifi-outline" size={56} color={colors.gray300} style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
                <Text style={styles.scanHint}>현장의 NFC 태그에 폰을 가져다 대면{'\n'}자동으로 인식됩니다</Text>
                {nfcSupported && (
                  <TouchableOpacity style={styles.scanBtn} onPress={startScan} activeOpacity={0.85}>
                    <Ionicons name="scan-outline" size={20} color="#fff" />
                    <Text style={styles.scanBtnText}>스캔 시작</Text>
                  </TouchableOpacity>
                )}
                {nfcSupported === false && (
                  <View style={styles.noNfcBox}>
                    <Ionicons name="warning-outline" size={20} color={colors.warning} />
                    <Text style={styles.noNfcText}>Expo Go에서는 NFC를 지원하지 않습니다{'\n'}실제 빌드 앱에서 사용해주세요</Text>
                  </View>
                )}
              </>
            )}

            {(phase === PHASE.SCANNING || phase === PHASE.VERIFYING) && (
              <View style={styles.scanningWrap}>
                <Animated.View style={[styles.scanRing, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="phone-portrait-outline" size={48} color={colors.primary} />
                </Animated.View>
                <Text style={styles.scanningText}>
                  {phase === PHASE.SCANNING ? 'NFC 태그를 기다리는 중...' : '인증 확인 중...'}
                </Text>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    NfcManager?.cancelTechnologyRequest().catch(() => {});
                    setPhase(PHASE.READY);
                  }}
                >
                  <Text style={styles.cancelText}>취소</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === PHASE.MINTING && (
              <View style={styles.scanningWrap}>
                <Ionicons name="diamond-outline" size={56} color={colors.violet} />
                <Text style={styles.scanningText}>NFT 발행 중...</Text>
                <Text style={styles.mintingSubtext}>블록체인에 기록하고 있습니다. 잠시만 기다려주세요.</Text>
              </View>
            )}

            {phase === PHASE.MINTED && mintedNft && (
              <View style={styles.mintedWrap}>
                <Ionicons name="checkmark-circle" size={52} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.mintedTitle}>인증 완료!</Text>
                {mintedNft.imageUrl && (
                  <Image source={{ uri: mintedNft.imageUrl }} style={styles.nftImage} />
                )}
                <Text style={[styles.nftName, { color: rarityColor }]}>{mintedNft.name}</Text>
                {mintedNft.rarity && (
                  <View style={[styles.rarityBadge, { borderColor: rarityColor }]}>
                    <Text style={[styles.rarityText, { color: rarityColor }]}>{mintedNft.rarity.toUpperCase()}</Text>
                  </View>
                )}
                {mintedNft.mintStatus === MINT_STATUS.MINTED_ONCHAIN && mintedNft.transactionHash && (
                  <TouchableOpacity
                    style={styles.txLink}
                    onPress={() => Linking.openURL(`https://holesky.etherscan.io/tx/${mintedNft.transactionHash}`)}
                  >
                    <Ionicons name="open-outline" size={13} color={colors.violet} />
                    <Text style={styles.txLinkText}>블록체인에서 확인</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                  <Text style={styles.resetBtnText}>다시 스캔하기</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === PHASE.ERROR && (
              <View style={styles.errorWrap}>
                <Ionicons name="close-circle" size={52} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={styles.errorTitle}>인증 실패</Text>
                <Text style={styles.errorMsg}>{errorMsg}</Text>
                <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                  <Text style={styles.resetBtnText}>다시 시도하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {Platform.OS === 'ios' && phase === PHASE.READY && nfcSupported && (
            <View style={styles.iosGuide}>
              <Ionicons name="information-circle-outline" size={16} color={colors.gray500} />
              <Text style={styles.iosGuideText}>iPhone은 위쪽 카메라 부근을 태그에 가까이 대주세요</Text>
            </View>
          )}

          {campaigns.length > 0 && phase === PHASE.READY && (
            <View style={styles.campaigns}>
              <SectionHeader title="참여중인 캠페인" action="컬렉션 보기" onAction={() => navigation.navigate('Collection')} />
              {campaigns.slice(0, 3).map((ev) => (
                <TagCampaignCard key={ev.id} event={ev} onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  pageTitle: { ...typography.h1, marginBottom: 20 },
  scanCard: {
    backgroundColor: colors.surface, borderRadius: 24,
    padding: 28, alignItems: 'center', minHeight: 260,
    justifyContent: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
  },
  nfcIconWrap: { marginBottom: 16 },
  scanHint: { ...typography.body, textAlign: 'center', lineHeight: 22, color: colors.gray500, marginBottom: 24 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.xl, paddingHorizontal: 32, paddingVertical: 14 },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noNfcBox: { alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.md, padding: 16 },
  noNfcText: { fontSize: 13, color: colors.warning, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  scanningWrap: { alignItems: 'center', gap: 16 },
  scanRing: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.primarySoft, borderWidth: 2.5, borderColor: colors.primaryMid,
    alignItems: 'center', justifyContent: 'center',
  },
  scanningText: { ...typography.body, color: colors.gray600, textAlign: 'center' },
  mintingSubtext: { ...typography.caption, textAlign: 'center', lineHeight: 18 },
  cancelBtn: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray300, paddingHorizontal: 20, paddingVertical: 8 },
  cancelText: { color: colors.gray500, fontWeight: '600' },
  mintedWrap: { alignItems: 'center', gap: 10, width: '100%' },
  mintedTitle: { fontSize: 22, fontWeight: '800', color: colors.success },
  nftImage: { width: 140, height: 140, borderRadius: radius.xl },
  nftName: { fontSize: 18, fontWeight: '800' },
  rarityBadge: { borderRadius: 100, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 4 },
  rarityText: { fontSize: 12, fontWeight: '800' },
  txLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txLinkText: { fontSize: 12, color: colors.violet, fontWeight: '600', textDecorationLine: 'underline' },
  resetBtn: { marginTop: 8, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: 28, paddingVertical: 10 },
  resetBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  errorWrap: { alignItems: 'center', gap: 10 },
  errorTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
  errorMsg: { ...typography.body, textAlign: 'center', color: colors.gray600 },
  iosGuide: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gray100, borderRadius: radius.sm, padding: 12, marginBottom: 24 },
  iosGuideText: { flex: 1, fontSize: 12, color: colors.gray500, lineHeight: 16 },
  campaigns: { marginTop: 8 },
});
