# 🌍 Land-in Backend

> 여행 NFT 리워드 플랫폼 **Land-in**의 Spring Boot 백엔드 서버

---

## 📌 프로젝트 소개

**Land-in**은 실제 랜드마크를 방문하고 NFC 태그를 인식하면 NFT를 발급받고, 리워드를 수집하는 여행 플랫폼입니다.  
사용자는 일반 계정으로 로그인하고, MetaMask 지갑을 연동하여 블록체인 기반 NFT를 민팅할 수 있습니다.

---

## 🛠 기술 스택

| 분류 | 기술 |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.5.13 |
| Build Tool | Gradle |
| Database | MySQL 8.0 |
| ORM | Spring Data JPA / Hibernate |
| 인증 | JWT (jjwt 0.12.6) |
| 블록체인 | Web3j 4.12.2 |
| 보안 | Spring Security |

---

## 📁 프로젝트 구조

```
src/main/java/com/landin/backend/
├── auth/               # JWT 인증 (로그인, 회원가입)
├── user/               # 사용자 관리
├── wallet/             # MetaMask 지갑 연동/해제
├── landmark/           # 랜드마크 + NFC 인증
├── nft/                # NFT 민팅 및 갤러리
├── reward/             # 리워드 쿠폰 관리
├── config/             # Security, JWT, CORS 설정
└── common/             # 공통 응답 형식, 예외 처리
```

---

## ⚙️ 환경 설정

### 필수 환경
- Java 21
- MySQL 8.0
- Gradle 8+

### DB 생성
```sql
CREATE DATABASE landin_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### application.yml 설정
`src/main/resources/application.yml`
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/landin_db?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: {DB_USERNAME}
    password: {DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8080

jwt:
  secret: {JWT_SECRET_KEY}
  expiration: 86400000
  refresh-expiration: 604800000
```

> ⚠️ 실제 비밀번호와 JWT 시크릿 키는 `application-local.yml`에 작성하고 `.gitignore`에 추가하세요.

---

## 🚀 실행 방법

```bash
# 1. 프로젝트 클론
git clone https://github.com/KDT-3Team-BlockchainTest/land-in.git
cd land-in/backend

# 2. 빌드 및 실행 (Windows)
gradlew bootRun

# 2. 빌드 및 실행 (Mac/Linux)
./gradlew bootRun
```

서버 실행 후 → http://localhost:8080

---

## 📡 API 엔드포인트

### Auth
| Method | URL | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/refresh` | 토큰 재발급 |

### Wallet (MetaMask)
| Method | URL | 설명 |
|---|---|---|
| GET | `/api/wallet/nonce` | 서명용 nonce 발급 |
| POST | `/api/wallet/link` | 지갑 연동 |
| DELETE | `/api/wallet/unlink` | 지갑 해제 |

### Landmark
| Method | URL | 설명 |
|---|---|---|
| GET | `/api/landmarks` | 랜드마크 목록 |
| GET | `/api/landmarks/{id}` | 랜드마크 상세 |
| POST | `/api/landmarks/{id}/verify-nfc` | NFC 인증 |

### NFT
| Method | URL | 설명 |
|---|---|---|
| POST | `/api/nfts/mint` | NFT 민팅 |
| GET | `/api/nfts/my` | 내 NFT 목록 |

### Reward
| Method | URL | 설명 |
|---|---|---|
| GET | `/api/rewards/my` | 내 리워드 목록 |
| PUT | `/api/rewards/{id}/use` | 리워드 사용 |

---

## 🔐 인증 방식

### 일반 로그인
```
회원가입 → email/password 저장 → JWT 발급
```

### MetaMask 지갑 연동 (서명 기반)
```
1. GET /api/wallet/nonce?address=0x...  → nonce 발급
2. MetaMask로 nonce 서명
3. POST /api/wallet/link { address, signature } → 서명 검증 후 연동
```

---

## 👥 팀원

| 역할 | 이름 |
|---|---|
| Frontend | - |
| Backend | 라솜 |
| Blockchain | - |

---

## 📄 라이선스

MIT License
