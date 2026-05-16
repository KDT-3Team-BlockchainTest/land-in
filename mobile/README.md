# Land In — Mobile App

Expo (React Native) 기반 Android/iOS 앱입니다.  
NFC 태그를 스캔하여 랜드마크를 수집하고 NFT를 받는 여행 스탬프 앱입니다.

---

## 사전 준비

| 항목 | 버전 | 확인 방법 |
|------|------|-----------|
| Node.js | 18 이상 | `node -v` |
| npm | 9 이상 | `npm -v` |
| Expo Go 앱 | 최신 | Android / iOS 스토어에서 설치 |
| 백엔드 서버 | 실행 중이어야 함 | `http://localhost:8080` |

> **NFC 기능**은 실기기 전용입니다. Expo Go에서는 NFC 스캔 화면은 보이지만 실제 태그 읽기는 불가합니다.

---

## 1단계 — 의존성 설치

```bash
cd mobile
npm install
```

---

## 2단계 — 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 백엔드 주소를 설정합니다.

### 상황별 설정 방법

#### 방법 A — 폰과 PC가 같은 Wi-Fi에 연결된 경우 (권장)

1. PC의 IP 주소 확인
   - Windows: `ipconfig` → "IPv4 주소" (예: `192.168.1.33`)
   - Mac/Linux: `ifconfig` 또는 `ip addr`

2. `.env` 수정
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.33:8080/api
   ```

3. Windows 방화벽 8080 포트 허용 (관리자 권한 터미널)
   ```powershell
   netsh advfirewall firewall add rule name="Backend 8080" dir=in action=allow protocol=TCP localport=8080
   ```

#### 방법 B — 네트워크가 달라서 직접 연결이 안 될 경우 (localtunnel 사용)

1. 터미널을 **하나 더 열어서** 아래 명령 실행 (백엔드 서버 켜둔 상태에서)
   ```bash
   npx localtunnel --port 8080
   ```
   출력 예시: `your url is: https://xxxx.loca.lt`

2. `.env` 수정
   ```
   EXPO_PUBLIC_API_BASE_URL=https://xxxx.loca.lt/api
   ```

> ⚠️ localtunnel은 터미널을 닫으면 URL이 바뀝니다. 닫혔다면 다시 실행 후 `.env`를 새 URL로 업데이트하세요.

---

## 3단계 — 개발 서버 실행

### 기본 (폰과 PC가 같은 Wi-Fi)
```bash
npx expo start --clear
```

### 폰과 PC가 다른 네트워크일 때
```bash
npx expo start --clear --tunnel
```

터미널에 QR 코드가 표시되면, **Expo Go 앱**으로 스캔합니다.

---

## 4단계 — 앱 접속

1. 폰에서 **Expo Go** 앱 실행
2. QR 코드 스캔
3. 로그인 또는 회원가입

---

## 폴더 구조

```
mobile/
├── index.js                    # 앱 진입점 (registerRootComponent)
├── App.jsx                     # 루트 컴포넌트
├── app.json                    # Expo 설정 (NFC 권한 포함)
├── eas.json                    # EAS 빌드 설정
├── .env                        # 환경 변수 (직접 생성, git 제외)
├── .env.example                # 환경 변수 예시
└── src/
    ├── api/                    # 백엔드 API 통신
    │   ├── client.js           # Axios 클라이언트 (토큰 자동 주입)
    │   ├── adapters.js         # 서버 응답 → 화면 데이터 변환
    │   ├── auth.js
    │   ├── events.js
    │   ├── collections.js
    │   ├── nfts.js
    │   ├── rewards.js
    │   ├── nfc.js
    │   ├── dashboard.js
    │   └── wallet.js
    ├── auth/                   # 인증 상태 관리
    │   ├── AuthContext.js
    │   ├── AuthProvider.jsx    # Context Provider
    │   ├── useAuth.js
    │   └── storage.js          # expo-secure-store 토큰 저장
    ├── navigation/
    │   ├── AppNavigator.jsx    # 인증 여부에 따라 화면 분기
    │   ├── AuthNavigator.jsx   # 로그인/회원가입 스택
    │   └── MainNavigator.jsx   # 바텀 탭 네비게이터
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.jsx
    │   │   └── JoinScreen.jsx
    │   ├── HomeScreen.jsx
    │   ├── EventDetailScreen.jsx
    │   ├── CollectionScreen.jsx
    │   ├── TagScreen.jsx           # NFC 스캔 핵심 화면
    │   ├── RewardsScreen.jsx
    │   ├── MyPageScreen.jsx
    │   ├── MyProgressScreen.jsx
    │   ├── NftGalleryScreen.jsx
    │   └── WalletConnectScreen.jsx
    ├── components/
    │   ├── common/             # 공통 컴포넌트
    │   └── home/               # 홈 전용 카드 컴포넌트
    └── theme.js                # 색상, 타이포그래피, 그림자
```

---

## 웹 vs 모바일 비교

| 항목 | 웹 (frontend) | 모바일 |
|------|--------------|--------|
| 토큰 저장 | `localStorage` | `expo-secure-store` |
| NFC | Web NFC API | `react-native-nfc-manager` |
| 라우팅 | React Router | React Navigation |
| 스타일 | CSS | StyleSheet API |
| API 엔드포인트 | 동일 | 동일 |
| 어댑터 로직 | 동일 | 동일 |

---

## EAS 빌드 (실기기/스토어 배포)

개발 빌드(APK)를 실기기에 직접 설치하면 NFC를 포함한 모든 기능을 사용할 수 있습니다.

```bash
# EAS CLI 설치
npm install -g eas-cli

# 로그인 (Expo 계정 필요)
eas login

# Android APK 빌드
eas build --platform android --profile preview
```

`app.json`의 `extra.eas.projectId`를 본인 EAS 프로젝트 ID로 교체해야 합니다.

---

## 자주 발생하는 문제

### "main has not been registered" 오류
`package.json`의 `main` 필드가 `index.js`인지 확인하세요.
```json
{ "main": "index.js" }
```

### Network Error (회원가입/로그인 실패)
폰이 백엔드 서버에 접근하지 못하는 경우입니다.
→ **2단계**의 방법 B(localtunnel)를 사용하세요.

### QR 코드 스캔 후 "Could not connect to development server"
폰과 PC가 다른 네트워크에 있는 경우입니다.
```bash
npx expo start --clear --tunnel
```

### NFC가 작동하지 않음
NFC는 Expo Go에서 지원되지 않습니다. EAS 빌드로 APK를 설치해야 합니다.
