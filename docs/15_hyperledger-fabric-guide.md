# Land-In Hyperledger Fabric 구조 가이드

> 처음 보는 사람도 이해할 수 있도록 작성된 가이드입니다.  
> 작성일: 2026-05-18

---

## 1. Hyperledger Fabric이란?

블록체인에는 여러 종류가 있습니다. 비트코인, 이더리움처럼 누구나 참여할 수 있는 **퍼블릭 블록체인**과, 허가된 기관만 참여할 수 있는 **프라이빗(허가형) 블록체인**이 있습니다.

**Hyperledger Fabric**은 프라이빗 블록체인 플랫폼입니다. 주요 특징:

| 특징 | 설명 |
|------|------|
| 허가형 네트워크 | 신원이 확인된 참여자만 거래 가능 |
| 빠른 처리 속도 | 퍼블릭 블록체인 대비 훨씬 빠름 (채굴 없음) |
| 스마트 컨트랙트 | "체인코드(Chaincode)"라는 이름의 프로그램으로 비즈니스 로직 실행 |
| 데이터 불변성 | 한 번 기록된 데이터는 수정·삭제 불가 |
| 감사 가능성 | 모든 트랜잭션에 타임스탬프·서명이 남아 추적 가능 |

Land-In에서 Fabric을 사용하는 이유: **사용자의 NFC 방문 기록이 조작되지 않았음을 증명**하기 위해 불변 원장에 기록합니다.

---

## 2. Land-In Fabric 네트워크 구조

### 2.1 네트워크 구성도

```
┌────────────────────────────────────────────────────────────────┐
│                   Land-In Fabric 네트워크                       │
│                                                                │
│   ┌─────────────┐         ┌─────────────────────────────────┐  │
│   │  orderer    │◄───────►│     peer0.org1.example.com      │  │
│   │  :7050      │  블록    │           :7051                 │  │
│   │  (정렬 서비스) │  동기   │  ┌───────────────────────────┐ │  │
│   └─────────────┘         │  │  visitledger 체인코드       │ │  │
│                            │  │  (스마트 컨트랙트)          │ │  │
│                            │  └───────────────────────────┘ │  │
│                            │  ┌───────────────────────────┐ │  │
│                            │  │  CouchDB (월드스테이트)    │ │  │
│                            │  │  (현재 상태 DB)            │ │  │
│                            │  └───────────────────────────┘ │  │
│                            └─────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                        ▲
                        │ gRPC (TLS 암호화)
                        │
              ┌─────────────────┐
              │  Spring Boot    │
              │  백엔드 서버     │
              │  :8080          │
              └─────────────────┘
```

### 2.2 Docker 컨테이너 목록

| 컨테이너 이름 | 역할 | 포트 |
|--------------|------|------|
| `peer0.org1.example.com` | Fabric 피어 노드 — 트랜잭션 처리, 원장 보관 | 7051 |
| `orderer.example.com` | 정렬 서비스 — 트랜잭션을 블록으로 묶어 피어에 배포 | 7050 |
| `couchdb0` | 피어의 월드스테이트(현재 상태) DB | 5984 |
| `dev-peer0.org1.example.com-visitledger_1-...` | 실행 중인 체인코드 컨테이너 | - |

> **용어 설명**
> - **피어(Peer)**: 블록체인의 실제 실행 노드. 체인코드를 실행하고 원장을 보관합니다.
> - **오더러(Orderer)**: 여러 피어로부터 트랜잭션을 받아 순서를 정해 블록으로 만드는 서비스.
> - **월드스테이트(World State)**: 원장의 "현재 상태" 스냅샷. 빠른 조회를 위해 CouchDB에 보관.
> - **원장(Ledger)**: 모든 트랜잭션의 이력 (변경 불가).

### 2.3 채널 정보

```
채널명: channel1
체인코드명: visitledger
MSP ID: Org1MSP
```

---

## 3. 체인코드(스마트 컨트랙트) 구조

### 3.1 체인코드 위치

```
dev-mode/chaincode/visitledger/go/
├── main.go                    # 진입점 — 4개 컨트랙트 등록
├── contract/
│   ├── visit_contract.go      # NFC 방문 인증 원장
│   ├── nft_record_contract.go # NFT 발급 기록
│   ├── reward_contract.go     # 포인트 적립/사용
│   └── query_contract.go      # 이력 조회
├── model/
│   ├── visit.go               # 방문 레코드 데이터 구조
│   ├── nft_mint_record.go     # NFT 발급 레코드 데이터 구조
│   └── reward_ledger.go       # 포인트 원장 데이터 구조
└── pkg/
    ├── keys.go                # 원장 키 규칙
    └── validation.go          # 입력값 검증
```

### 3.2 4개 컨트랙트 요약

#### VisitContract — NFC 방문 인증

| 함수 | 타입 | 설명 |
|------|------|------|
| `VerifyVisit` | 트랜잭션(쓰기) | NFC 태그 인증 성공 후 방문 사실을 원장에 기록 |
| `GetVisit` | 쿼리(읽기) | visitId로 방문 레코드 조회 |
| `HasRecentVisit` | 쿼리(읽기) | 동일 사용자+태그 24시간 이내 재방문 여부 확인 |

방문 레코드에 저장되는 데이터:
```json
{
  "visitId": "a4fec198-e204-4b09-...",
  "userIdHash": "sha256(userId)",
  "campaignId": "이벤트 UUID",
  "tagIdHash": "sha256(tagUid)",
  "visitProofHash": "sha256(userId:tagUid:visitId)",
  "locationCode": "스텝 장소명",
  "status": "RECORDED",
  "visitedAt": "2026-05-18T16:28:50Z",
  "fabricTxId": "Fabric 트랜잭션 ID"
}
```

#### NftRecordContract — NFT 발급 기록

| 함수 | 타입 | 설명 |
|------|------|------|
| `RecordNFTMint` | 트랜잭션(쓰기) | Polygon ERC-721 민팅 성공 후 Fabric에 발급 사실 기록 |
| `GetNftMintRecord` | 쿼리(읽기) | mintRecordId로 NFT 발급 레코드 조회 |
| `FindMintRecordByVisit` | 쿼리(읽기) | visitId로 연결된 NFT 발급 레코드 조회 |
| `ReconcileNFTMintFailure` | 트랜잭션(쓰기) | Polygon 민팅은 성공했으나 Fabric 기록 실패 시 사후 복구 |

#### RewardContract — 포인트 원장

| 함수 | 타입 | 설명 |
|------|------|------|
| `GrantPointAfterNFTMint` | 트랜잭션(쓰기) | NFT 발급 완료 후 포인트 적립 |
| `UsePoint` | 트랜잭션(쓰기) | 가맹점에서 포인트 사용 |
| `GetPointBalance` | 쿼리(읽기) | 사용자 포인트 잔액 조회 |

#### QueryContract — 이력 조회

| 함수 | 타입 | 설명 |
|------|------|------|
| `GetVisitHistoryByUser` | 쿼리(읽기) | 사용자별 방문 이력 전체 조회 |
| `GetMintHistoryByUser` | 쿼리(읽기) | 사용자별 NFT 발급 이력 조회 |
| `GetRewardHistoryByUser` | 쿼리(읽기) | 사용자별 포인트 이력 조회 |

---

## 4. 원장 키 구조

Fabric 월드스테이트는 Key-Value 저장소입니다. Land-In의 키 규칙:

```
visit:{visitId}              → 방문 레코드
mint:{mintRecordId}          → NFT 발급 레코드
balance:{userIdHash}         → 사용자 포인트 잔액
reward:{rewardTxId}          → 포인트 이력 항목
cooldown:{userIdHash}:{tagIdHash} → 24시간 재방문 방지

복합 키 (사용자별 범위 쿼리용):
visitByUser:{userIdHash}:{visitId}
mintByUser:{userIdHash}:{mintRecordId}
rewardByUser:{userIdHash}:{rewardTxId}

인덱스:
mintByVisit:{visitId}    → visitId → mintRecordId 매핑
rewardByVisit:{visitId}  → visitId → rewardTxId 매핑
```

---

## 5. NFC 태그 → Fabric 원장 기록 흐름

```
모바일 앱          백엔드 서버              Fabric 원장           Polygon 블록체인
   │                  │                       │                        │
   │ NFC 태그 스캔      │                       │                        │
   │─POST /api/nfc──►│                       │                        │
   │                  │ 1. tagUid 검증         │                        │
   │                  │    (DB에 등록된 태그인지) │                        │
   │                  │ 2. 이벤트 참여 여부 확인  │                        │
   │                  │ 3. 스텝 순서 확인        │                        │
   │                  │ 4. StepCompletion 저장  │                        │
   │                  │    (MySQL)             │                        │
   │                  │                       │                        │
   │                  │ 5. VisitContract:VerifyVisit                    │
   │                  │──submitTransaction───►│                        │
   │                  │    (비동기, 실패해도 계속) │                        │
   │                  │                       │ 원장에 방문 기록          │
   │                  │                       │ visitId, 해시값들,       │
   │                  │                       │ 타임스탬프 저장           │
   │                  │                       │                        │
   │                  │ 6. UserNft 저장         │                        │
   │                  │    (MySQL)             │                        │
   │                  │                       │                        │
   │                  │ 7. Polygon mint 예약    │                        │
   │                  │    (비동기)             │                       │
   │                  │                       │                        │
   │◄─응답 반환────────│                       │                        │
   │ (NFT 정보 포함)   │                       │                        │
   │                  │                       │       [비동기: mint 완료 후]
   │                  │                       │ 8. NftRecordContract:RecordNFTMint
   │                  │                       │◄──────────────────────│
   │                  │                       │    Polygon txHash,     │
   │                  │                       │    tokenId 등 기록      │
```

**핵심 포인트:**
- 5번 Fabric 기록이 **실패해도** 나머지 처리는 계속됩니다 (비즈니스 로직 차단 없음).
- Fabric이 down되어 있으면 경고 로그를 남기고 넘어갑니다.
- 이후 `ReconcileNFTMintFailure`로 사후 복구가 가능합니다.

---

## 6. 백엔드 연결 방식

### 6.1 연결 설정 (`application-local.yml`)

```yaml
fabric:
  enabled: true
  channel-name: channel1
  chaincode-name: visitledger
  msp-id: Org1MSP
  peer-endpoint: localhost:7051
  tls-cert-path: ~/.../fabric-certs/tls-ca.crt
  user-cert-path: ~/.../fabric-certs/user-cert.pem
  user-key-path: ~/.../fabric-certs/user-key.pem
  deadline-seconds: 30
```

### 6.2 인증서 파일 위치

```
.landin-runtime/fabric-certs/
├── tls-ca.crt       # TLS CA 인증서 (gRPC 암호화용)
├── user-cert.pem    # 사용자(백엔드) X.509 인증서
└── user-key.pem     # 사용자 개인키
```

### 6.3 Java 게이트웨이 클래스

| 클래스 | 역할 |
|--------|------|
| `FabricGatewayFactory` | gRPC 채널 생성, 연결 관리, `submit`/`evaluate` 실행 |
| `FabricVisitGateway` | VisitContract 호출 래퍼 |
| `FabricNftGateway` | NftRecordContract 호출 래퍼 |
| `FabricRewardGateway` | RewardContract 호출 래퍼 |
| `FabricLedgerController` | 관리자 조회 REST API |

---

## 7. 개인정보 보호 설계

Fabric 원장에는 **사용자 ID와 NFC 태그 UID를 직접 저장하지 않습니다.**  
대신 SHA-256 해시값만 저장합니다.

```java
// NfcService.java에서 해시 생성 후 Fabric에 전달
String userIdHash = sha256Hex(userId.toString());
String tagIdHash = sha256Hex(tagUid);
String visitProofHash = sha256Hex(userId + ":" + tagUid + ":" + visitId);
```

원장을 직접 조회해도 어떤 사용자인지, 어떤 태그인지 알 수 없습니다.  
검증이 필요할 때는 백엔드가 해시를 재계산해서 원장의 값과 비교합니다.

---

## 8. 관리자 API

Fabric 원장 조회용 관리자 전용 REST API입니다.  
모든 엔드포인트는 관리자 JWT 인증이 필요합니다.

```
GET /api/admin/fabric/visits/{visitId}
    → visitId로 방문 원장 레코드 조회

GET /api/admin/fabric/nfts/{mintRecordId}
    → mintRecordId로 NFT 발급 원장 레코드 조회

GET /api/admin/fabric/nfts/by-visit/{visitId}
    → visitId로 연결된 NFT 발급 원장 레코드 조회

GET /api/admin/fabric/rewards/{rewardTxId}
    → rewardTxId로 포인트 이력 조회

GET /api/admin/fabric/rewards/balance/{userIdHash}
    → userIdHash로 포인트 잔액 조회
```

---

## 9. 현재 원장 상태 확인

### 9.1 컨테이너 상태 확인

```bash
docker ps | grep -E "peer|orderer|couch|visitledger"
```

정상 출력 예시:
```
dev-peer0.org1.example.com-visitledger_1-...   Up X minutes
peer0.org1.example.com                          Up X minutes
orderer.example.com                             Up X minutes
couchdb0                                        Up X minutes
```

### 9.2 블록체인 블록 수 확인

```bash
docker exec peer0.org1.example.com peer channel getinfo -c channel1
```

출력 예시:
```
Blockchain info: {"height":14, "currentBlockHash":"...", "previousBlockHash":"..."}
```

`height`가 제네시스 블록(1) + 체인코드 라이프사이클 트랜잭션 수 + 실제 방문 기록 수입니다.

### 9.3 백엔드 Fabric 연결 확인

백엔드 시작 시 로그에서 확인:
```
[FabricGateway] Connected to Fabric peer. endpoint=localhost:7051, channel=channel1, chaincode=visitledger
```

### 9.4 관리자 API로 방문 기록 조회

1. 관리자 로그인으로 JWT 토큰 획득:
```bash
TOKEN=$(curl -s http://localhost:8080/api/admin/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@landin.local","password":"admin1234!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

2. MySQL에서 visitId 조회:
```bash
docker exec land-in-mysql mysql -uroot -p1234 landin_db \
  -e "SELECT BIN_TO_UUID(id), completed_at FROM step_completions ORDER BY completed_at DESC LIMIT 5;"
```

3. Fabric 원장 조회:
```bash
curl -s "http://localhost:8080/api/admin/fabric/visits/{visitId}" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 10. 장애 처리 및 트러블슈팅

### 10.1 컨테이너가 중지된 경우

Fabric 컨테이너들은 자동 재시작되지 않습니다. 수동으로 시작해야 합니다:

```bash
# 반드시 이 순서로 시작 (CouchDB 먼저, 그 다음 피어)
docker start couchdb0
docker start orderer.example.com
docker start peer0.org1.example.com
# 체인코드 컨테이너는 피어가 자동으로 실행함
```

그 다음 백엔드를 재시작해 Fabric 연결을 갱신합니다.

### 10.2 피어가 CouchDB에 연결 실패하는 경우

피어가 CouchDB보다 먼저 시작되면 연결에 실패합니다.  
피어를 재시작하면 해결됩니다:
```bash
docker restart peer0.org1.example.com
```

### 10.3 방문 기록이 원장에 없는 경우

컨테이너가 꺼진 상태에서 NFC 스캔이 발생했다면 방문 기록이 Fabric 원장에 없습니다.  
이 경우 백엔드 로그에 아래와 같은 경고가 남습니다:
```
WARN [NfcService] Fabric VerifyVisit failed — continuing without Fabric record. userId=... error=...
```

사용자 입장에서는 정상 처리된 것처럼 보입니다 (MySQL에는 기록됨).  
`ReconcileNFTMintFailure`를 통한 사후 복구가 가능하도록 설계되어 있습니다.

### 10.4 Fabric 비활성화 모드

`fabric.enabled=false`로 설정하면 모든 체인코드 호출이 skip됩니다.  
Fabric 없이도 백엔드는 완전히 동작합니다.

---

## 11. 데이터 흐름 요약 (상태 전이)

```
NFC 스캔
  │
  ▼
[MySQL] StepCompletion 저장
  │
  ├──► [Fabric] visit 레코드 기록 (VisitContract:VerifyVisit)
  │         status: RECORDED
  │
  ▼
[MySQL] UserNft 저장 (PENDING_ONCHAIN)
  │
  ▼
[Polygon] ERC-721 safeMint
  │
  ├──► [Fabric] NFT 발급 기록 (NftRecordContract:RecordNFTMint)
  │         visit status: NFT_MINTED
  │
  ▼
[MySQL] UserNft 업데이트 (MINTED_ONCHAIN)
  │
  ▼ (모든 스텝 완료 시)
[MySQL] UserReward 저장
  │
  ▼ (추후 구현)
[Fabric] 포인트 적립 (RewardContract:GrantPointAfterNFTMint)
         visit status: COMPLETED
```

---

*이 문서는 Land-In 프로젝트의 Hyperledger Fabric 연동 구조를 설명합니다.*  
*체인코드 소스: `dev-mode/chaincode/visitledger/go/`*  
*백엔드 연동 코드: `backend/src/main/java/.../domain/blockchain/fabric/`*
