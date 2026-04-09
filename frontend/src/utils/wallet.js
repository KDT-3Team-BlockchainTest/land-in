export const HOODI_CHAIN_ID = 560048;
export const HOODI_CHAIN_ID_HEX = `0x${HOODI_CHAIN_ID.toString(16)}`;

const HOODI_CHAIN_CONFIG = {
  chainId: HOODI_CHAIN_ID_HEX,
  chainName: "Ethereum Hoodi Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.hoodi.ethpandaops.io"],
  blockExplorerUrls: ["https://hoodi.etherscan.io"],
};

export function getEthereumProvider() {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export function formatWalletAddress(walletAddress) {
  if (!walletAddress) return "";
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

async function ensureHoodiNetwork(provider) {
  const currentChainId = await provider.request({ method: "eth_chainId" });
  if (currentChainId?.toLowerCase() === HOODI_CHAIN_ID_HEX.toLowerCase()) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HOODI_CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (error?.code !== 4902) {
      throw error;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [HOODI_CHAIN_CONFIG],
    });
  }
}

export async function connectInjectedWallet() {
  const provider = getEthereumProvider();
  if (!provider) {
    const error = new Error(
      "이 브라우저에서는 지갑이 감지되지 않았습니다. MetaMask 같은 지갑이 설치된 환경에서 다시 시도해 주세요.",
    );
    error.code = "NO_PROVIDER";
    throw error;
  }

  await ensureHoodiNetwork(provider);

  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const walletAddress = accounts?.[0];
  if (!walletAddress) {
    throw new Error("지갑 주소를 확인하지 못했습니다.");
  }

  const chainIdHex = await provider.request({ method: "eth_chainId" });

  return {
    walletAddress,
    chainId: Number.parseInt(chainIdHex, 16),
    walletProvider: "injected",
  };
}
