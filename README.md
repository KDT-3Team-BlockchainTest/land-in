# Land-in 🗺️

랜드마크 NFC 태그로 방문을 인증하고, NFT를 수집하며, 컬렉션을 완성하면 리워드를 받는 여행 플랫폼입니다.

---

## 프로젝트 구조

```
land-in/
├── frontend/          # 유저 웹앱 (React + Vite)
├── mobile/            # 유저 모바일 앱 (React Native + Expo)
├── mobile-admin/      # 파트너 어드민 앱 (React Native + Expo)
├── backend/           # API 서버 (Spring Boot)
└── MOBILE_SETUP.md    # 모바일 앱 설치 가이드
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 웹 프론트엔드 | React 19, Vite, React Router v7 |
| 모바일 앱 | React Native 0.76, Expo SDK 53 |
| 모바일 네비게이션 | React Navigation v7 |
| NFC (웹) | Web NFC API (Android Chrome) |
| NFC (앱) | react-native-nfc-manager (Android + iOS) |
| 인증 (웹) | JWT + localStorage |
| 인증 (앱) | JWT + expo-secure-store |
| 지갑 연동 | MetaMask (EVM), Hoodi Testnet |
| 백엔드 | Spring Boot 3, Spring Security, JPA |
| DB | MySQL |
| 블록체인 | Web3j, Ethereum Hoodi Testnet |

---

## 시작하기

### 백엔드

```bash
cd backend
./gradlew bootRun
# 기본 포트: 8080
```

> `backend/src/main/resources/application.yml` 에서 DB 설정 필요

### 웹 프론트엔드

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### 모바일 앱 (유저)

**방법 1 — Expo Go (빠른 테스트, NFC 제외)**

```bash
cd mobile
npm install
npx expo start
```

터미널에 QR 코드가 뜨면 폰에서 **Expo Go** 앱으로 스캔하면 바로 실행돼요.
- Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

**방법 2 — Dev Build (NFC 포함 전체 기능)**

```bash
# EAS CLI 설치 (최초 1회)
npm install -g eas-cli
eas login        # expo.dev 계정 필요

# Dev Build 생성 (클라우드 빌드, 10~15분 소요)
cd mobile
eas init
eas build --platform android --profile development

# 빌드된 .apk 폰에 설치 후 실행
npx expo start --dev-client
```

**⚠️ API 서버 주소 설정 (실제 기기 사용 시)**

`mobile/app.json` 의 `apiBaseUrl` 을 PC의 로컬 IP로 변경하세요.

```json
"extra": {
  "apiBaseUrl": "http://192.168.x.x:8080/api"
}
```

PC IP 확인 방법 (Windows):
```bash
ipconfig
# IPv4 주소 (192.168.x.x) 사용
```

| 환경 | 주소 |
|------|------|
| Android 에뮬레이터 | `http://10.0.2.2:8080/api` (기본값) |
| 실제 안드로이드 폰 | `http://192.168.x.x:8080/api` |
| iOS 시뮬레이터 | `http://localhost:8080/api` |

### 모바일 어드민

```bash
cd mobile-admin
npm install
npx expo start
# NFC 없음 → Expo Go로 바로 실행 가능
```

---

## 주요 기능

### 유저 앱 / 웹
- 📱 **NFC 방문 인증** — 랜드마크 NFC 태그를 스캔해 방문 기록
- 🖼 **NFT 발행** — 인증 즉시 온체인 NFT 발행 (Hoodi Testnet)
- 🗂 **컬렉션** — 이벤트별 NFT 수집 현황 관리
- 🎁 **리워드** — 컬렉션 완성 시 파트너 쿠폰/혜택 지급
- 💳 **지갑 연결** — MetaMask 연동으로 온체인 NFT 소유

### 어드민 (파트너)
- 이벤트 생성 및 관리
- 방문 루트 스텝 설정 (NFC Tag UID, NFT 메타데이터)
- 리워드 등록 및 쿠폰 관리

---

## 환경 변수

### 웹 프론트엔드 (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 모바일 앱 (`mobile/app.json`)
```json
"extra": {
  "apiBaseUrl": "http://10.0.2.2:8080/api"
}
```
> Android 에뮬레이터: `10.0.2.2` / 실제 기기: PC의 로컬 IP

---

## NFC 지원 현황

| 환경 | NFC 읽기 | NFC 쓰기 |
|------|---------|---------|
| Android Chrome (웹) | ✅ | ✅ |
| iOS Safari (웹) | ❌ | ❌ |
| Android 앱 (Expo) | ✅ | ✅ |
| iOS 앱 (Expo) | ✅ (iOS 13+) | ❌ |

---

## 브랜치

| 브랜치 | 설명 |
|--------|------|
| `main` | 프로덕션 |
| `land_in_expo` | React Native 모바일 앱 개발 |
| `lsg` | 기능 개발 |
