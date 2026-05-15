import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { nfcApi } from '../api/nfc';
import { colors, radius, typography } from '../theme';

const STATUS = {
  IDLE: 'idle',
  WAITING: 'waiting',
  SUCCESS: 'success',
  ERROR: 'error',
  UNSUPPORTED: 'unsupported',
};

export default function TagScreen() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [nfcSupported, setNfcSupported] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanning = useRef(false);

  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (!supported) {
        setStatus(STATUS.UNSUPPORTED);
        setNfcSupported(false);
      } else {
        setNfcSupported(true);
        NfcManager.start().catch(() => {});
      }
    });
    return () => { NfcManager.cancelTechnologyRequest().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (status !== STATUS.WAITING) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [status, pulseAnim]);

  const readNfcTag = useCallback(async () => {
    if (scanning.current) return;
    scanning.current = true;
    setStatus(STATUS.WAITING);
    setResult(null);

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      const tagUid = tag?.id
        ? Array.from(tag.id).map((b) => b.toString(16).padStart(2, '0')).join(':').toUpperCase()
        : null;

      if (!tagUid) throw new Error('NFC 태그 UID를 읽지 못했습니다.');

      const data = await nfcApi.verify(tagUid);
      setResult(data);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      if (err?.message?.includes('cancel') || err?.message?.includes('Cancel')) {
        setStatus(STATUS.IDLE);
      } else {
        setResult({ message: err.message || '태그 인식에 실패했습니다.' });
        setStatus(STATUS.ERROR);
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      scanning.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setResult(null);
  }, []);

  if (nfcSupported === false) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={64} color={colors.warning} />
          <Text style={styles.unsupportedTitle}>NFC를 지원하지 않는 기기입니다</Text>
          <Text style={styles.unsupportedDesc}>NFC 기능이 있는 기기에서 사용해주세요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>NFC 스캔</Text>
        <Text style={styles.pageDesc}>현장의 NFC 태그에 폰을 가져다 대어{'\n'}방문을 인증하세요</Text>

        <View style={styles.scanArea}>
          {status === STATUS.WAITING ? (
            <Animated.View style={[styles.scanRing, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.scanIcon}>
                <Ionicons name="phone-portrait-outline" size={52} color={colors.primary} />
              </View>
            </Animated.View>
          ) : status === STATUS.SUCCESS ? (
            <View style={styles.resultIcon}>
              <Ionicons name="checkmark-circle" size={96} color={colors.success} />
            </View>
          ) : status === STATUS.ERROR ? (
            <View style={styles.resultIcon}>
              <Ionicons name="close-circle" size={96} color={colors.primary} />
            </View>
          ) : (
            <View style={styles.scanIconIdle}>
              <Ionicons name="wifi-outline" size={64} color={colors.gray300} style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
          )}
        </View>

        {status === STATUS.IDLE && (
          <>
            <Text style={styles.hint}>아래 버튼을 누르고{'\n'}NFC 태그에 가져다 대세요</Text>
            <TouchableOpacity style={styles.scanBtn} onPress={readNfcTag} activeOpacity={0.85}>
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.scanBtnText}>스캔 시작</Text>
            </TouchableOpacity>
          </>
        )}

        {status === STATUS.WAITING && (
          <Text style={styles.waitingText}>NFC 태그를 기다리는 중...{'\n'}태그에 폰을 가까이 대주세요</Text>
        )}

        {status === STATUS.SUCCESS && (
          <View style={styles.resultBox}>
            <Text style={styles.successTitle}>인증 완료!</Text>
            {result?.nftName && <Text style={styles.resultDetail}>획득한 NFT: {result.nftName}</Text>}
            {result?.message && <Text style={styles.resultDetail}>{result.message}</Text>}
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>다시 스캔하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === STATUS.ERROR && (
          <View style={styles.resultBox}>
            <Text style={styles.errorTitle}>인증 실패</Text>
            {result?.message && <Text style={styles.resultDetail}>{result.message}</Text>}
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>다시 시도하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 },
  pageTitle: { ...typography.h1, marginBottom: 8 },
  pageDesc: { ...typography.body, textAlign: 'center', lineHeight: 22, color: colors.gray600, marginBottom: 48 },
  scanArea: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  scanRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: colors.primaryMid,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: { alignItems: 'center', justifyContent: 'center' },
  scanIconIdle: { alignItems: 'center', justifyContent: 'center' },
  resultIcon: { alignItems: 'center', justifyContent: 'center' },
  hint: { ...typography.body, textAlign: 'center', lineHeight: 22, color: colors.gray500, marginBottom: 28 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  waitingText: { ...typography.body, textAlign: 'center', lineHeight: 22, color: colors.gray500 },
  resultBox: { alignItems: 'center', gap: 10 },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.success },
  errorTitle: { fontSize: 22, fontWeight: '700', color: colors.primary },
  resultDetail: { ...typography.body, textAlign: 'center', color: colors.gray600 },
  resetBtn: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  resetBtnText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  unsupportedTitle: { ...typography.h2, marginTop: 20, textAlign: 'center' },
  unsupportedDesc: { ...typography.body, textAlign: 'center', marginTop: 8, color: colors.gray500 },
});
