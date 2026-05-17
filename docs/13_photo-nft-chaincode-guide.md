# Land-In 사진 기반 NFT용 체인코드 / 스마트컨트랙트 파일 구성 가이드

> 작성일: 2026-05-16  
> 참고 문서:
> - `docs/Land-In_사진기반_NFT_기능기획서_시각화.pdf`
> - `docs/Land-In_사진기반_NFT_발행_기능기획서_v1.1_수정본.md`
> - `dev-mode/chaincode/*`
> - `dev-mode/land-in/contracts/LandinBadgeNFT.sol`
> - `dev-mode/land-in/backend/src/main/resources/application.yml`

## 1. 결론

사진 기반 NFT 기능은 블록체인을 아래처럼 **역할 분리**해서 파일을 만드는 게 가장 깔끔하다.

- Hyperledger Fabric:
  방문 인증, NFT 발급 기록, 포인트 지급/사용, 감사용 해시 기록
- 퍼블릭 체인(Polygon):
  실제 ERC-721 NFT 민팅과 소유권 공개 증명

즉, **Fabric 체인코드 1개에 다 몰아넣지 말고**, 도메인 기준으로 3~4개 계약으로 쪼개고, 퍼블릭체인은 별도 Solidity 컨트랙트로 유지하는 구조가 맞다.

---

## 2. 추천 디렉터리 구조

`dev-mode` 기준으로는 아래처럼 만드는 것을 추천한다.

```text
dev-mode/
├── chaincode/
│   ├── visitledger/
│   │   └── go/
│   │       ├── go.mod
│   │       ├── go.sum
│   │       ├── main.go
│   │       ├── contract/
│   │       │   ├── visit_contract.go
│   │       │   ├── nft_record_contract.go
│   │       │   ├── reward_contract.go
│   │       │   └── query_contract.go
│   │       ├── model/
│   │       │   ├── visit.go
│   │       │   ├── nft_mint_record.go
│   │       │   ├── reward_ledger.go
│   │       │   └── common.go
│   │       └── pkg/
│   │           ├── keys.go
│   │           ├── validation.go
│   │           └── hash.go
│   └── nftstore/
│       └── go/
│           └── nftstore.go
├── land-in/
│   ├── contracts/
│   │   ├── LandinBadgeNFT.sol
│   │   ├── LandinPhotoNFT.sol
│   │   ├── interfaces/
│   │   │   └── ILandinPhotoNFT.sol
│   │   ├── libraries/
│   │   │   └── LandinMetadataLib.sol
│   │   └── access/
│   │       └── LandinMinterRole.sol
│   └── backend/
│       └── src/main/java/com/landin/backend/domain/blockchain/
│           ├── fabric/
│           │   ├── FabricVisitGateway.java
│           │   ├── FabricNftGateway.java
│           │   └── FabricRewardGateway.java
│           └── polygon/
│               ├── PolygonMintGateway.java
│               └── PolygonMintPayload.java
```

핵심은 이거다.

- Fabric 샘플 체인코드(`dev-mode/chaincode/nftstore/go/nftstore.go`)는 참고만 하고
- 실제 사진 기반 NFT 기능은 `visitledger` 같은 **새 체인코드 패키지**로 분리
- Solidity는 기존 `LandinBadgeNFT.sol`을 유지하되, 사진 기반 NFT 전용 컨트랙트를 추가

---

## 3. Fabric 체인코드 파일을 이렇게 나누는 이유

기획서에서 Fabric 책임은 아래 3개다.

- `VerifyVisit()`
- `RecordNFTMint()`
- `GrantPointAfterNFTMint()`

여기에 조회와 포인트 사용까지 붙으면 한 파일이 금방 비대해진다. 그래서 파일을 아래처럼 나누는 게 맞다.

### 3.1 `main.go`

역할:

- Fabric chaincode 시작점
- 여러 contract 등록

예상 책임:

- `contractapi.NewChaincode(...)`
- `VisitContract`, `NftRecordContract`, `RewardContract`, `QueryContract` 등록

### 3.2 `contract/visit_contract.go`

역할:

- 방문 인증 원장 기록
- 중복 방문 방지
- 쿨다운 검증

핵심 함수:

- `VerifyVisit(ctx, visitId, userIdHash, campaignId, tagIdHash, visitProofHash, visitedAt, locationCode) error`
- `GetVisit(ctx, visitId) (*Visit, error)`
- `HasRecentVisit(ctx, userIdHash, tagIdHash) (bool, error)`

포인트:

- NFC UID 원문 저장 금지
- `userIdHash`, `tagIdHash`, `visitProofHash`만 저장

### 3.3 `contract/nft_record_contract.go`

역할:

- Polygon 민팅 성공 후 Fabric에 NFT 발급 사실 기록
- 동일 `visitId` 재민팅 방지 또는 정책 기반 허용 통제

핵심 함수:

- `RecordNFTMint(ctx, mintRecordId, visitId, draftId, tokenId, ownerAddress, imageCID, metadataCID, polygonTxHash, mintedAt) error`
- `GetNftMintRecord(ctx, mintRecordId) (*NftMintRecord, error)`
- `FindMintRecordByVisit(ctx, visitId) (*NftMintRecord, error)`

포인트:

- `Polygon mint 성공 -> Fabric 기록` 순서 보전
- 포인트 지급 전 Fabric 기록 완료 여부 확인

### 3.4 `contract/reward_contract.go`

역할:

- NFT 발급 완료 후 포인트 적립
- 포인트 사용
- 중복 보상 방지

핵심 함수:

- `GrantPointAfterNFTMint(ctx, rewardTxId, visitId, mintRecordId, userIdHash, campaignId, pointAmount, grantedAt) error`
- `UsePoint(ctx, rewardUseTxId, userIdHash, partnerId, pointAmount, usedAt) error`
- `GetPointBalance(ctx, userIdHash) (*RewardLedger, error)`

포인트:

- `visitId` 또는 `mintRecordId` 기준 멱등성 필요
- NFT 발급 없이 포인트만 먼저 적립되는 흐름 금지

### 3.5 `contract/query_contract.go`

역할:

- 관리자/백엔드 조회 전용 함수 분리

핵심 함수:

- `GetVisitHistoryByUser(ctx, userIdHash) ([]*Visit, error)`
- `GetMintHistoryByUser(ctx, userIdHash) ([]*NftMintRecord, error)`
- `GetRewardHistoryByUser(ctx, userIdHash) ([]*RewardLedgerEntry, error)`

이 파일을 분리하면 쓰기 트랜잭션 계약과 읽기 계약이 섞이지 않아서 관리가 쉬워진다.

---

## 4. Fabric 모델 파일 추천

### 4.1 `model/visit.go`

```go
type Visit struct {
    VisitID        string `json:"visitId"`
    UserIDHash     string `json:"userIdHash"`
    CampaignID     string `json:"campaignId"`
    TagIDHash      string `json:"tagIdHash"`
    VisitProofHash string `json:"visitProofHash"`
    LocationCode   string `json:"locationCode"`
    Status         string `json:"status"`
    VisitedAt      string `json:"visitedAt"`
    FabricTxID     string `json:"fabricTxId"`
}
```

### 4.2 `model/nft_mint_record.go`

```go
type NftMintRecord struct {
    MintRecordID   string `json:"mintRecordId"`
    VisitID        string `json:"visitId"`
    DraftID        string `json:"draftId"`
    UserIDHash     string `json:"userIdHash"`
    TokenID        string `json:"tokenId"`
    OwnerAddress   string `json:"ownerAddress"`
    ImageCID       string `json:"imageCid"`
    MetadataCID    string `json:"metadataCid"`
    PolygonTxHash  string `json:"polygonTxHash"`
    MintStatus     string `json:"mintStatus"`
    MintedAt       string `json:"mintedAt"`
    FabricTxID     string `json:"fabricTxId"`
}
```

### 4.3 `model/reward_ledger.go`

```go
type RewardLedgerEntry struct {
    RewardTxID    string `json:"rewardTxId"`
    UserIDHash    string `json:"userIdHash"`
    VisitID       string `json:"visitId"`
    MintRecordID  string `json:"mintRecordId"`
    CampaignID    string `json:"campaignId"`
    PointAmount   int    `json:"pointAmount"`
    RewardType    string `json:"rewardType"`
    Status        string `json:"status"`
    GrantedAt     string `json:"grantedAt"`
    FabricTxID    string `json:"fabricTxId"`
}
```

### 4.4 `pkg/keys.go`

역할:

- 복합 키 생성 규칙 통일

예시:

- `visit:{visitId}`
- `visitByUser:{userIdHash}:{visitId}`
- `mint:{mintRecordId}`
- `mintByVisit:{visitId}`
- `reward:{rewardTxId}`
- `rewardByUser:{userIdHash}:{rewardTxId}`

이 키 규칙을 별도 파일로 빼두면 체인코드가 커져도 유지보수가 쉽다.

---

## 5. 퍼블릭체인 Solidity 파일은 이렇게 가는 게 맞다

현재 `dev-mode/land-in/contracts/LandinBadgeNFT.sol`은 백엔드가 기대하는 시그니처가 명확하다.

```solidity
safeMint(address to, string tokenUri)
```

그래서 당장 운영 호환성을 생각하면 두 가지 안이 있다.

### 안 A. 기존 컨트랙트 유지 + 백엔드/오프체인에서 추가 데이터 관리

파일:

- `LandinBadgeNFT.sol` 유지

장점:

- 현재 `OnChainNftMintService`와 바로 호환
- 변경 범위가 작음

단점:

- `visitProofHash`, `regionCode`, `campaignId`가 온체인 구조체에 직접 남지 않음
- 추가 증명은 metadata 또는 Fabric에서만 추적

이 안은 MVP에 적합하다.

### 안 B. 사진 기반 NFT 전용 V2 컨트랙트 추가

파일:

- `LandinPhotoNFT.sol`
- `interfaces/ILandinPhotoNFT.sol`
- `access/LandinMinterRole.sol`
- `libraries/LandinMetadataLib.sol`

장점:

- 기획서의 확장 시그니처 반영 가능
- 사진 기반 NFT용 속성 분리 가능

단점:

- 백엔드 `mintFunctionName`, ABI 인코딩, receipt 파싱 수정 필요

사진 기반 NFT 기획이 본선 구조라면 장기적으로는 **안 B**가 더 맞다.

---

## 6. 추천 Solidity 파일별 역할

### 6.1 `LandinPhotoNFT.sol`

역할:

- 사진 기반 NFT 발행 메인 컨트랙트
- ERC-721 민팅
- 토큰별 방문 증명 메타 저장

추천 상태값:

```solidity
struct VisitMintProof {
    bytes32 visitProofHash;
    string regionCode;
    string campaignId;
    string metadataCID;
    uint64 mintedAt;
}
```

추천 함수:

- `safeMint(address to, string calldata tokenURI_)`
- `safeMintWithProof(address to, string calldata tokenURI_, bytes32 visitProofHash, string calldata regionCode, string calldata campaignId)`
- `getVisitMintProof(uint256 tokenId) external view returns (...)`

주의:

- 기존 백엔드와 맞추려면 `safeMint(address,string)`는 남겨두는 편이 안전하다.
- 새 함수는 확장 함수로 추가하는 방식이 낫다.

### 6.2 `interfaces/ILandinPhotoNFT.sol`

역할:

- 백엔드 또는 다른 컨트랙트가 사용할 인터페이스 분리

추천 함수 선언:

- `safeMint(address to, string calldata tokenURI_) external returns (uint256);`
- `safeMintWithProof(...) external returns (uint256);`
- `tokenURI(uint256 tokenId) external view returns (string memory);`

### 6.3 `access/LandinMinterRole.sol`

역할:

- 민터 권한 분리
- `owner`, `minter`, 추후 `relayer` 권한 구분

현재 `LandinBadgeNFT.sol` 안에 있는 `setMinter` 개념을 재사용 가능하다.

### 6.4 `libraries/LandinMetadataLib.sol`

역할:

- 문자열/검증 유틸 분리

예시:

- 빈 문자열 검증
- region code 포맷 검증
- CID 길이/형식 기초 검증

복잡하지 않다면 없어도 되지만, 사진 기반 속성이 더 붙으면 분리 가치가 생긴다.

---

## 7. 백엔드와 맞물리는 파일도 같이 정리해야 한다

체인코드/컨트랙트 파일만 만들고 끝나면 안 된다. `dev-mode` 기준으로 아래 파일도 같이 정리해야 한다.

### Fabric 연동 쪽

- `backend/.../fabric/FabricVisitGateway.java`
  - `VerifyVisit()` 호출
- `backend/.../fabric/FabricNftGateway.java`
  - `RecordNFTMint()` 호출
- `backend/.../fabric/FabricRewardGateway.java`
  - `GrantPointAfterNFTMint()`, `UsePoint()` 호출

지금 `application.yml`에 있는 설정:

- `fabric-gateway.enabled`
- `fabric-gateway.url`

이 설정 구조는 계속 유지하는 게 맞다.

### Polygon 연동 쪽

- `backend/.../polygon/PolygonMintGateway.java`
  - `safeMint()` 또는 `safeMintWithProof()` 호출
- `backend/.../polygon/PolygonMintPayload.java`
  - `walletAddress`, `tokenURI`, `visitProofHash`, `regionCode`, `campaignId`

현재는 `OnChainNftMintService`가 직접 Web3j를 많이 들고 있으니, 사진 기반 NFT 기능이 커지면 Polygon 호출부를 별도 gateway로 빼는 게 좋다.

---

## 8. 실제 구현 우선순위

### 1단계: MVP

파일 생성:

- `dev-mode/chaincode/visitledger/go/main.go`
- `dev-mode/chaincode/visitledger/go/contract/visit_contract.go`
- `dev-mode/chaincode/visitledger/go/contract/nft_record_contract.go`
- `dev-mode/chaincode/visitledger/go/contract/reward_contract.go`
- `dev-mode/chaincode/visitledger/go/model/*.go`
- `dev-mode/land-in/contracts/LandinPhotoNFT.sol`

정책:

- Solidity는 우선 `safeMint(address,string)` 유지
- 추가 방문 증명 값은 Fabric과 DB에 우선 저장
- Polygon에는 `tokenURI` 중심으로만 민팅

### 2단계: 기능 확장

추가:

- `safeMintWithProof(...)`
- Fabric 조회 계약 강화
- 관리자 감사/재시도용 조회 함수 추가

### 3단계: 상용화 구조

추가:

- 리워드 정산 전용 체인코드 분리 가능
- 월별 정산 해시 퍼블릭체인 앵커링 컨트랙트 추가 가능

---

## 9. 최종 추천안

이번 요구사항 기준으로는 아래처럼 가는 게 가장 현실적이다.

### Fabric

- 새 체인코드 패키지명: `visitledger`
- 내부 계약 파일:
  - `visit_contract.go`
  - `nft_record_contract.go`
  - `reward_contract.go`
  - `query_contract.go`

### 퍼블릭체인

- 단기:
  `LandinBadgeNFT.sol` 호환 유지 또는 `LandinPhotoNFT.sol`에서 동일 시그니처 제공
- 중기:
  `safeMintWithProof(...)` 확장

### 이유

- 기획서의 핵심 상태 분리
  - 방문 인증
  - NFT 발급 기록
  - 포인트 지급
- `dev-mode` 현재 구조와 충돌이 적음
- 사진 기반 NFT 확장 시 파일이 덜 꼬임

---

## 10. 한 줄 정리

**Fabric은 `방문/민팅기록/포인트` 계약으로 분리하고, Polygon은 `ERC-721 사진 NFT` 컨트랙트로 별도 유지하되, 현재 백엔드 호환 때문에 `safeMint(address,string)`는 당분간 반드시 남겨두는 설계가 가장 안전하다.**
