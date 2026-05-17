# 10. 블록체인 & NFT 발급 구현 문서

> 작성일: 2026-05-16  
> 대상 브랜치: main  
> 관련 파일: `backend/`, `frontend/`

---

## 1. 개요

Land-In 서비스는 사용자가 현장 NFC를 태그하면 NFT를 발급하고, 그 사실을 Hyperledger Fabric 원장에 불변 기록으로 남긴다. 발급된 NFT는 Polygon(ERC-721) 온체인에 민팅되며, 프론트엔드 NFT 갤러리에서 확인할 수 있다.

### 기술 스택

| 레이어 | 기술 |
|---|---|
| 백엔드 | Spring Boot 3, Java 21 |
| 블록체인 (프라이빗) | Hyperledger Fabric (visitledger 체인코드) |
| 블록체인 (퍼블릭) | Polygon / Hoodi 테스트넷 (ERC-721) |
| 분산 저장 | IPFS (이미지·메타데이터 CID, 현재 stub) |
| 프론트엔드 | React (Vite), Web3j |

---

## 2. 아키텍처 흐름

```
사용자(모바일)
  │
  ▼
NFC 태그 → POST /api/mobile/nfc/verify
  │
  ▼ (NfcService)
  ├─ StepCompletion 저장 (RDB)
  ├─ Fabric VerifyVisit 기록 (visitledger)
  ├─ UserNft 생성 (RDB)
  └─ OnChainNftMintService: Polygon ERC-721 민팅 (비동기)
       │
       ▼ (NfcVerifyResponse 반환)
사용자 ← NFT 발급 완료 + 리워드 여부 응답

사진 기반 NFT 흐름 (별도):
  POST /api/mobile/photo-drafts          (사진 초안 생성)
  PATCH /{draftId}/edit                  (편집)
  POST  /{draftId}/prepare-ipfs          (IPFS 업로드 시작)
  POST  /api/mobile/nfts/{draftId}/mint-polygon  (Polygon 민팅)
  POST  /api/mobile/nfts/{mintRequestId}/grant-reward (포인트 지급)
```

---

## 3. Hyperledger Fabric 연동

### 3.1 FabricGatewayFactory

**파일:** `backend/.../blockchain/fabric/FabricGatewayFactory.java`

Spring Boot 시작 시 `@PostConstruct`로 Fabric Gateway 연결을 초기화한다.  
`fabric.enabled=false`이거나 cert/key 경로 미설정 시 연결을 건너뛰고 백엔드는 정상 작동한다 (MVP 정책).

```yaml
# application.yml 설정 예시
fabric:
  enabled: true
  channel-name: channel1
  chaincode-name: visitledger
  msp-id: Org1MSP
  peer-endpoint: localhost:7051
  tls-cert-path: /opt/fabric/.../ca.crt
  user-cert-path: /opt/fabric/.../certificate.pem
  user-key-path: /opt/fabric/.../keystore/key.pem
  deadline-seconds: 30
```

- **`submit()`**: submitTransaction 실행 (원장 쓰기)
- **`evaluate()`**: evaluateTransaction 실행 (원장 읽기)
- **`isAvailable()`**: Fabric 연결 상태 확인

### 3.2 체인코드 컨트랙트 구성 (visitledger)

| 컨트랙트 | 주요 함수 | 설명 |
|---|---|---|
| `VisitContract` | `VerifyVisit` | NFC 방문 인증 원장 기록 |
| `VisitContract` | `GetVisit` | visitId로 방문 레코드 조회 |
| `VisitContract` | `HasRecentVisit` | 24시간 쿨다운 여부 확인 |
| `NftRecordContract` | `RecordNFTMint` | Polygon 민팅 성공 후 Fabric 기록 |
| `NftRecordContract` | `GetNftMintRecord` | mintRecordId로 발급 레코드 조회 |
| `NftRecordContract` | `FindMintRecordByVisit` | visitId로 NFT 레코드 조회 |
| `NftRecordContract` | `ReconcileNFTMintFailure` | MINTED_BUT_FABRIC_RECORD_FAILED 복구 |
| `RewardContract` | `GrantPointAfterNFTMint` | NFT 발급 완료 후 포인트 적립 |
| `RewardContract` | `UsePoint` | 가맹점 포인트 사용 |
| `RewardContract` | `GetPointBalance` | 포인트 잔액 조회 |
| `QueryContract` | `GetVisitHistoryByUser` | 사용자 방문 이력 조회 |
| `QueryContract` | `GetMintHistoryByUser` | 사용자 NFT 발급 이력 조회 |
| `QueryContract` | `GetRewardHistoryByUser` | 포인트 이력 조회 |

### 3.3 개인정보 보호 설계

Fabric 원장에는 userId, tagUid를 **SHA-256 해시**로 변환해 저장한다. 원본 식별자는 Fabric 원장에 기록되지 않는다.

```java
// NfcService.recordVisitOnFabric()
String userIdHash = sha256Hex(userId.toString());
String tagIdHash  = sha256Hex(tagUid);
String visitProofHash = sha256Hex(userId + ":" + tagUid + ":" + visitId);
```

---

## 4. NFC 태그 → NFT 발급 흐름

**파일:** `backend/.../nfc/service/NfcService.java`

`POST /api/mobile/nfc/verify` 호출 시 아래 순서로 처리된다:

1. **태그 검증**: `NfcTag` 조회 → active 여부, 이벤트 상태 확인
2. **참여 여부 확인**: `EventParticipation` 조회
3. **순서 검증**: 이전 스텝 완료 여부 확인 (orderIndex 기반)
4. **StepCompletion 저장**: 스텝 완료 RDB 기록
5. **Fabric VerifyVisit 호출**: 방문 사실을 Fabric 원장에 기록
6. **UserNft 생성**: NftTemplate 기반 NFT 생성 (RDB)
7. **온체인 민팅 예약**: `prepareMintState()` → `scheduleMintAfterCommit()`  
   → DB 트랜잭션 커밋 후 Polygon 민팅 비동기 실행
8. **리워드 확인**: 모든 스텝 완료 시 `UserReward` 자동 발급
9. **응답 반환**: 발급된 NFT 정보 + 리워드 여부

### NFC 스캔 결과 코드

| 결과 | 설명 |
|---|---|
| `SUCCESS` | 정상 인증 |
| `UNKNOWN_TAG` | 미등록 태그 |
| `NOT_JOINED` | 이벤트 미참여 |
| `ALREADY_DONE` | 이미 완료한 스텝 |
| `WRONG_ORDER` | 이전 스텝 미완료 |

---

## 5. Polygon ERC-721 온체인 민팅

**파일:** `backend/.../nft/service/OnChainNftMintService.java`

### 5.1 민팅 설정

```yaml
# application.yml
blockchain:
  enabled: true
  chain-id: 560048          # Hoodi 테스트넷
  rpc-url: https://rpc.hoodi.ethpandaops.io
  contract-address: 0x...
  minter-private-key: ${MINTER_PRIVATE_KEY}
  mint-function-name: safeMint
  gas-limit: 500000
  receipt-poll-attempts: 20
  receipt-poll-interval-millis: 3000
```

### 5.2 민팅 처리 단계

DB 연결을 최소한으로 유지하도록 트랜잭션을 3단계로 분리한다:

1. **단기 읽기 트랜잭션**: `UserNft` 및 지갑 주소 조회
2. **블록체인 I/O** (DB 연결 없음): Web3j로 `safeMint(recipientAddress, tokenUri)` 호출, 영수증 폴링, Transfer 이벤트에서 tokenId 추출
3. **단기 쓰기 트랜잭션**: 결과 저장 (`tokenId`, `transactionHash`, `onChainMintedAt`)

### 5.3 UserNft 민팅 상태

| 상태 | 설명 |
|---|---|
| `OFFCHAIN_ONLY` | Fabric/Polygon 민팅 전 (기본) |
| `PENDING_WALLET` | 지갑 미연결, 온체인 대기 |
| `PENDING_ONCHAIN` | 지갑 연결됨, 민팅 대기 |
| `MINTED_ONCHAIN` | Polygon 온체인 민팅 완료 |
| `FAILED_ONCHAIN` | 민팅 실패 |

### 5.4 메타데이터 엔드포인트

NFT 메타데이터는 ERC-721 표준(OpenSea 호환)으로 제공된다.

```
GET /api/nfts/{nftId}/metadata
```

응답 예시:
```json
{
  "name": "파리 개선문 NFT",
  "description": "Land-In 파리 캠페인 기념 NFT",
  "image": "https://...",
  "attributes": [
    { "trait_type": "Event", "value": "파리 랜드마크 투어" },
    { "trait_type": "Step", "value": "Arc de Triomphe" },
    { "trait_type": "Rarity", "value": "RARE" },
    { "trait_type": "Mint Status", "value": "MINTED_ONCHAIN" }
  ]
}
```

---

## 6. 사진 기반 NFT 민팅 흐름

### 6.1 PhotoDraft 상태 전이

```
DRAFT_CREATED → UPLOADING → UPLOADED_TO_S3 → EDITING
  → SELECTED_FOR_MINT → READY_FOR_IPFS
  (또는 EXPIRED / DELETED)
```

**파일:** `backend/.../photodraft/service/PhotoDraftService.java`

| API | 설명 |
|---|---|
| `POST /api/mobile/photo-drafts` | 사진 초안 생성 (multipart: image + metadata JSON) |
| `PATCH /api/mobile/photo-drafts/{draftId}/edit` | 필터·프레임·배지 편집 정보 저장 |
| `POST /api/mobile/photo-drafts/{draftId}/prepare-ipfs` | IPFS 업로드 시작 |
| `GET /api/mobile/photo-drafts/{draftId}/ipfs-status` | IPFS 업로드 진행 상태 폴링 |
| `GET /api/mobile/photo-drafts` | 내 초안 목록 조회 |
| `DELETE /api/mobile/photo-drafts/{draftId}` | 초안 삭제 |

> **현재 상태:** S3 업로드·IPFS 업로드는 stub 구현. URL 패턴(`s3://landin-drafts/...`, `ipfs://...`)만 설정됨.

### 6.2 NftMintRequest 상태 전이

```
NOT_STARTED
  → POLYGON_MINT_REQUESTED
  → POLYGON_MINTED
  → FABRIC_RECORD_PENDING
  → FABRIC_RECORDED
  → REWARD_PENDING
  → REWARD_GRANTED
  → MINT_COMPLETED

실패 케이스:
  POLYGON_MINT_FAILED            (Polygon 민팅 실패)
  MINTED_BUT_FABRIC_RECORD_FAILED (민팅 성공 + Fabric 기록 실패)
  REWARD_FAILED_AFTER_MINT       (포인트 지급 실패)
```

**파일:** `backend/.../nft/service/NftMintRequestService.java`

| API | 설명 |
|---|---|
| `POST /api/mobile/nfts/{draftId}/mint-polygon` | Polygon 민팅 요청 + Fabric RecordNFTMint |
| `GET /api/mobile/nfts/{mintRequestId}/status` | 민팅 상태 폴링 |
| `POST /api/mobile/nfts/{mintRequestId}/grant-reward` | 포인트 지급 (Fabric GrantPointAfterNFTMint) |
| `POST /api/admin/nft-mints/{mintRequestId}/retry` | 관리자 Fabric 재동기화 (MINTED_BUT_FABRIC_RECORD_FAILED 복구) |

---

## 7. Fabric 원장 조회 API (관리자용)

**파일:** `backend/.../blockchain/fabric/controller/FabricLedgerController.java`

| API | 설명 |
|---|---|
| `GET /api/admin/fabric/visits/{visitId}` | 방문 레코드 조회 |
| `GET /api/admin/fabric/visits/by-user/{userIdHash}` | 사용자 방문 이력 조회 |
| `GET /api/admin/fabric/nfts/{mintRecordId}` | NFT 발급 레코드 조회 |
| `GET /api/admin/fabric/nfts/by-visit/{visitId}` | visitId로 NFT 레코드 조회 |
| `GET /api/admin/fabric/nfts/by-user/{userIdHash}` | 사용자 NFT 발급 이력 조회 |
| `GET /api/admin/fabric/rewards/balance/{userIdHash}` | 포인트 잔액 조회 |
| `GET /api/admin/fabric/rewards/history/{userIdHash}` | 포인트 이력 조회 |

> `userIdHash`는 userId의 SHA-256 hex 값이다.

---

## 8. 프론트엔드 NFT 갤러리

**파일:** `frontend/src/pages/nftGallery/NftGalleryPage.jsx`

사용자가 특정 이벤트에서 수집한 NFT를 확인하는 갤러리 화면.

### 8.1 라우팅

```
/collection/{eventId}/gallery
```

### 8.2 API 호출

```js
// frontend/src/api/nfts.js
GET /api/nfts?eventId={eventId}     // 이벤트별 NFT 목록
GET /api/nfts/{nftId}               // NFT 상세
```

```js
// frontend/src/api/collections.js
GET /api/collections                // 컬렉션 목록 (이벤트별 수집 현황)
```

### 8.3 화면 구성

| 섹션 | 설명 |
|---|---|
| 히어로 | 이벤트 대표 이미지 + 지역·기간 정보 |
| 통계 카드 | 수집 수 / 진행률 / 잠금 수 |
| 진행률 바 | 수집 / 전체 랜드마크 수 |
| 배너 | 컬렉션 완성 / 시즌 종료 / 리워드 안내 |
| NFT 그리드 | 수집한 NFT 카드 + 미수집 자물쇠 카드 |
| 액션 버튼 | 방문 루트 보기 / 전체 컬렉션으로 |

### 8.4 NFT 카드 상태 표시

`NftGalleryTokenCard` 컴포넌트가 `UserNftResponse.mintStatus`를 기반으로 온체인 상태를 표시한다:

- `MINTED_ONCHAIN`: Polygon 민팅 완료 (tokenId, transactionHash 표시)
- `PENDING_WALLET`: 지갑 연결 필요
- `PENDING_ONCHAIN`: 온체인 민팅 대기 중
- `FAILED_ONCHAIN`: 민팅 실패 (재시도 안내)
- `OFFCHAIN_ONLY`: 오프체인 발급만 완료

---

## 9. 오류 처리 및 복구

### 9.1 Fabric 미연결 시 동작

| 상황 | 동작 |
|---|---|
| Fabric 전체 미연결 | 체인코드 호출 skip, 백엔드 정상 작동 |
| VerifyVisit 실패 | 경고 로그 후 계속 (방문 인증은 RDB 기준) |
| RecordNFTMint 실패 | `MINTED_BUT_FABRIC_RECORD_FAILED` 저장 |
| GrantPointAfterNFTMint 실패 | `REWARD_FAILED_AFTER_MINT` 저장 |

### 9.2 복구 방법

1. **자동 복구**: `REWARD_FAILED_AFTER_MINT` 상태는 재호출로 멱등성 보장 (rewardTxId 재사용)
2. **관리자 수동 복구**: `POST /api/admin/nft-mints/{mintRequestId}/retry`  
   → `ReconcileNFTMintFailure` 체인코드 호출

### 9.3 에러 코드 (관련)

| 코드 | HTTP | 설명 |
|---|---|---|
| `UNKNOWN_TAG` | 404 | 미등록 NFC 태그 |
| `TAG_INACTIVE` | 400 | 비활성화된 NFC 태그 |
| `STEP_ALREADY_DONE` | 409 | 이미 완료한 스텝 |
| `WRONG_ORDER` | 400 | 이전 스텝 미완료 |
| `DUPLICATE_NFT_MINT` | 409 | 중복 민팅 요청 |
| `DRAFT_NOT_READY_FOR_IPFS` | 400 | IPFS 업로드 불가 상태 |
| `FABRIC_REWARD_FAILED` | 502 | Fabric 포인트 지급 실패 |
| `FABRIC_NFT_RECORD_FAILED` | 502 | Fabric NFT 기록 실패 |

---

## 10. 미구현 (stub) 항목

| 항목 | 현재 상태 | 비고 |
|---|---|---|
| S3 이미지 업로드 | stub (mock URL 생성) | S3Service 연동 필요 |
| IPFS 업로드 | stub (CID placeholder) | 비동기 Job 트리거 필요 |
| Polygon 민팅 (사진 기반) | stub (mock txHash) | OnChainNftMintService 연동 필요 |
| campaignId 추출 | 하드코딩 `"default-campaign"` | step/event에서 추출 로직 필요 |
| 24시간 쿨다운 (Fabric) | `HasRecentVisit` 구현됨 | NfcService에서 호출 연결 필요 |
