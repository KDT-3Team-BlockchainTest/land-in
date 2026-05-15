import { api } from './client';
export const nfcApi = { verify: (tagUid) => api.post('/nfc/verify', { tagUid }) };
