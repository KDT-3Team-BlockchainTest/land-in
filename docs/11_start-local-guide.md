# Land-In 로컬 통합 실행 가이드

이 문서는 `scripts/start-local.ps1`로 사용자 프론트, 관리자 프론트, 백엔드를 한 번에 실행하는 방법을 정리합니다.

## 실행 대상

스크립트는 다음 서비스를 실행합니다.

| 서비스 | 디렉터리 | 기본 주소 |
| --- | --- | --- |
| 백엔드 API | `backend` | `http://localhost:8080` |
| 사용자 프론트 | `frontend` | `http://localhost:5173` |
| 관리자 프론트 | `frontend-admin` | `http://localhost:5174` |
| 모바일 앱 | `mobile` | Expo Go QR 접속 |
| MySQL | Docker 또는 로컬 MySQL | `localhost:3306` |

관리자 기본 계정은 다음과 같습니다.

```text
email: admin@landin.local
password: admin1234!
```

## 사전 준비

필수 설치 항목:

- Git
- Java 21
- Node.js 20 이상
- npm
- PowerShell

권장 설치 항목:

- Docker Desktop 또는 Docker Engine
- 휴대폰 Expo Go 앱

Docker가 설치되어 있고 `3306` 포트에 실행 중인 MySQL이 없으면, 스크립트가 `land-in-mysql` Docker 컨테이너를 자동으로 생성하거나 시작합니다.

Docker를 사용하지 않는 경우 로컬 MySQL을 직접 실행해 두어야 합니다.

```text
host: localhost
port: 3306
database: landin_db
username: root
password: 1234
```

## 실행 방법

프로젝트 루트에서 실행합니다.

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

Windows에서 이미 PowerShell 안에 있다면 다음처럼 실행해도 됩니다.

```powershell
.\scripts\start-local.ps1
```

Ubuntu 또는 Linux:

```bash
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1
```

Ubuntu에 PowerShell이 없다면 먼저 설치합니다.

```bash
sudo snap install powershell --classic
```

## 실행 후 접속

스크립트 실행이 끝나면 아래 주소로 접속합니다.

```text
백엔드 API:      http://localhost:8080
사용자 프론트:   http://localhost:5173
관리자 프론트:   http://localhost:5174
```

스크립트는 백엔드 준비 상태를 `http://127.0.0.1:8080/api/events`로 확인하고, 프론트 준비 상태를 각 프론트 루트 경로로 확인합니다.

## 휴대폰 QR로 모바일 앱 실행

모바일 앱은 `scripts/start-local.ps1`가 자동으로 실행하지 않습니다. 백엔드가 켜진 상태에서 `mobile` 폴더로 이동해 Expo 개발 서버를 실행합니다.

```bash
cd mobile
npm install
```

휴대폰에서 백엔드 API에 접근하려면 `.env`를 먼저 준비합니다.

```bash
cp .env.example .env
```

폰과 PC가 같은 Wi-Fi에 있으면 PC의 내부 IP를 확인한 뒤 `.env`를 수정합니다.

```text
EXPO_PUBLIC_API_BASE_URL=http://<PC-IP>:8080/api
```

예시:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.33:8080/api
```

주의할 점:

- 휴대폰에서 `localhost:8080`은 PC가 아니라 휴대폰 자신을 의미합니다.
- 그래서 실제 휴대폰으로 테스트할 때는 `http://<PC-IP>:8080/api`처럼 PC IP를 넣어야 합니다.
- Windows에서는 방화벽이 백엔드 `8080` 포트를 막을 수 있습니다.

Windows 방화벽에서 8080 포트를 허용해야 하면 관리자 권한 PowerShell에서 실행합니다.

```powershell
netsh advfirewall firewall add rule name="Backend 8080" dir=in action=allow protocol=TCP localport=8080
```

QR 코드를 생성하려면 `mobile` 폴더에서 Expo를 실행합니다.

같은 Wi-Fi에서 실행:

```bash
npx expo start --clear
```

네트워크 연결이 잘 안 되거나 폰과 PC가 다른 네트워크라면 tunnel로 실행합니다.

```bash
npx expo start --clear --tunnel
```

이 프로젝트의 `mobile/package.json`에는 tunnel 실행용 스크립트도 있습니다.

```bash
npm start
```

`npm start`는 내부적으로 다음 명령을 실행합니다.

```bash
expo start --tunnel --go
```

터미널에 QR 코드가 표시되면 휴대폰의 Expo Go 앱으로 스캔합니다.

NFC 기능 주의:

- Expo Go에서는 화면 확인과 일반 API 흐름 테스트는 가능합니다.
- 실제 NFC 태그 읽기는 Expo Go에서 동작하지 않을 수 있습니다.
- NFC까지 테스트하려면 EAS 개발 빌드 또는 APK 빌드가 필요합니다.

## 스크립트가 하는 일

`scripts/start-local.ps1`는 다음 작업을 순서대로 수행합니다.

1. 실행 로그 디렉터리 `.landin-runtime/logs`를 생성합니다.
2. Java, Node.js, npm 설치 여부를 확인합니다.
3. `frontend` 의존성을 `npm install`로 설치합니다.
4. `frontend-admin` 의존성을 `npm install`로 설치합니다.
5. Docker가 있고 MySQL 포트가 비어 있으면 `land-in-mysql` 컨테이너를 실행합니다.
6. 백엔드를 `backend` 디렉터리에서 `gradlew bootRun`으로 실행합니다.
7. 사용자 프론트를 `frontend` 디렉터리에서 Vite dev server로 실행합니다.
8. 관리자 프론트를 `frontend-admin` 디렉터리에서 Vite dev server로 실행합니다.
9. 각 서비스 준비 상태와 접속 주소를 출력합니다.

## 자주 쓰는 옵션

의존성 설치를 건너뛰기:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1 -SkipInstall
```

Linux:

```bash
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1 -SkipInstall
```

Docker MySQL 자동 실행 끄기:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1 -NoDockerMySql
```

Linux:

```bash
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1 -NoDockerMySql
```

포트 변경:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1 -BackendPort 8081 -FrontendPort 5175 -AdminPort 5176 -MysqlPort 3307
```

Linux:

```bash
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1 -BackendPort 8081 -FrontendPort 5175 -AdminPort 5176 -MysqlPort 3307
```

## 환경변수 변경

기본값과 다른 MySQL 계정을 사용한다면 스크립트 실행 전에 환경변수를 설정합니다.

Windows PowerShell:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/landin_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="1234"
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

Ubuntu 또는 Linux:

```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/landin_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="1234"
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1
```

업로드 이미지 URL 기준 주소를 바꾸려면 `APP_PUBLIC_BASE_URL`을 설정합니다.

Windows PowerShell:

```powershell
$env:APP_PUBLIC_BASE_URL="http://localhost:8080"
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

Ubuntu 또는 Linux:

```bash
export APP_PUBLIC_BASE_URL="http://localhost:8080"
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1
```

## 구글/카카오 간편 로그인 설정

구글과 카카오 간편 로그인은 OAuth 앱을 먼저 만든 뒤 백엔드 실행 환경변수로 client id와 secret을 넣어야 합니다.

로컬 백엔드 콜백 주소:

```text
Google: http://localhost:8080/api/auth/oauth/google/callback
Kakao:  http://localhost:8080/api/auth/oauth/kakao/callback
```

Windows PowerShell:

```powershell
$env:GOOGLE_OAUTH_CLIENT_ID="구글 클라이언트 ID"
$env:GOOGLE_OAUTH_CLIENT_SECRET="구글 클라이언트 시크릿"
$env:KAKAO_OAUTH_CLIENT_ID="카카오 REST API 키"
$env:KAKAO_OAUTH_CLIENT_SECRET="카카오 클라이언트 시크릿"
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

Ubuntu 또는 Linux:

```bash
export GOOGLE_OAUTH_CLIENT_ID="구글 클라이언트 ID"
export GOOGLE_OAUTH_CLIENT_SECRET="구글 클라이언트 시크릿"
export KAKAO_OAUTH_CLIENT_ID="카카오 REST API 키"
export KAKAO_OAUTH_CLIENT_SECRET="카카오 클라이언트 시크릿"
pwsh -ExecutionPolicy Bypass -File ./scripts/start-local.ps1
```

카카오에서 클라이언트 시크릿을 사용하지 않도록 설정했다면 `KAKAO_OAUTH_CLIENT_SECRET`은 비워둘 수 있습니다.

## 로그 확인

실행 로그는 아래 위치에 저장됩니다.

```text
.landin-runtime/logs
```

주요 로그 파일:

```text
.landin-runtime/logs/backend.out.log
.landin-runtime/logs/backend.err.log
.landin-runtime/logs/frontend.out.log
.landin-runtime/logs/frontend.err.log
.landin-runtime/logs/frontend-admin.out.log
.landin-runtime/logs/frontend-admin.err.log
```

Linux에서 로그를 실시간으로 확인하려면 다음 명령을 사용할 수 있습니다.

```bash
tail -f .landin-runtime/logs/backend.out.log
tail -f .landin-runtime/logs/frontend.out.log
tail -f .landin-runtime/logs/frontend-admin.out.log
```

Windows PowerShell:

```powershell
Get-Content .\.landin-runtime\logs\backend.out.log -Wait
Get-Content .\.landin-runtime\logs\frontend.out.log -Wait
Get-Content .\.landin-runtime\logs\frontend-admin.out.log -Wait
```

## 종료 방법

스크립트는 실행한 프로세스의 PID를 `.landin-runtime` 디렉터리에 저장합니다.

```text
.landin-runtime/backend.pid
.landin-runtime/frontend.pid
.landin-runtime/frontend-admin.pid
```

Windows PowerShell:

```powershell
Stop-Process -Id (Get-Content .\.landin-runtime\backend.pid)
Stop-Process -Id (Get-Content .\.landin-runtime\frontend.pid)
Stop-Process -Id (Get-Content .\.landin-runtime\frontend-admin.pid)
```

Ubuntu 또는 Linux:

```bash
kill $(cat .landin-runtime/backend.pid)
kill $(cat .landin-runtime/frontend.pid)
kill $(cat .landin-runtime/frontend-admin.pid)
```

Docker MySQL까지 종료하려면 다음 명령을 사용합니다.

```bash
docker stop land-in-mysql
```

Windows PowerShell에서도 같은 Docker 명령을 사용할 수 있습니다.

## 문제 해결

`java is required` 오류:

- Java 21을 설치하고 `java` 명령이 PATH에 잡혀 있는지 확인합니다.
- Windows에서는 `JAVA_HOME` 설정이 필요할 수 있습니다.

`node is required` 또는 `npm is required` 오류:

- Node.js 20 이상을 설치합니다.
- 설치 후 터미널을 새로 열고 다시 실행합니다.

MySQL 연결 실패:

- Docker가 실행 중인지 확인합니다.
- Docker를 쓰지 않는다면 로컬 MySQL이 `localhost:3306`에서 실행 중인지 확인합니다.
- DB 이름, 계정, 비밀번호가 기본값과 다르면 `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`를 설정한 뒤 다시 실행합니다.

포트가 이미 사용 중이라는 메시지:

- 해당 포트에 이미 실행 중인 서비스가 있으면 스크립트가 같은 서비스를 새로 실행하지 않습니다.
- 기존 프로세스를 종료하거나 `-BackendPort`, `-FrontendPort`, `-AdminPort`, `-MysqlPort` 옵션으로 포트를 변경합니다.

프론트는 열리지만 API 호출이 실패하는 경우:

- 백엔드가 `http://localhost:8080`에서 실행 중인지 확인합니다.
- `.landin-runtime/logs/backend.err.log`와 `.landin-runtime/logs/backend.out.log`를 확인합니다.
