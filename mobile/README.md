# Land In Mobile App

Expo (React Native) 기반 Android/iOS 앱

## 시작하기

### 1. 의존성 설치

```bash
cd mobile
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에서 `EXPO_PUBLIC_API_BASE_URL`을 백엔드 서버 주소로 변경합니다.

> ⚠️ 실기기에서는 `localhost` 대신 PC의 실제 IP 주소를 사용해야 합니다.
> (예: `http://192.168.1.100:8080/api`)

### 3. 개발 서버 실행

```bash
npm start          # Expo Metro 서버 시작
npm run android    # Android 에뮬레이터
npm run ios        # iOS 시뮬레이터 (Mac 전용)
```

> NFC 기능은 **실기기**에서만 동작합니다. 에뮬레이터에서는 NFC 스캔 화면이 표시되지만 실제 태그 읽기는 불가합니다.

## EAS 빌드 (실기기/스토어 배포)

### 초기 설정

```bash
npm install -g eas-cli
eas login
eas build:configure
```

`app.json`의 `extra.eas.projectId`를 본인 EAS 프로젝트 ID로 교체합니다.

### 빌드

```bash
# Android APK (테스트용)
npm run build:android

# 전체 플랫폼
npm run build:all
```

## 폴더 구조

```
mobile/
├── App.js                  # 앱 진입점
├── app.json                # Expo 설정 (NFC 권한 포함)
├── eas.json                # EAS 빌드 설정
├── src/
│   ├── api/                # 백엔드 API 통신 (web과 동일한 로직)
│   │   ├── client.js       # fetch 클라이언트 (SecureStore 토큰 관리)
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── nfc.js
│   │   ├── nfts.js
│   │   ├── rewards.js
│   │   └── collections.js
│   ├── contexts/
│   │   └── AuthContext.js  # 인증 상태 관리
│   ├── navigation/
│   │   └── AppNavigator.js # 탭 + 스택 네비게이션
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── JoinScreen.js
│   │   ├── HomeScreen.js
│   │   ├── EventDetailScreen.js
│   │   ├── TagScreen.js        # NFC 스캔 핵심 화면
│   │   ├── CollectionScreen.js
│   │   ├── RewardsScreen.js
│   │   ├── NftGalleryScreen.js
│   │   └── MyPageScreen.js
│   └── theme.js            # 디자인 토큰 (웹과 동일한 색상 팔레트)
```

## 웹 vs 모바일 차이점

| 항목 | 웹 | 모바일 |
|------|-----|--------|
| 토큰 저장 | `localStorage` | `expo-secure-store` |
| NFC | Web NFC API | `react-native-nfc-manager` |
| 라우팅 | React Router | React Navigation |
| 스타일 | CSS | StyleSheet API |
| MetaMask | `@metamask/connect-evm` | 추후 WalletConnect 연동 |
