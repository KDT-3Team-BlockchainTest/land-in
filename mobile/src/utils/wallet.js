import { Linking } from 'react-native';

export const HOODI_CHAIN_ID = 560048;
export const HOODI_CHAIN_ID_HEX = `0x${HOODI_CHAIN_ID.toString(16)}`;

export function formatWalletAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * MetaMask 딥링크 열기.
 * 완전한 WalletConnect 통합은 MOBILE_SETUP.md 참조.
 */
export async function openMetaMask() {
  const deeplink = 'metamask://';
  const canOpen = await Linking.canOpenURL(deeplink);
  if (canOpen) await Linking.openURL(deeplink);
  else await Linking.openURL('https://metamask.io/download/');
}
