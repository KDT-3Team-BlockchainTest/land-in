import { api } from './client';

export const nfcApi = {
  /**
   * NFC 태그 검증 요청.
   *
   * SUN/SDM 모드: { piccData, cmac } 전송 → 서버에서 NTAG 424 DNA 암호학적 검증
   * 레거시 모드:  { tagUid } 전송 → DB UID 조회만 수행
   *
   * @param {Object} params
   * @param {string} [params.tagUid]   - 레거시 모드 UID (콜론 구분 대문자 hex)
   * @param {string} [params.piccData] - SUN/SDM 암호화된 PICC 데이터 (hex 32자)
   * @param {string} [params.cmac]     - SUN/SDM 잘린 CMAC (hex 16자)
   */
  verify: (params) => api.post('/nfc/verify', params),
};
