# Land-In Backend API Specification

> **Base URL:** `https://api.land-in.io`  
> **Auth:** JWT Bearer Token (`Authorization: Bearer <token>`)  
> **Response envelope (모든 성공 응답):**
> ```json
> { "success": true, "data": { ... } }
> ```
> **Error envelope:**
> ```json
> { "success": false, "error": "에러 메시지" }
> ```

---

## 목차

1. [인증 (Auth)](#1-인증-auth)
2. [이벤트 (Event)](#2-이벤트-event)
3. [참여 (Participation)](#3-참여-participation)
4. [NFC 인증 (NFC)](#4-nfc-인증-nfc)
5. [사진 초안 (Photo Draft)](#5-사진-초안-photo-draft)
6. [NFT 민팅 (NFT Mint)](#6-nft-민팅-nft-mint)
7. [컬렉션 (Collection)](#7-컬렉션-collection)
8. [리워드 (Reward)](#8-리워드-reward)
9. [관리자 (Admin)](#9-관리자-admin)
10. [Fabric 원장 조회 (Admin)](#10-fabric-원장-조회-admin)

---

## 1. 인증 (Auth)

### POST `/api/auth/register`
회원가입

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "LandIn User"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "userId": "uuid"
  }
}
```

---

### POST `/api/auth/login`
로그인

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "userId": "uuid"
  }
}
```

---

## 2. 이벤트 (Event)

### GET `/api/events`
이벤트 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `featured` | boolean | true = 피처드 이벤트만 |
| `status` | string | `ACTIVE` \| `UPCOMING` \| `ENDED` |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "paris-spring-2026",
      "title": "Paris Spring 2026",
      "city": "Paris",
      "country": "France",
      "status": "ACTIVE",
      "startDate": "2026-03-01",
      "endDate": "2026-05-31",
      "heroImageUrl": "https://...",
      "partnerName": "LV Group"
    }
  ]
}
```

---

### GET `/api/events/{eventId}`
이벤트 상세 조회

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "paris-spring-2026",
    "title": "Paris Spring 2026",
    "city": "Paris",
    "country": "France",
    "status": "ACTIVE",
    "steps": [
      {
        "id": "uuid",
        "orderIndex": 1,
        "placeName": "Eiffel Tower",
        "lat": 48.8584,
        "lng": 2.2945,
        "finalStep": false
      }
    ]
  }
}
```

---

## 3. 참여 (Participation)

### POST `/api/events/{eventId}/join`
이벤트 참여 등록

**Auth required**

**Response `200`:**
```json
{
  "success": true,
  "data": { "eventId": "paris-spring-2026", "joinedAt": "2026-05-16T12:00:00Z" }
}
```

**Errors:**
- `400 EVENT_NOT_JOINABLE` — 참여 불가 상태 이벤트
- `409 ALREADY_JOINED` — 이미 참여 중

---

### GET `/api/events/{eventId}/participation`
이벤트 참여 상태 조회

**Auth required**

---

## 4. NFC 인증 (NFC)

### POST `/api/nfc/verify`
NFC 태그 스캔 인증. 스텝 완료 처리, NFT 발급, Fabric 방문 기록을 수행한다.

**Auth required**

**Request Body:**
```json
{
  "tagUid": "04:A3:22:1F:00:00:00"
}
```

> `tagUid`는 NFC 태그 UID 원시값 또는 `?tagUid=...` 형식의 URL 문자열 모두 수용됨.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "mintedNft": {
      "id": "uuid",
      "name": "Eiffel Tower NFT",
      "imageUrl": "https://...",
      "rarity": "RARE",
      "mintedAt": "2026-05-16T12:00:00"
    },
    "rewardIssued": true,
    "reward": {
      "id": "uuid",
      "couponCode": "LI-ABCDEF123456",
      "status": "AVAILABLE",
      "validUntil": "2026-06-16"
    }
  }
}
```

**Fabric 부수 동작 (graceful degradation):**
- 스텝 완료 저장 후 `VisitContract:VerifyVisit` 호출
- Fabric 미연결 시 경고 로그 후 계속 진행 (API는 성공 반환)
- `visitId` = StepCompletion ID, `userIdHash` = SHA-256(userId), `tagIdHash` = SHA-256(tagUid)

**Errors:**
- `404 UNKNOWN_TAG` — 미등록 태그
- `400 TAG_INACTIVE` — 비활성 태그
- `400 EVENT_NOT_JOINABLE` — 비활성 이벤트
- `403 NOT_JOINED` — 미참여
- `409 STEP_ALREADY_DONE` — 이미 완료한 스텝
- `400 WRONG_ORDER` — 순서 미충족

---

## 5. 사진 초안 (Photo Draft)

### POST `/api/mobile/photo-drafts`
사진 초안 생성 (이미지 업로드 포함)

**Auth required** | **Content-Type:** `multipart/form-data`

**Form Parts:**

| 파트 | 타입 | 설명 |
|------|------|------|
| `metadata` | JSON | `{ "visitId": "uuid", "stepId": "uuid" }` |
| `image` | binary | 사진 파일 |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "stepId": "uuid",
    "status": "UPLOADED_TO_S3",
    "thumbnailUrl": "https://...",
    "originalS3Url": "https://...",
    "createdAt": "2026-05-16T12:00:00"
  }
}
```

**Draft Status Flow:**
```
DRAFT_CREATED → UPLOADING → UPLOADED_TO_S3 → EDITING → SELECTED_FOR_MINT → READY_FOR_IPFS
```

**Errors:**
- `400 INVALID_UPLOAD` — 업로드 불가 파일

---

### PATCH `/api/mobile/photo-drafts/{draftId}/edit`
편집 정보 저장 (필터·프레임·배지·날짜 스탬프)

**Auth required**

**Request Body:**
```json
{
  "filterType": "VIVID",
  "frameId": "frame-gold-01",
  "badgeId": "badge-eiffel",
  "datestampEnabled": true
}
```

**Response `200`:** PhotoDraftResponse (status = `EDITING`)

---

### POST `/api/mobile/photo-drafts/{draftId}/prepare-ipfs`
IPFS 업로드 시작. 상태를 `READY_FOR_IPFS`로 전환한다.

**Auth required**

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "status": "READY_FOR_IPFS",
    "imageCid": null,
    "metadataCid": null,
    "tokenUri": null,
    "errorMessage": null
  }
}
```

---

### GET `/api/mobile/photo-drafts/{draftId}/ipfs-status`
IPFS 업로드 진행 상태 폴링

**Auth required**

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "status": "READY_FOR_IPFS",
    "imageCid": "QmXxx...",
    "metadataCid": "QmYyy...",
    "tokenUri": "ipfs://QmYyy...",
    "errorMessage": null
  }
}
```

---

### GET `/api/mobile/photo-drafts`
내 초안 목록 조회 (EXPIRED, DELETED 제외)

**Auth required**

**Response `200`:** `{ "data": [ PhotoDraftResponse, ... ] }`

---

### DELETE `/api/mobile/photo-drafts/{draftId}`
초안 삭제 (상태를 DELETED로 변경)

**Auth required**

**Response `200`:** `{ "success": true, "data": null }`

---

## 6. NFT 민팅 (NFT Mint)

Polygon ERC-721 민팅 + Hyperledger Fabric 기록 + 포인트 지급 전체 플로우를 처리한다.

### POST `/api/mobile/nfts/{draftId}/mint-polygon`
Polygon 민팅 요청 및 Fabric NFT 기록

**Auth required**

**Path Parameter:** `draftId` — photo_drafts.id (UUID)

**Request Body:**
```json
{
  "walletAddress": "0x1234...abcd"
}
```

**선행 조건:** 해당 draft가 `SELECTED_FOR_MINT` 또는 `READY_FOR_IPFS` 상태여야 함.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "mintRequestId": "uuid",
    "visitId": "uuid",
    "mintStatus": "FABRIC_RECORDED",
    "imageCid": "QmXxx...",
    "metadataCid": "QmYyy...",
    "tokenUri": "ipfs://QmYyy...",
    "polygonTxHash": "0xabc...",
    "polygonTokenId": "123456",
    "fabricTxId": null,
    "errorReason": null,
    "retryCount": 0
  }
}
```

**Mint Status Values:**

| 상태 | 설명 |
|------|------|
| `POLYGON_MINT_REQUESTED` | Polygon 민팅 요청 접수 |
| `POLYGON_MINT_FAILED` | Polygon 민팅 실패 |
| `POLYGON_MINTED` | Polygon 민팅 성공 |
| `FABRIC_RECORD_PENDING` | Fabric 기록 대기 |
| `MINTED_BUT_FABRIC_RECORD_FAILED` | Polygon 성공 + Fabric 기록 실패 |
| `FABRIC_RECORDED` | Fabric 기록 완료 (포인트 지급 가능) |
| `REWARD_PENDING` | 포인트 지급 요청 중 |
| `REWARD_FAILED_AFTER_MINT` | 포인트 지급 실패 (재시도 가능) |
| `REWARD_GRANTED` | 포인트 지급 완료 |
| `MINT_COMPLETED` | 전체 플로우 완료 |

**Fabric 동작:**
- Polygon mint 성공 후 `NftRecordContract:RecordNFTMint` 호출
- Fabric 실패 시 상태 = `MINTED_BUT_FABRIC_RECORD_FAILED` (포인트 미지급, 관리자 재시도 필요)

**Errors:**
- `404 PHOTO_DRAFT_NOT_FOUND`
- `400 DRAFT_NOT_READY_FOR_IPFS` — draft 상태 불일치
- `409 DUPLICATE_NFT_MINT` — 이미 민팅 요청 존재

---

### GET `/api/mobile/nfts/{mintRequestId}/status`
민팅 상태 폴링

**Auth required**

**Response `200`:** MintRequestResponse (위 참조)

**Errors:**
- `404 NFT_MINT_REQUEST_NOT_FOUND`

---

### POST `/api/mobile/nfts/{mintRequestId}/grant-reward`
NFT 발급 완료 후 포인트 지급 요청

**Auth required**

**선행 조건:** mintStatus가 `FABRIC_RECORDED` 또는 `REWARD_FAILED_AFTER_MINT`여야 함.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "pointAmount": 100,
    "rewardTxId": "uuid",
    "fabricTxId": "fabric-tx-id",
    "mintStatus": "MINT_COMPLETED"
  }
}
```

**Fabric 동작:**
- `RewardContract:GrantPointAfterNFTMint` 호출
- `rewardTxId` = mintRequestId (Fabric 체인코드에서 멱등성 보장)
- Fabric 실패 시 상태 = `REWARD_FAILED_AFTER_MINT`

**Errors:**
- `404 NFT_MINT_REQUEST_NOT_FOUND`
- `400 MINT_NOT_READY_FOR_REWARD`
- `502 FABRIC_REWARD_FAILED` — Fabric 포인트 지급 실패

---

## 7. 컬렉션 (Collection)

### GET `/api/nfts`
내 NFT 컬렉션 조회

**Auth required**

**Query Parameters:**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `eventId` | string | 이벤트 ID로 필터링 |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Eiffel Tower NFT",
      "imageUrl": "https://...",
      "rarity": "RARE",
      "mintedAt": "2026-05-16T12:00:00",
      "effectiveMintStatus": "ON_CHAIN"
    }
  ]
}
```

---

### GET `/api/nfts/{nftId}`
NFT 상세 조회

**Response `200`:** NFT 상세 정보

---

### GET `/api/nfts/{nftId}/metadata`
ERC-721 메타데이터 (OpenSea 표준)

**Response `200`:**
```json
{
  "name": "Eiffel Tower NFT",
  "description": "Paris Spring 2026 commemorative NFT",
  "image": "https://...",
  "attributes": [
    { "trait_type": "Event", "value": "Paris Spring 2026" },
    { "trait_type": "Step", "value": "Eiffel Tower" },
    { "trait_type": "Rarity", "value": "RARE" },
    { "trait_type": "Mint Status", "value": "ON_CHAIN" }
  ]
}
```

---

## 8. 리워드 (Reward)

### GET `/api/rewards`
내 리워드 목록 조회

**Auth required**

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "couponCode": "LI-ABCDEF123456",
      "status": "AVAILABLE",
      "issuedAt": "2026-05-16T12:00:00",
      "validUntil": "2026-06-16"
    }
  ]
}
```

---

### POST `/api/rewards/{rewardId}/use`
리워드 사용

**Auth required**

**Errors:**
- `404 REWARD_NOT_FOUND`
- `400 REWARD_NOT_AVAILABLE`

---

## 9. 관리자 (Admin)

### POST `/api/admin/auth/login`
관리자 로그인

**Request Body:**
```json
{ "email": "admin@land-in.io", "password": "..." }
```

---

### POST `/api/admin/events`
이벤트 생성

**Admin Auth required**

---

### PATCH `/api/admin/events/{eventId}`
이벤트 수정

**Admin Auth required**

---

### POST `/api/admin/events/{eventId}/steps`
스텝 생성

**Admin Auth required**

---

### POST `/api/admin/nft-mints/{mintRequestId}/retry`
Fabric 기록 실패 민팅 수동 재동기화

`MINTED_BUT_FABRIC_RECORD_FAILED` 상태인 민팅 요청을 `NftRecordContract:ReconcileNFTMintFailure`로 복구한다.

**Admin Auth required**

**Response `200`:** MintRequestResponse

**Errors:**
- `404 NFT_MINT_REQUEST_NOT_FOUND`
- `502 FABRIC_NFT_RECORD_FAILED`

---

## 10. Fabric 원장 조회 (Admin)

Hyperledger Fabric `visitledger` 체인코드 원장을 직접 조회한다.  
모든 엔드포인트는 관리자 권한 필요. Fabric 미연결 시 `null` 반환.

### GET `/api/admin/fabric/visits/{visitId}`
방문 레코드 조회

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "visitId": "uuid",
    "userIdHash": "sha256...",
    "campaignId": "paris-spring-2026",
    "tagIdHash": "sha256...",
    "visitProofHash": "sha256...",
    "locationCode": "Eiffel Tower",
    "status": "VISIT_RECORDED",
    "visitedAt": "2026-05-16T12:00:00+00:00",
    "fabricTxId": "tx-id"
  }
}
```

---

### GET `/api/admin/fabric/visits/by-user/{userIdHash}`
사용자의 Fabric 방문 이력 전체 조회

**Response `200`:** `{ "data": [ FabricVisitRecord, ... ] }`

---

### GET `/api/admin/fabric/nfts/{mintRecordId}`
NFT 발급 레코드 조회

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "mintRecordId": "uuid",
    "visitId": "uuid",
    "draftId": "uuid",
    "userIdHash": "sha256...",
    "tokenId": "123456",
    "ownerAddress": "0x...",
    "imageCid": "QmXxx...",
    "metadataCid": "QmYyy...",
    "polygonTxHash": "0xabc...",
    "mintStatus": "FABRIC_RECORDED",
    "mintedAt": "2026-05-16T12:00:00+00:00",
    "fabricTxId": "tx-id"
  }
}
```

---

### GET `/api/admin/fabric/nfts/by-visit/{visitId}`
visitId로 연결된 NFT 발급 레코드 조회

**Response `200`:** FabricNftMintRecord

---

### GET `/api/admin/fabric/nfts/by-user/{userIdHash}`
사용자의 NFT 발급 이력 전체 조회

**Response `200`:** `{ "data": [ FabricNftMintRecord, ... ] }`

---

### GET `/api/admin/fabric/rewards/balance/{userIdHash}`
사용자의 Fabric 포인트 잔액 조회

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "userIdHash": "sha256...",
    "totalPoints": 300,
    "updatedAt": "2026-05-16T12:00:00+00:00"
  }
}
```

---

### GET `/api/admin/fabric/rewards/history/{userIdHash}`
사용자의 포인트 적립/사용 이력 전체 조회

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "rewardTxId": "uuid",
      "userIdHash": "sha256...",
      "visitId": "uuid",
      "mintRecordId": "uuid",
      "campaignId": "paris-spring-2026",
      "partnerId": "",
      "pointAmount": 100,
      "rewardType": "GRANT",
      "status": "COMPLETED",
      "grantedAt": "2026-05-16T12:00:00+00:00",
      "fabricTxId": "tx-id"
    }
  ]
}
```

---

## 에러 코드 레퍼런스

| ErrorCode | HTTP | 설명 |
|-----------|------|------|
| `USER_NOT_FOUND` | 404 | 사용자 없음 |
| `EMAIL_ALREADY_EXISTS` | 409 | 이메일 중복 |
| `INVALID_CREDENTIALS` | 401 | 인증 실패 |
| `EVENT_NOT_FOUND` | 404 | 이벤트 없음 |
| `EVENT_NOT_JOINABLE` | 400 | 참여 불가 이벤트 |
| `ALREADY_JOINED` | 409 | 이미 참여 중 |
| `NOT_JOINED` | 403 | 미참여 |
| `UNKNOWN_TAG` | 404 | 미등록 태그 |
| `TAG_INACTIVE` | 400 | 비활성 태그 |
| `STEP_ALREADY_DONE` | 409 | 이미 완료한 스텝 |
| `WRONG_ORDER` | 400 | 스텝 순서 미충족 |
| `NFT_NOT_FOUND` | 404 | NFT 없음 |
| `PHOTO_DRAFT_NOT_FOUND` | 404 | 사진 초안 없음 |
| `DRAFT_NOT_READY_FOR_IPFS` | 400 | IPFS 불가 상태 |
| `DUPLICATE_NFT_MINT` | 409 | 민팅 요청 중복 |
| `NFT_MINT_REQUEST_NOT_FOUND` | 404 | 민팅 요청 없음 |
| `MINT_NOT_READY_FOR_REWARD` | 400 | 포인트 지급 불가 상태 |
| `FABRIC_REWARD_FAILED` | 502 | Fabric 포인트 지급 실패 |
| `FABRIC_NFT_RECORD_FAILED` | 502 | Fabric NFT 기록 실패 |
| `REWARD_NOT_FOUND` | 404 | 리워드 없음 |
| `REWARD_NOT_AVAILABLE` | 400 | 사용 불가 리워드 |

---

## Hyperledger Fabric 체인코드 함수 매핑

| Spring 서비스 | Fabric 함수 | 방향 |
|--------------|------------|------|
| NfcService.verify() | `VisitContract:VerifyVisit` | submit (graceful) |
| FabricVisitGateway.getVisit() | `VisitContract:GetVisit` | evaluate |
| FabricVisitGateway.hasRecentVisit() | `VisitContract:HasRecentVisit` | evaluate |
| NftMintRequestService.mintPolygon() | `NftRecordContract:RecordNFTMint` | submit |
| NftMintRequestService.adminRetry() | `NftRecordContract:ReconcileNFTMintFailure` | submit |
| FabricNftGateway.getNftMintRecord() | `NftRecordContract:GetNftMintRecord` | evaluate |
| FabricNftGateway.findMintRecordByVisit() | `NftRecordContract:FindMintRecordByVisit` | evaluate |
| NftMintRequestService.grantReward() | `RewardContract:GrantPointAfterNFTMint` | submit |
| FabricRewardGateway.usePoint() | `RewardContract:UsePoint` | submit |
| FabricRewardGateway.getPointBalance() | `RewardContract:GetPointBalance` | evaluate |
| FabricRewardGateway.getVisitHistory() | `QueryContract:GetVisitHistoryByUser` | evaluate |
| FabricRewardGateway.getMintHistory() | `QueryContract:GetMintHistoryByUser` | evaluate |
| FabricRewardGateway.getRewardHistory() | `QueryContract:GetRewardHistoryByUser` | evaluate |

> **채널:** `channel1` | **체인코드:** `visitledger` | **MSP:** `Org1MSP`  
> **함수 호출 형식:** `"ContractName:FunctionName"` (contractapi 멀티컨트랙트 패턴)
