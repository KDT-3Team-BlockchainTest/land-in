import { api } from './client';

export const nfcApi = {
  /** POST /api/nfc/verify — NFC 태그 검증 + NFT 발행 + 리워드 발급 */
  verify: (tagUid) => api.post('/nfc/verify', { tagUid }),
};
