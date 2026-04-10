import { createEVMClient } from "@metamask/connect-evm";

export const HOODI_CHAIN_ID = 560048;
export const HOODI_CHAIN_ID_HEX = `0x${HOODI_CHAIN_ID.toString(16)}`;
const ETHEREUM_MAINNET_CHAIN_ID_HEX = "0x1";
export const META_MASK_MOBILE_CONNECT_QUERY = "mm_connect";
export const META_MASK_AUTH_TOKEN_QUERY = "mm_token";
export const META_MASK_AUTH_USER_QUERY = "mm_user";

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

const SUPPORTED_NETWORKS = {
  [ETHEREUM_MAINNET_CHAIN_ID_HEX]: "https://ethereum-rpc.publicnode.com",
  [HOODI_CHAIN_ID_HEX]: HOODI_CHAIN_CONFIG.rpcUrls[0],
};

let metaMaskClientPromise = null;

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function shouldUseMetaMaskMobileRedirect() {
  return isMobileBrowser() && !getEthereumProvider();
}

export function buildMetaMaskMobileUrl(targetUrl = window.location.href) {
  const normalizedUrl = targetUrl.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${normalizedUrl}`;
}

function getPersistedAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("land-in-token");
}

function getPersistedAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("land-in-user");
}

export function openMetaMaskMobileBrowser() {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set(META_MASK_MOBILE_CONNECT_QUERY, "1");

  const token = getPersistedAuthToken();
  const user = getPersistedAuthUser();

  if (token) {
    nextUrl.searchParams.set(META_MASK_AUTH_TOKEN_QUERY, token);
  }

  if (user) {
    nextUrl.searchParams.set(META_MASK_AUTH_USER_QUERY, encodeURIComponent(user));
  }

  window.location.assign(buildMetaMaskMobileUrl(nextUrl.toString()));
}

function resolveInjectedProvider() {
  if (typeof window === "undefined") return null;

  const provider = window.ethereum ?? null;
  if (!provider) return null;

  if (Array.isArray(provider.providers) && provider.providers.length > 0) {
    return provider.providers.find((candidate) => candidate?.isMetaMask) ?? provider.providers[0];
  }

  return provider;
}

export function getEthereumProvider() {
  return resolveInjectedProvider();
}

export function formatWalletAddress(walletAddress) {
  if (!walletAddress) return "";
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

async function getMetaMaskClient() {
  if (typeof window === "undefined") {
    throw new Error("Wallet connections are only available in a browser.");
  }

  if (!metaMaskClientPromise) {
    const mobileBrowser = isMobileBrowser();

    metaMaskClientPromise = createEVMClient({
      dapp: {
        name: "Land-in",
        url: window.location.origin,
        iconUrl: `${window.location.origin}/icon_logo_test1.png`,
      },
      api: {
        supportedNetworks: SUPPORTED_NETWORKS,
      },
      ui: {
        preferExtension: !mobileBrowser,
        showInstallModal: !mobileBrowser,
      },
      mobile: {
        useDeeplink: true,
        preferredOpenLink: (deeplink) => {
          window.location.assign(deeplink);
        },
      },
      debug: Boolean(import.meta.env.DEV),
    }).catch((error) => {
      metaMaskClientPromise = null;
      throw error;
    });
  }

  return metaMaskClientPromise;
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

export async function connectInjectedWallet(provider = getEthereumProvider()) {
  if (!provider) {
    const error = new Error("No wallet was detected in this browser. Install MetaMask or open the page in MetaMask.");
    error.code = "NO_PROVIDER";
    throw error;
  }

  await ensureHoodiNetwork(provider);

  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const walletAddress = accounts?.[0];
  if (!walletAddress) {
    throw new Error("Could not read the connected wallet address.");
  }

  const chainIdHex = await provider.request({ method: "eth_chainId" });

  return {
    walletAddress,
    chainId: Number.parseInt(chainIdHex, 16),
    walletProvider: provider.isMetaMask ? "metamask" : "injected",
  };
}

export async function connectMetaMaskWallet() {
  const injectedProvider = getEthereumProvider();
  if (injectedProvider) {
    return connectInjectedWallet(injectedProvider);
  }

  const client = await getMetaMaskClient();
  const { accounts } = await client.connect({
    chainIds: [HOODI_CHAIN_ID_HEX],
  });

  const provider = client.getProvider();
  await ensureHoodiNetwork(provider);

  const walletAddress = accounts?.[0];
  if (!walletAddress) {
    throw new Error("Could not read the connected MetaMask account.");
  }

  const chainIdHex = await provider.request({ method: "eth_chainId" });

  return {
    walletAddress,
    chainId: Number.parseInt(chainIdHex, 16),
    walletProvider: "metamask",
  };
}

export async function disconnectWalletSession() {
  if (!metaMaskClientPromise) {
    return;
  }

  try {
    const client = await metaMaskClientPromise;
    await client.disconnect();
  } finally {
    metaMaskClientPromise = null;
  }
}
