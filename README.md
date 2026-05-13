# Land-In

Land-In은 NFC 태그 인증으로 장소 방문 스텝을 완료하고 NFT/리워드를 발급하는 컬렉션 서비스입니다.

이 저장소는 3개 실행 단위로 구성됩니다.

- `backend`: Spring Boot API 서버
- `frontend`: 사용자 모바일 웹 프론트
- `frontend-admin`: 제휴사/관리자용 이벤트 관리 프론트

## 요구 사항

- Java 21
- Node.js 20 이상 권장
- MySQL
- Git

## 저장소 받기

```bash
git clone https://github.com/KDT-3Team-BlockchainTest/land-in.git
cd land-in
```

## 백엔드 실행

백엔드는 기본적으로 `local` 프로필로 실행되며 `http://localhost:8080`을 사용합니다.

기본 DB 설정은 `backend/src/main/resources/application-local.yml` 기준입니다.

```yaml
spring.datasource.url: jdbc:mysql://localhost:3306/landin_db?createDatabaseIfNotExist=true...
spring.datasource.username: root
spring.datasource.password: 1234
```

로컬 MySQL 계정이 다르면 환경변수로 덮어씁니다.

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/landin_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="1234"
```

실행:

```powershell
cd backend
.\gradlew.bat bootRun
```

검증:

```powershell
.\gradlew.bat test
```

업로드된 이미지는 기본적으로 `backend/uploads`에 저장되고 `/uploads/**` 경로로 제공됩니다. 외부에서 접근 가능한 URL을 바꾸려면 `APP_PUBLIC_BASE_URL`을 설정합니다.

```powershell
$env:APP_PUBLIC_BASE_URL="http://localhost:8080"
```

## 사용자 프론트 실행

사용자 프론트는 Vite 개발 서버를 사용합니다. 기본 포트는 `5173`입니다.

```powershell
cd frontend
npm install
npm run dev
```

접속:

```text
http://localhost:5173
```

개발 서버는 `/api` 요청을 `http://localhost:8080` 백엔드로 프록시합니다.

빌드/검사:

```powershell
npm run lint
npm run build
```

배포 환경에서 API 주소가 다르면 `VITE_API_BASE_URL`을 설정합니다.

```powershell
$env:VITE_API_BASE_URL="https://your-api.example.com/api"
```

## 관리자 프론트 실행

관리자 프론트는 이벤트, 스텝, NFC 태그 UID, NFT 이미지, 리워드 템플릿을 등록/수정하는 콘솔입니다. 기본 포트는 `5174`입니다.

```powershell
cd frontend-admin
npm install
npm run dev
```

접속:

```text
http://localhost:5174
```

개발 서버는 `/api` 요청을 `http://localhost:8080` 백엔드로 프록시합니다.

빌드:

```powershell
npm run build
```

## 기본 관리자 계정

백엔드는 `admins` 테이블이 비어 있으면 시작 시 기본 관리자 계정을 1개 생성합니다.

```text
email: admin@landin.local
password: admin1234!
```

운영/공유 환경에서는 아래 환경변수로 초기 계정을 바꿔 실행하세요.

```powershell
$env:APP_ADMIN_BOOTSTRAP_EMAIL="admin@example.com"
$env:APP_ADMIN_BOOTSTRAP_PASSWORD="change-me"
$env:APP_ADMIN_BOOTSTRAP_PARTNER_NAME="Partner Name"
$env:APP_ADMIN_BOOTSTRAP_DISPLAY_NAME="Admin"
```

## 이미지 필드 사용 기준

관리자 콘솔에서 등록하는 이미지가 사용자 화면에 표시되는 위치는 다음과 같습니다.

- 이벤트 기본 정보 `대표 이미지`: 홈 이벤트 카드, 이벤트 상세 히어로, 컬렉션 목록 카드 이미지
- 스텝 `장소 이미지 URL`: 이벤트 상세의 방문 루트 장소 이미지
- 스텝 `NFT 이미지 URL`: NFC 인증 후 발급되는 NFT 이미지, 컬렉션 NFT 카드 이미지

스텝을 저장하려면 장소 이미지와 NFT 이미지가 각각 필요합니다.

## 주요 API 흐름

- 사용자 인증: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- 이벤트 조회/참여: `/api/events`, `/api/events/{eventId}`, `/api/events/{eventId}/join`
- NFC 인증: `/api/nfc/verify`
- NFT 조회/메타데이터: `/api/nfts`, `/api/nfts/{nftId}`, `/api/nfts/{nftId}/metadata`
- 리워드 조회: `/api/rewards`
- 관리자 인증: `/api/admin/auth/login`, `/api/admin/auth/me`
- 관리자 이벤트 관리: `/api/admin/events`
- 관리자 이미지 업로드: `/api/admin/uploads/images`

## 블록체인 설정

기본값은 온체인 민팅 비활성화입니다.

```yaml
BLOCKCHAIN_ENABLED=false
```

온체인 민팅을 켜려면 관련 환경변수를 설정합니다.

```powershell
$env:BLOCKCHAIN_ENABLED="true"
$env:BLOCKCHAIN_RPC_URL="https://rpc.hoodi.ethpandaops.io"
$env:BLOCKCHAIN_CHAIN_ID="560048"
$env:BLOCKCHAIN_CONTRACT_ADDRESS="0x..."
$env:BLOCKCHAIN_MINTER_PRIVATE_KEY="..."
```

## 자주 쓰는 명령

백엔드:

```powershell
cd backend
.\gradlew.bat test
.\gradlew.bat bootRun
```

사용자 프론트:

```powershell
cd frontend
npm run lint
npm run build
npm run dev
```

관리자 프론트:

```powershell
cd frontend-admin
npm run build
npm run dev
```
