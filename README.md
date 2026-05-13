# Land-In

Land-In은 NFC 태그 인증으로 장소 방문 스텝을 완료하고 NFT/리워드를 발급하는 컬렉션 서비스입니다.

이 저장소는 3개 실행 단위로 구성됩니다.

- `backend`: Spring Boot API 서버
- `frontend`: 사용자 모바일 웹 프론트
- `frontend-admin`: 제휴사/관리자용 이벤트 관리 프론트

## 빠른 실행

새 컴퓨터에서 가장 간단한 실행 방법은 PowerShell 스크립트 1개를 실행하는 것입니다.

```powershell
git clone https://github.com/KDT-3Team-BlockchainTest/land-in.git
cd land-in
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

스크립트가 하는 일:

- `frontend`, `frontend-admin` 의존성 설치
- Docker가 있고 로컬 MySQL이 없으면 `land-in-mysql` MySQL 컨테이너 자동 실행
- 백엔드 실행
- 사용자 프론트 실행
- 관리자 프론트 실행
- 실행 로그를 `.landin-runtime/logs`에 저장

실행 후 접속 주소:

```text
백엔드 API:     http://localhost:8080
사용자 프론트:  http://localhost:5173
관리자 프론트:  http://localhost:5174
```

기본 관리자 계정:

```text
email: admin@landin.local
password: admin1234!
```

## 빠른 실행 전 준비

필수:

- Git
- Java 21
- Node.js 20 이상

권장:

- Docker Desktop

Docker가 있으면 스크립트가 MySQL 8.4 컨테이너를 자동으로 띄웁니다. Docker가 없다면 로컬 MySQL을 직접 실행해야 합니다.

기본 MySQL 설정:

```text
host: localhost
port: 3306
database: landin_db
username: root
password: 1234
```

로컬 MySQL 설정이 다르면 스크립트 실행 전에 환경변수를 지정합니다.

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/landin_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="1234"
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

이미 `node_modules`가 설치되어 있어 설치를 건너뛰고 싶으면:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1 -SkipInstall
```

Docker MySQL 자동 실행을 끄고 싶으면:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1 -NoDockerMySql
```

포트를 바꾸고 싶으면:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1 -BackendPort 8080 -FrontendPort 5173 -AdminPort 5174 -MysqlPort 3306
```

## 수동 실행

스크립트 대신 직접 실행할 수도 있습니다.

### 백엔드

```powershell
cd backend
.\gradlew.bat bootRun
```

백엔드는 기본적으로 `local` 프로필로 실행되며 `http://localhost:8080`을 사용합니다.

테스트:

```powershell
cd backend
.\gradlew.bat test
```

### 사용자 프론트

```powershell
cd frontend
npm install
npm run dev
```

접속:

```text
http://localhost:5173
```

검사/빌드:

```powershell
cd frontend
npm run lint
npm run build
```

### 관리자 프론트

```powershell
cd frontend-admin
npm install
npm run dev
```

접속:

```text
http://localhost:5174
```

빌드:

```powershell
cd frontend-admin
npm run build
```

## 이미지 저장과 새 환경 주의사항

관리자 콘솔에서 업로드한 이미지는 기본적으로 백엔드 로컬 디렉터리 `backend/uploads`에 저장됩니다. 이 폴더는 Git에 포함되지 않습니다.

따라서 다른 컴퓨터에서 새로 clone하면:

- 소스 코드는 그대로 받을 수 있습니다.
- DB 데이터는 새로 생성됩니다.
- 업로드 이미지는 포함되지 않습니다.
- 관리자 기본 계정으로 로그인한 뒤 이벤트, 스텝, 이미지, NFT, 리워드를 다시 등록해야 합니다.

외부 접근 가능한 이미지 URL을 만들려면 백엔드 실행 시 `APP_PUBLIC_BASE_URL`을 설정합니다.

```powershell
$env:APP_PUBLIC_BASE_URL="http://localhost:8080"
```

## 이미지 필드 사용 기준

관리자 콘솔에서 등록하는 이미지가 사용자 화면에 표시되는 위치는 다음과 같습니다.

- 이벤트 기본 정보 `대표 이미지`: 홈 이벤트 카드, 이벤트 상세 히어로, 컬렉션 목록 카드 이미지
- 스텝 `장소 이미지 URL`: 이벤트 상세의 방문 루트 장소 이미지
- 스텝 `NFT 이미지 URL`: NFC 인증 후 발급되는 NFT 이미지, 컬렉션 NFT 카드 이미지

스텝을 저장하려면 장소 이미지와 NFT 이미지가 각각 필요합니다.

## 주요 API

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

```text
BLOCKCHAIN_ENABLED=false
```

온체인 민팅을 켜려면 백엔드 실행 환경에 관련 환경변수를 설정합니다.

```powershell
$env:BLOCKCHAIN_ENABLED="true"
$env:BLOCKCHAIN_RPC_URL="https://rpc.hoodi.ethpandaops.io"
$env:BLOCKCHAIN_CHAIN_ID="560048"
$env:BLOCKCHAIN_CONTRACT_ADDRESS="0x..."
$env:BLOCKCHAIN_MINTER_PRIVATE_KEY="..."
```

## 커밋 전 검증 명령

```powershell
cd backend
.\gradlew.bat test

cd ..\frontend
npm run lint
npm run build

cd ..\frontend-admin
npm run build
```

