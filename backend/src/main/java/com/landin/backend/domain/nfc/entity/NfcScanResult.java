package com.landin.backend.domain.nfc.entity;

public enum NfcScanResult {
    SUCCESS, ALREADY_DONE, WRONG_ORDER, NOT_JOINED, UNKNOWN_TAG,
    /** NTAG 424 DNA SUN/SDM CMAC 검증 실패 */
    INVALID_MAC,
    /** NFC 카운터 재사용 — 재전송 공격 감지 */
    COUNTER_REPLAY
}
