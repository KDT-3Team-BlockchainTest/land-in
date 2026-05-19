package com.landin.backend.domain.nfc.dto;

import lombok.Getter;

@Getter
public class NfcVerifyRequest {

    /**
     * NFC 태그 UID — piccData가 없을 때 필수 (레거시/테스트 모드).
     * NTAG 424 DNA SUN/SDM 모드에서는 서버가 piccData를 복호화해 UID를 추출하므로 생략 가능.
     */
    private String tagUid;

    /**
     * SUN/SDM 암호화된 PICC 데이터 (hex, 32자 = 16바이트).
     * NTAG 424 DNA가 동적으로 생성하는 URL의 picc_data 파라미터.
     * 이 필드가 있으면 SUN/SDM 검증 모드로 동작한다.
     */
    private String piccData;

    /**
     * SUN/SDM 잘린 CMAC (hex, 16자 = 8바이트).
     * NTAG 424 DNA가 동적으로 생성하는 URL의 cmac 파라미터.
     * piccData가 있을 때 필수.
     */
    private String cmac;

    /** SUN/SDM 모드 여부 — piccData가 있으면 true. */
    public boolean hasSdmData() {
        return piccData != null && !piccData.isBlank();
    }
}
