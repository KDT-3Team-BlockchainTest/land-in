# Land In

NFC 태그로 랜드마크를 수집하고 NFT를 받는 여행 스탬프 플랫폼입니다.

```
land_in_test/
├── backend/          # Spring Boot API 서버
├── frontend/         # React 웹 앱 (사용자)
├── frontend-admin/   # React 웹 앱 (관리자)
└── mobile/           # Expo React Native 앱 (Android/iOS)
```

---

## 사전 준비

| 항목 | 버전 | 확인 방법 |
|------|------|-----------|
| Java | 21 | `java -version` |
| Node.js | 18 이상 | `node -v` |
| MySQL | 8.0 | `mysql --version` |
| Expo Go | 최신 | Android / iOS 스토어 |

---

## 1. Backend (Spring Boot)

### 환경 설정

`backend/src/main/resources/application-local.yml` 에서 DB 정보를 확인합니다.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/landin_db
    username: root
    password: root
```

MySQL에 DB를 먼저 생성합니다.

```sql
CREATE DATABASE landin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 실행

```bash
cd backend
./gradlew bootRun
```

Windows에서는:

```bash
cd backend
gradlew.bat bootRun
```

서버가 뜨면 → `http://localhost:8080`

> 테이블은 `ddl-auto: update` 설정으로 자동 생성됩니다.

---

## 2. Frontend — 사용자 웹

### 환경 설정

```bash
cd frontend
cp .env.example .env
```

`.env` 기본값은 `/api` (백엔드 프록시)이므로 별도 수정 없이 실행됩니다.

### 실행

```bash
cd frontend
npm install
npm run dev
```

→ `http://localhost:5173`

### 빌드 (배포용)

```bash
npm run build
```

---

## 3. Frontend Admin — 관리자 웹

```bash
cd frontend-admin
npm install
npm run dev
```

→ `http://localhost:5174`

---

## 4. Mobile (Expo / React Native)

### 환경 설정

```bash
cd mobile
npm install
cp .env.example .env
```

#### 폰과 PC가 같은 Wi-Fi인 경우

PC IP 주소 확인 후 `.env` 수정:

```
# Windows: ipconfig / Mac: ifconfig
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080/api
```

Windows 방화벽 허용 (관리자 권한 터미널):

```powershell
netsh advfirewall firewall add rule name="Backend 8080" dir=in action=allow protocol=TCP localport=8080
```

#### 폰과 PC 네트워크가 다른 경우 (localtunnel)

터미널을 하나 더 열어서 백엔드 터널 실행:

```bash
npx localtunnel --port 8080
# 출력된 URL 복사: your url is: https://xxxx.loca.lt
```

`.env` 수정:

```
EXPO_PUBLIC_API_BASE_URL=https://xxxx.loca.lt/api
```

> ⚠️ localtunnel은 재시작하면 URL이 바뀝니다.

### 개발 서버 실행

```bash
# 같은 Wi-Fi
npx expo start --clear

# 네트워크가 다를 때
npx expo start --clear --tunnel
```

QR 코드를 **Expo Go** 앱으로 스캔합니다.

### 빌드 (실기기 APK)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### 빌드 (스토어 출시)

```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## 전체 동시 실행 순서

```
1. MySQL 실행
2. backend    → ./gradlew bootRun
3. frontend   → npm run dev          (http://localhost:5173)
4. frontend-admin → npm run dev      (http://localhost:5174)
5. mobile     → npx expo start --clear [--tunnel]
```

---

## 주요 API 엔드포인트

| 경로 | 설명 |
|------|------|
| `POST /api/auth/signup` | 회원가입 |
| `POST /api/auth/login` | 로그인 |
| `GET  /api/events` | 이벤트 목록 |
| `POST /api/nfc/verify` | NFC 태그 인증 → NFT 발행 |
| `GET  /api/collections` | 내 컬렉션 |
| `GET  /api/rewards` | 리워드 목록 |
| `GET  /api/dashboard/stats` | 여행 통계 |

---

## 자주 발생하는 문제

### 백엔드가 안 뜰 때
- MySQL이 실행 중인지 확인: `landin_db` DB가 존재해야 합니다.
- Java 21인지 확인: `java -version`

### 모바일에서 Network Error
- `.env`의 IP 주소가 현재 PC IP와 맞는지 확인
- 같은 Wi-Fi 연결 후 방화벽 8080 허용, 또는 localtunnel 사용

### Expo QR 스캔 후 연결 실패
```bash
npx expo start --clear --tunnel
```

### NFC가 작동하지 않음
- Expo Go에서는 NFC 미지원 → EAS 빌드로 APK 설치 필요
