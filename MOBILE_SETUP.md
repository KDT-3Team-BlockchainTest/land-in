# Mobile App 설치 & 실행 가이드

## 전제 조건

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (빌드용)
- Android Studio (Android 개발) 또는 Xcode (iOS 개발)

---

## 유저 앱 (`mobile/`)

### 1. 의존성 설치

```bash
cd mobile
npm install
```

### 2. API 서버 주소 설정

`mobile/app.json`의 `extra.apiBaseUrl`을 수정하세요:

```json
"extra": {
  "apiBaseUrl": "http://YOUR_SERVER_IP:8080/api"
}
```

> **Android 에뮬레이터**: `http://10.0.2.2:8080/api` (이미 설정됨)  
> **실제 기기**: 동일 Wi-Fi의 PC IP 사용 (예: `http://192.168.1.100:8080/api`)

### 3. Expo Dev Build 생성 (NFC 사용을 위해 필수)

NFC는 Expo Go 앱에서 지원되지 않습니다. 반드시 Dev Build를 사용해야 합니다.

```bash
# EAS 프로젝트 초기화
eas init

# Android Dev Build
eas build --platform android --profile development

# iOS Dev Build
eas build --platform ios --profile development
```

### 4. 개발 서버 시작

```bash
npx expo start --dev-client
```

> NFC 없이 UI만 테스트하려면 `npx expo start` (Expo Go) 사용 가능

---

## 어드민 앱 (`mobile-admin/`)

### 1. 의존성 설치

```bash
cd mobile-admin
npm install
```

### 2. 실행

```bash
npx expo start
```

어드민 앱은 NFC 미사용이므로 Expo Go에서도 동작합니다.

---

## NFC 설정 세부 사항

### Android
`mobile/app.json`에 이미 설정됨:
```json
"android": {
  "permissions": ["android.permission.NFC"]
}
```

### iOS
`mobile/app.json`에 이미 설정됨:
```json
"infoPlist": {
  "NFCReaderUsageDescription": "...",
  "com.apple.developer.nfc.readersession.formats": ["NDEF"]
}
```
> iOS는 Apple Developer 계정의 App ID에서 NFC entitlement를 수동으로 활성화해야 합니다.

---

## 지갑(MetaMask) 연결 고도화

현재 구현은 MetaMask 딥링크 + 수동 주소 입력 방식입니다.  
완전한 WalletConnect 통합을 원하면 아래 중 하나를 선택하세요:

### 옵션 1: MetaMask SDK (권장)
```bash
npm install @metamask/sdk-react-native
```

### 옵션 2: Reown AppKit (WalletConnect v2)
```bash
npm install @reown/appkit-wagmi-react-native @walletconnect/react-native-compat
```
→ `cloud.reown.com`에서 무료 Project ID 발급 필요

---

## 파일 구조

```
mobile/                          # 유저 앱
├── App.jsx                      # 앱 진입점
├── app.json                     # Expo 설정 (NFC 권한 포함)
├── src/
│   ├── api/                     # REST API 클라이언트 (백엔드 그대로 재사용)
│   ├── contexts/AuthProvider    # JWT 인증 (SecureStore 기반)
│   ├── navigation/
│   │   ├── AppNavigator         # 루트 네비게이터 (인증 상태 분기)
│   │   ├── AuthNavigator        # 로그인 / 회원가입
│   │   └── MainNavigator        # 하단 탭 5개
│   ├── screens/
│   │   ├── auth/LoginScreen     # 로그인
│   │   ├── auth/JoinScreen      # 회원가입
│   │   ├── HomeScreen           # 홈
│   │   ├── CollectionScreen     # 내 컬렉션
│   │   ├── TagScreen            # NFC 방문 인증 ← 핵심
│   │   ├── MyProgressScreen     # 진행 현황
│   │   ├── MyPageScreen         # 마이페이지
│   │   ├── RewardsScreen        # 리워드 (MyPage에서 진입)
│   │   ├── EventDetailScreen    # 이벤트 상세
│   │   ├── NftGalleryScreen     # NFT 갤러리
│   │   └── WalletConnectScreen  # 지갑 연결
│   ├── components/common/       # 공통 UI 컴포넌트 20개
│   ├── utils/
│   │   ├── storage.js           # SecureStore (localStorage 대체)
│   │   └── wallet.js            # MetaMask 딥링크
│   └── theme.js                 # 디자인 토큰 (색상, 간격, 폰트)

mobile-admin/                    # 어드민 앱
├── App.jsx
└── src/
    ├── screens/
    │   ├── LoginScreen          # 관리자 로그인
    │   ├── EventListScreen      # 이벤트 목록 + 삭제
    │   └── EventEditorScreen    # 이벤트 생성 / 편집 (스텝, 리워드 포함)
    └── ...
```

---

## 웹 → 앱 주요 변경 사항

| 웹 | React Native |
|---|---|
| `localStorage` | `expo-secure-store` |
| `window.NDEFReader` | `react-native-nfc-manager` |
| CSS 파일 | `StyleSheet.create()` |
| React Router | React Navigation |
| `@metamask/connect-evm` | MetaMask 딥링크 (+ SDK 선택) |
| `window.addEventListener('focus')` | `AppState.addEventListener('change')` |
| `document.visibilityState` | `AppState` |
