package com.landin.backend.domain.nfc.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.crypto.engines.AESEngine;
import org.bouncycastle.crypto.macs.CMac;
import org.bouncycastle.crypto.params.KeyParameter;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * NTAG 424 DNA SUN (Secure Unique NFC) / SDM (Secure Dynamic Messaging) 검증기.
 *
 * <p>참고 규격: NXP AN12196 Section 9 (SDM and SUN Feature)
 *
 * <p>검증 순서:
 * <ol>
 *   <li>piccData (AES-128-CBC, IV=0) 복호화 → UID + NFC 카운터 추출</li>
 *   <li>SV2 = [0x3C,0xC3,0x00,0x01,0x00,0x80] || UID(7) || Counter(3) 조합</li>
 *   <li>kSes = AES-128-CMAC(sdmMacKey, SV2) 로 세션 MAC 키 유도</li>
 *   <li>mac_full = AES-128-CMAC(kSes, "") — 빈 입력 (SDM ENC 파일 데이터 없는 경우)</li>
 *   <li>잘린 MAC = mac_full의 홀수 인덱스 바이트 8개 (bytes[1,3,5,7,9,11,13,15])</li>
 *   <li>받은 cmac와 상수 시간 비교</li>
 * </ol>
 */
@Slf4j
@Component
public class SunSdmVerifier {

    private static final int PICC_TAG_INDICATOR = 0xC7;
    private static final int PICC_DATA_BYTES = 16;
    private static final int CMAC_BYTES = 8;
    private static final int UID_BYTES = 7;
    private static final int COUNTER_BYTES = 3;

    /**
     * NTAG 424 DNA SUN/SDM 서명을 검증하고 UID와 카운터를 반환한다.
     *
     * @param piccDataHex  암호화된 PICC 데이터 (hex 32자, 16바이트)
     * @param cmacHex      태그가 계산한 잘린 CMAC (hex 16자, 8바이트)
     * @param sdmEncKeyHex AES-128 PICC 복호화 키 (hex 32자)
     * @param sdmMacKeyHex AES-128 CMAC 검증 키 (hex 32자)
     * @return 검증된 UID 문자열(콜론 구분 대문자 hex)과 NFC 카운터
     * @throws BusinessException SUN_PICC_INVALID — PICC 복호화 실패 또는 포맷 오류
     * @throws BusinessException SUN_MAC_INVALID  — CMAC 불일치 (위조 의심)
     */
    public SunSdmResult verify(String piccDataHex, String cmacHex,
                               String sdmEncKeyHex, String sdmMacKeyHex) {
        byte[] piccData    = parseHex(piccDataHex,    "piccData",    PICC_DATA_BYTES);
        byte[] receivedMac = parseHex(cmacHex,        "cmac",        CMAC_BYTES);
        byte[] sdmEncKey   = parseHex(sdmEncKeyHex,   "sdmEncKey",   16);
        byte[] sdmMacKey   = parseHex(sdmMacKeyHex,   "sdmMacKey",   16);

        // Step 1: AES-128-CBC(IV=0) 복호화
        byte[] plain = decryptAesCbc(piccData, sdmEncKey);

        if ((plain[0] & 0xFF) != PICC_TAG_INDICATOR) {
            log.warn("[SunSdmVerifier] 잘못된 PICC 태그 식별자: 0x{}", Integer.toHexString(plain[0] & 0xFF));
            throw new BusinessException(ErrorCode.SUN_PICC_INVALID);
        }

        byte[] uid     = new byte[UID_BYTES];
        byte[] ctrBytes = new byte[COUNTER_BYTES];
        System.arraycopy(plain, 1, uid, 0, UID_BYTES);
        System.arraycopy(plain, 1 + UID_BYTES, ctrBytes, 0, COUNTER_BYTES);
        int counter = (ctrBytes[0] & 0xFF)
                | ((ctrBytes[1] & 0xFF) << 8)
                | ((ctrBytes[2] & 0xFF) << 16);

        // Step 2: SV2 조합 (16바이트: 6 상수 + 7 UID + 3 카운터)
        byte[] sv2 = new byte[16];
        sv2[0] = 0x3C; sv2[1] = (byte) 0xC3; sv2[2] = 0x00;
        sv2[3] = 0x01; sv2[4] = 0x00;       sv2[5] = (byte) 0x80;
        System.arraycopy(uid,      0, sv2, 6,  UID_BYTES);
        System.arraycopy(ctrBytes, 0, sv2, 13, COUNTER_BYTES);

        // Step 3: 세션 MAC 키 유도
        byte[] kSes = computeCmac(sdmMacKey, sv2);

        // Step 4: 전체 CMAC 계산 (빈 입력 — SDM ENC 파일 데이터 없는 기본 SUN)
        byte[] macFull = computeCmac(kSes, new byte[0]);

        // Step 5: 잘린 MAC — 홀수 인덱스 바이트 추출 (indices 1,3,5,7,9,11,13,15)
        byte[] macTruncated = new byte[CMAC_BYTES];
        for (int i = 0; i < CMAC_BYTES; i++) {
            macTruncated[i] = macFull[2 * i + 1];
        }

        // Step 6: 상수 시간 비교
        if (!MessageDigest.isEqual(macTruncated, receivedMac)) {
            log.warn("[SunSdmVerifier] CMAC 불일치 — 태그 위조 가능성");
            throw new BusinessException(ErrorCode.SUN_MAC_INVALID);
        }

        String formattedUid = formatUid(uid);
        log.debug("[SunSdmVerifier] SUN/SDM 검증 성공. uid={}, counter={}", formattedUid, counter);
        return new SunSdmResult(formattedUid, counter);
    }

    // ─── private helpers ────────────────────────────────────────────────────────

    private byte[] decryptAesCbc(byte[] data, byte[] key) {
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(key, "AES"),
                    new IvParameterSpec(new byte[16]));
            return cipher.doFinal(data);
        } catch (Exception e) {
            log.warn("[SunSdmVerifier] PICC 데이터 복호화 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.SUN_PICC_INVALID);
        }
    }

    private byte[] computeCmac(byte[] key, byte[] data) {
        CMac mac = new CMac(AESEngine.newInstance());
        mac.init(new KeyParameter(key));
        mac.update(data, 0, data.length);
        byte[] result = new byte[16];
        mac.doFinal(result, 0);
        return result;
    }

    private byte[] parseHex(String hex, String fieldName, int expectedBytes) {
        if (hex == null || hex.isBlank()) {
            log.warn("[SunSdmVerifier] 필드 누락: {}", fieldName);
            throw new BusinessException(ErrorCode.SUN_PICC_INVALID);
        }
        String cleaned = hex.trim().replaceAll("\\s+", "");
        if (cleaned.length() != expectedBytes * 2) {
            log.warn("[SunSdmVerifier] {} 길이 오류: 예상={}자, 실제={}자", fieldName, expectedBytes * 2, cleaned.length());
            throw new BusinessException(ErrorCode.SUN_PICC_INVALID);
        }
        try {
            return HexFormat.of().parseHex(cleaned.toLowerCase());
        } catch (IllegalArgumentException e) {
            log.warn("[SunSdmVerifier] {} hex 파싱 실패", fieldName);
            throw new BusinessException(ErrorCode.SUN_PICC_INVALID);
        }
    }

    /** UID 바이트 배열을 모바일 앱과 동일한 형식(콜론 구분 대문자 hex)으로 변환한다. */
    private String formatUid(byte[] uid) {
        StringBuilder sb = new StringBuilder(uid.length * 3 - 1);
        for (int i = 0; i < uid.length; i++) {
            if (i > 0) sb.append(':');
            sb.append(String.format("%02X", uid[i]));
        }
        return sb.toString();
    }

    // ─── result type ─────────────────────────────────────────────────────────────

    /**
     * @param tagUid  콜론 구분 대문자 hex UID (예: "04:AB:CD:12:34:56:78")
     * @param counter NFC 카운터 (재전송 공격 감지용)
     */
    public record SunSdmResult(String tagUid, int counter) {}
}
