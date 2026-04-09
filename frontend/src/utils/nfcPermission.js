const NFC_PERMISSION_STORAGE_KEY = "land-in-nfc-permission";
const NFC_PROMPT_SESSION_KEY = "land-in-nfc-permission-prompt-dismissed";

export function isWebNfcSupported() {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

export function hasSavedNfcPermission() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(NFC_PERMISSION_STORAGE_KEY) === "granted";
}

export function markNfcPermissionGranted() {
  if (typeof window === "undefined") return;
  localStorage.setItem(NFC_PERMISSION_STORAGE_KEY, "granted");
  sessionStorage.removeItem(NFC_PROMPT_SESSION_KEY);
}

export function resetNfcPromptDismissal() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(NFC_PROMPT_SESSION_KEY);
}

export function dismissNfcPromptForSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NFC_PROMPT_SESSION_KEY, "true");
}

export function isNfcPromptDismissedForSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(NFC_PROMPT_SESSION_KEY) === "true";
}

export async function getNfcPermissionState() {
  if (!isWebNfcSupported()) return "unsupported";

  if (typeof navigator !== "undefined" && navigator.permissions?.query) {
    try {
      const result = await navigator.permissions.query({ name: "nfc" });
      if (result.state === "granted") {
        markNfcPermissionGranted();
      }
      return result.state;
    } catch {
      return hasSavedNfcPermission() ? "granted" : "prompt";
    }
  }

  return hasSavedNfcPermission() ? "granted" : "prompt";
}

export async function requestNfcPermission() {
  if (!isWebNfcSupported()) {
    const error = new Error("이 기기 또는 브라우저는 Web NFC를 지원하지 않습니다.");
    error.name = "NotSupportedError";
    throw error;
  }

  const reader = new window.NDEFReader();
  const controller = new AbortController();

  try {
    await reader.scan({ signal: controller.signal });
    markNfcPermissionGranted();
    controller.abort();
    return "granted";
  } catch (error) {
    if (error?.name === "AbortError" && hasSavedNfcPermission()) {
      return "granted";
    }
    throw error;
  }
}
