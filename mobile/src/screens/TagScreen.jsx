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
import AppHeader from '../components/layout/AppHeader';
import { useLanguage } from '../contexts/useLanguage';
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
  const { t } = useLanguage();
  const [phase, setPhase] = useState(PHASE.READY);
  const [nfcSupported, setNfcSupported] = useState(null);
  const [mintedNft, setMintedNft] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scannedUid, setScannedUid] = useState('');
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

  /**
   * NDEF URL 레코드(TNF=0x01, type='U')에서 NTAG 424 DNA SUN 파라미터를 추출한다.
   * picc_data와 cmac가 모두 있으면 SUN/SDM 모드 파라미터를 반환하고,
   * 없으면 레거시 UID 파라미터를 반환한다.
   */
  const parseNfcVerifyParams = (tag) => {
    const URL_PREFIXES = ['', 'http://www.', 'https://www.', 'http://', 'https://', 'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.', 'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://', 'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:', 'sip:', 'sips:', 'tftp:', 'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://', 'file://', 'urn:epc:id:', 'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:epc:', 'urn:nfc:'];

    if (tag?.ndefMessage) {
      for (const record of tag.ndefMessage) {
        // TNF=1 (Well Known), type=[0x55]='U' → URL レコード
        if (record.tnf === 1 && record.type) {
          const typeByte = String.fromCharCode(...Array.from(record.type));
          if (typeByte === 'U' && record.payload?.length > 1) {
            const prefixByte = record.payload[0];
            const prefix = URL_PREFIXES[prefixByte] ?? '';
            const body = String.fromCharCode(...Array.from(record.payload).slice(1));
            const fullUrl = prefix + body;
            try {
              const url = new URL(fullUrl);
              const piccData = url.searchParams.get('picc_data');
              const cmac = url.searchParams.get('cmac');
              if (piccData && cmac) {
                return { piccData, cmac };
              }
            } catch {}
          }
        }
      }
    }

    // 레거시 폴백: 태그 raw UID
    if (!tag?.id) return null;
    const tagUid = Array.from(tag.id).map((b) => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
    return { tagUid };
  };

  const verifyTag = useCallback(async (verifyParams) => {
    setPhase(PHASE.VERIFYING);
    try {
      const result = await nfcApi.verify(verifyParams);
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
            // 폴링은 상태 조회 전용 — 재스캔 없이 NFT ID로 조회
            const updated = await nfcApi.verify(verifyParams);
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
      const params = parseNfcVerifyParams(tag);
      if (!params) throw new Error('NFC 태그에서 인증 정보를 읽지 못했습니다.');
      // 화면에 표시할 UID: SUN/SDM 모드면 picc_data 앞 8자, 레거시면 tagUid
      setScannedUid(params.tagUid ?? params.piccData?.slice(0, 8) ?? '');
      await verifyTag(params);
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>{t('tag.title')}</Text>

          <View style={styles.scanCard}>
            {phase === PHASE.READY && (
              <>
                <View style={styles.nfcIconWrap}>
                  <Ionicons name="wifi-outline" size={56} color={colors.gray300} style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
                <Text style={styles.scanHint}>{t('tag.scanHint')}</Text>
                {nfcSupported && (
                  <TouchableOpacity style={styles.scanBtn} onPress={startScan} activeOpacity={0.85}>
                    <Ionicons name="scan-outline" size={20} color="#fff" />
                    <Text style={styles.scanBtnText}>{t('tag.startScan')}</Text>
                  </TouchableOpacity>
                )}
                {nfcSupported === false && (
                  <View style={styles.noNfcBox}>
                    <Ionicons name="warning-outline" size={20} color={colors.warning} />
                    <Text style={styles.noNfcText}>{t('tag.noNfc')}</Text>
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
                  {phase === PHASE.SCANNING ? t('tag.scanning') : t('tag.verifying')}
                </Text>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    NfcManager?.cancelTechnologyRequest().catch(() => {});
                    setPhase(PHASE.READY);
                  }}
                >
                  <Text style={styles.cancelText}>{t('tag.cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === PHASE.MINTING && (
              <View style={styles.scanningWrap}>
                <Ionicons name="diamond-outline" size={56} color={colors.violet} />
                <Text style={styles.scanningText}>{t('tag.minting')}</Text>
                <Text style={styles.mintingSubtext}>{t('tag.mintingDesc')}</Text>
              </View>
            )}

            {phase === PHASE.MINTED && mintedNft && (
              <View style={styles.mintedWrap}>
                <Ionicons name="checkmark-circle" size={52} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.mintedTitle}>{t('tag.mintedTitle')}</Text>
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
                    <Text style={styles.txLinkText}>{t('tag.viewOnChain')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                  <Text style={styles.resetBtnText}>{t('tag.scanAgain')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === PHASE.ERROR && (
              <View style={styles.errorWrap}>
                <Ionicons name="close-circle" size={52} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={styles.errorTitle}>{t('tag.errorTitle')}</Text>
                <Text style={styles.errorMsg}>{errorMsg}</Text>
                {scannedUid ? (
                  <View style={styles.uidBox}>
                    <Text style={styles.uidLabel}>{t('tag.scannedUidLabel')}</Text>
                    <Text style={styles.uidValue}>{scannedUid}</Text>
                    <Text style={styles.uidHint}>{t('tag.uidHint')}</Text>
                  </View>
                ) : null}
                <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                  <Text style={styles.resetBtnText}>{t('tag.tryAgain')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {Platform.OS === 'ios' && phase === PHASE.READY && nfcSupported && (
            <View style={styles.iosGuide}>
              <Ionicons name="information-circle-outline" size={16} color={colors.gray500} />
              <Text style={styles.iosGuideText}>{t('tag.iosGuide')}</Text>
            </View>
          )}

          {campaigns.length > 0 && phase === PHASE.READY && (
            <View style={styles.campaigns}>
              <SectionHeader title={t('tag.campaignsTitle')} action={t('tag.viewCollection')} onAction={() => navigation.navigate('Collection')} />
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
  errorWrap: { alignItems: 'center', gap: 10, width: '100%' },
  errorTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
  errorMsg: { ...typography.body, textAlign: 'center', color: colors.gray600 },
  uidBox: { width: '100%', backgroundColor: colors.gray100, borderRadius: radius.md, padding: 12, gap: 4 },
  uidLabel: { fontSize: 11, fontWeight: '700', color: colors.gray500 },
  uidValue: { fontSize: 13, fontWeight: '800', color: colors.gray900, fontFamily: 'monospace' },
  uidHint: { fontSize: 11, color: colors.gray400, lineHeight: 16 },
  iosGuide: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gray100, borderRadius: radius.sm, padding: 12, marginBottom: 24 },
  iosGuideText: { flex: 1, fontSize: 12, color: colors.gray500, lineHeight: 16 },
  campaigns: { marginTop: 8 },
});
