# Land-In: NFC 방문 인증 후 사용자 사진 기반 NFT 발행 기능 기획서
> 작성 기준일: 2026-05-16 | 버전: v1.1 | 대상: 개발팀 / PM / 디자이너  
> 본 문서는 기존 서비스 기획서(`10_service-plan.md`), DB 스키마(`db-table-structure-3.sql`), 지침서(`jicim.md`)를 바탕으로 작성되었습니다.

***
## 0. 확정 기술 전제
| 항목 | 확정 값 |
|------|---------|
| 사용자 앱 | React Native (Android 우선, iOS NFC는 Phase 2 리스크) |
| 백엔드 | Spring Boot 3.5 + JPA + MySQL 8 |
| 방문 인증 | NTAG 424 DNA NFC 태그 + SUN/SDM 검증 |
| 포인트/방문 원장 | Hyperledger Fabric |
| 퍼블릭 NFT 체인 | Polygon PoS (Mainnet 또는 Amoy Testnet) |
| NFT 표준 | ERC-721 |
| 이미지/metadata 저장 | IPFS (Pinata 또는 NFT.Storage) |
| tokenURI 형식 | `ipfs://{metadataCID}` |
| 임시 저장 | AWS S3 / R2 (원본·편집본·썸네일·검수본) |
| 지갑 | MetaMask Mobile, WalletConnect v2, Embedded Wallet(검토) |
| 가스비 | Polygon 저비용 mint + Gasless Relayer 우선 검토 |
| 관리자 웹 | React Admin Dashboard |

**핵심 원칙:**
- Web NFC / Web Camera 중심 설계 금지 → React Native 네이티브 기능 기준
- tokenURI에 S3 URL 금지 → 반드시 IPFS CID 사용
- 개인정보·사진 원본·얼굴 정보는 Polygon / Fabric에 직접 저장 금지
- 포인트 지급은 NFT 발행 완료 후 처리하며, 방문 인증·NFT mint·포인트 지급은 별도 상태로 관리 (부분 성공 처리 필수)

***
## 1. 기능 개요
### 1.1 기능 목적
Land-In은 외국인 관광객이 한국의 관광지·랜드마크를 방문하고, 현장 NFC 태그를 스캔하여 방문을 인증하면 포인트와 NFT 스탬프를 받는 관광 리워드 플랫폼이다.

**이번 기능 변경의 핵심:** NFC 인증 성공 후 시스템이 자동 생성하던 NFT 이미지를, **사용자가 현장에서 직접 촬영한 사진**으로 대체하여 관광객의 고유한 방문 기록이 NFT로 발행되도록 한다.
### 1.2 기술 구조 요약
```
React Native App
  ├── NFC 스캔 (react-native-nfc-manager)
  ├── 인앱 카메라 (react-native-vision-camera)
  ├── 사진 편집 UI
  └── WalletConnect / MetaMask 연동
        ↓
Spring Boot API
  ├── SUN/SDM 검증 (NTAG 424 DNA)
  ├── Hyperledger Fabric SDK → VerifyVisit()
  ├── S3 임시 이미지 저장
  ├── IPFS 이미지/metadata 업로드
  ├── Polygon ERC-721 mint (Gasless Relayer)
  ├── Fabric RecordNFTMint()
  └── Fabric GrantPointAfterNFTMint()
        ↓
저장소
  ├── MySQL: 사용자·방문·포인트·사진 초안·민팅 상태
  ├── S3: 원본·편집본·썸네일 (임시/영구)
  ├── IPFS: 최종 NFT 이미지 + metadata JSON
  ├── Polygon: tokenId·ownerAddress·tokenURI(ipfs://)
  └── Fabric: 방문 증명·NFT 발급·포인트 지급 원장
```

***
## 2. 최종 처리 흐름 요약
| 항목 | 최종 설계 |
|------|----------|
| NFT 이미지 생성 | 사용자가 현장에서 촬영한 사진 1장 선택 |
| 핵심 처리 순서 | **NFC 스캔 → 카메라 실행 → 사진 촬영 → NFT 발행 → 포인트 지급** |
| NFC 인증 역할 | 방문 위치·시간·태그 진위 검증 및 `visitId` 생성. 이 시점에는 포인트를 지급하지 않음 |
| NFT 발행 시점 | 사진 선택·편집 후 사용자가 직접 트리거. 즉시 발행 또는 나중에 발행 가능 |
| 포인트 지급 시점 | **Polygon NFT mint 성공 + Fabric NFT 기록 완료 후** 지급 |
| 지갑 연결 시점 | 회원가입 직후 선택 연결 페이지 제공. “나중에 연결하기”로 스킵 가능. 단, NFT 발행 직전 지갑이 없으면 연결 필수 |
| 사진 저장 위치 | S3/R2 임시 저장 → IPFS 최종 저장 |
| tokenURI 구조 | `ipfs://{metadataCID}` |
| 실패 처리 | NFT 발행 실패 시 포인트 미지급, Draft 보전 후 재시도. 포인트 지급 실패 시 NFT 발행 사실은 보전하고 서버 재시도 |
| 관리자 검수 여부 | 사용자 사진 부적절 이미지 필터링 필요 |
| 법적 리스크 | 초상권·개인정보·저작권 리스크 존재. 약관·신고·삭제 대응 정책 필요 |

***
## 3. 문제 정의

### 3.1 사진 원본의 블록체인 저장 불가
Polygon 온체인에는 수 MB의 이미지를 직접 저장할 수 없다. 이미지는 IPFS에 저장하고, tokenURI에는 `ipfs://{metadataCID}` CID만 기록한다. 원본·편집본은 S3에 임시 보관 후 IPFS 업로드 성공 시 정책에 따라 삭제 또는 백업 보관한다.

### 3.2 IPFS 업로드 후 수정 불가 문제
IPFS는 콘텐츠 주소 체계(CID)이므로 발행 후 이미지 변경 시 CID가 변경된다. **정책:** IPFS 업로드 전에 사용자가 최종 확인 단계를 거치도록 한다. 발행 전 Draft 단계에서 편집을 완결하고, 민팅 후 수정은 원칙적으로 불가(Dynamic NFT 구조는 Phase 3 검토).

### 3.3 NFT 발행 후 포인트 지급 상태 관리 필요
방문 인증, NFT mint, Fabric NFT 기록, 포인트 지급은 서로 다른 단계다. 따라서 `NFC 인증 성공 + 사진 초안 저장`, `NFT 발행 실패 + 포인트 미지급`, `NFT 발행 성공 + 포인트 지급 실패` 상태를 각각 분리 관리해야 한다. 사용자는 사진 초안을 나중에 다시 발행할 수 있고, NFT 발행 후 포인트 지급 실패는 서버 재시도 큐와 운영자 확인으로 복구한다.

### 3.4 지갑/가스비 UX 마찰
MetaMask 미설치, 지갑 연결 취소, 가스비 부족 등은 일반 관광객에게 큰 진입 장벽이다. **대응:** 회원가입 직후 지갑 연결 안내를 제공하되 “나중에 연결하기”를 허용한다. 앱 탐색, NFC 인증, 사진 촬영, Draft 저장은 지갑 없이 가능하게 하고, NFT 발행 직전에만 지갑 연결을 필수화한다. Gasless Relayer를 사용하여 사용자가 가스비를 직접 부담하지 않도록 한다.

***
## 4. 전체 사용자 플로우
### 4.1 메인 플로우 (단계별 처리 주체)
| # | 단계 | 사용자 행동 | RN 앱 처리 | Spring Boot | DB | IPFS | Polygon | Fabric |
|---|------|------------|-----------|-------------|-----|------|---------|--------|
| 1 | 회원가입/로그인 | 이메일·소셜 로그인 | JWT 저장 | 사용자 생성/인증 | users | - | - | - |
| 2 | 지갑 연결 안내 | “연결하기” 또는 “나중에 연결하기” 선택 | WalletConnect/MetaMask 연결 또는 스킵 | 연결 시 `/api/mobile/wallet/connect` | wallets(선택) | - | - | - |
| 3 | 캠페인 탐색 | 이벤트 카드 선택 | 목록 렌더링 | `GET /api/events` | events, steps | - | - | - |
| 4 | 관광지 방문 | 랜드마크 현장 도착 | - | - | - | - | - | - |
| 5 | NFC 스캔 | 태그에 폰을 접촉 | `react-native-nfc-manager` 태그 읽기 | `POST /api/mobile/nfc/verify` | nfc_scan_logs | - | - | - |
| 6 | SUN/SDM 검증 | (백그라운드) | 스캔 결과 대기 | NTAG 424 DNA 검증 | visits(PHOTO_REQUIRED) | - | - | VerifyVisit() |
| 7 | 카메라 권한 요청 | 권한 허용 탭 | 시스템 권한 다이얼로그 | - | - | - | - | - |
| 8 | 사진 촬영 | 랜드마크 사진 여러 장 촬영 | `react-native-vision-camera` | - | photo_assets(메타) | - | - | - |
| 9 | 사진 선택 | 후보 중 1장 선택 | 선택 화면 렌더링 | - | photo_drafts(DRAFT_CREATED) | - | - | - |
| 10 | 사진 편집 | 필터·프레임·배지·날짜 적용 | 로컬 편집 | - | photo_drafts(EDITING) | - | - | - |
| 11 | 민팅 방식 선택 | “지금 발행” 또는 “나중에 발행” 탭 | 분기 처리 | - | photo_drafts 상태 업데이트 | - | - | - |
| 12 | 지갑 확인/연결 | 미연결 시 지갑 연결 승인 | 연결 상태 확인, 미연결 시 WalletConnect 실행 | `/api/mobile/wallet/connect` | wallets | - | - | - |
| 13a | (즉시) 이미지 업로드 | (백그라운드) | S3 업로드 → IPFS 요청 | 이미지 검수·압축·IPFS 업로드 | nft_mint_requests, ipfs_pin_logs | imageCID 저장 | - | - |
| 13b | (즉시) metadata 생성 | (백그라운드) | IPFS 진행 표시 | metadata JSON 생성·IPFS 업로드 | nft_metadata | metadataCID 저장 | - | - |
| 14 | Polygon mint | (백그라운드) | mint 진행 표시 | ERC-721 safeMint 호출 | nft_mint_requests(POLYGON_MINTED) | - | txHash 수신 | - |
| 15 | NFT 발급 기록 | (백그라운드) | 완료 대기 | RecordNFTMint() 호출 | nft_mint_requests(FABRIC_RECORDED) | - | - | tokenId·txHash·CID 기록 |
| 16 | 포인트 지급 | 완료 화면 대기 | 포인트 지급 결과 표시 | GrantPointAfterNFTMint() 호출 | point_transactions, visit_rewards | - | - | 포인트 원장 기록 |
| 17 | NFT 발급 + 포인트 완료 | 완료 화면 확인 | NFT 카드·포인트 렌더링 | 최종 상태 반환 | user_nfts(MINTED_ONCHAIN), point_transactions | - | - | - |
| 18 | 내 컬렉션 확인 | 컬렉션 탭 이동 | NFT 목록 표시 | `GET /api/mobile/users/me/nfts` | user_nfts | IPFS gateway URL | - | - |
| 19 | NFT 공유 | SNS 공유 버튼 | 공유 시트 | - | - | - | - | - |
| 20 | 포인트 사용 | 가맹점에서 QR 스캔 | QR 스캐너 | `POST /api/mobile/points/use` | point_transactions | - | - | UsePoint() |

**정책:** NFC 검증 성공 직후에는 포인트를 지급하지 않는다. 포인트는 NFT가 실제로 발급되고 Fabric에 NFT 발급 기록이 남은 뒤 지급한다.

### 4.2 “나중에 발행” 분기 플로우
```
NFC 인증 성공 → 카메라 실행 → 사진 촬영 → 사진 선택
→ “나중에 발행” 선택
→ photoDraft 생성 (상태: DRAFT_CREATED)
→ 로컬 + S3 임시 저장 (상태: UPLOADED_TO_S3)
→ 앱에 “사진 저장 완료, 내 NFT 초안에서 확인하세요” 표시
→ [이후 언제든지] 내 NFT 초안 페이지 진입
→ 사진 편집 (필터·프레임·지역 배지·날짜 스탬프)
→ “NFT 발행하기” 버튼
→ 지갑 연결 확인 (미연결 시 연결 필수)
→ IPFS 업로드 → Polygon mint → Fabric NFT 기록
→ 포인트 지급
→ 내 컬렉션 반영
```

***
## 5. 즉시 NFT 발행 플로우 (상세)
### 5.1 시퀀스 다이어그램
```
사용자 앱                Spring Boot             Fabric              S3            IPFS           Polygon
   |                        |                      |                  |               |               |
   |-- NFC 태그 스캔 ------->|                      |                  |               |               |
   |                        |-- SUN/SDM 검증 ------>|                  |               |               |
   |                        |-- VerifyVisit() ------------------------>|                             |
   |                        |<-- 방문 인증 완료 (visitId) --------------|                             |
   |<-- "사진 촬영 안내" ----|                      |                  |               |               |
   |                        |                      |                  |               |               |
   |-- 인앱 카메라 실행 ---> (로컬)                 |                  |               |               |
   |-- 사진 여러 장 촬영 --> (로컬 임시 저장)        |                  |               |               |
   |-- 사진 1장 선택 ------->|                      |                  |               |               |
   |-- "지금 발행" 선택 ---->|                      |                  |               |               |
   |-- 지갑 상태 확인 ------>|                      |                  |               |               |
   |<-- 미연결이면 연결 요청 -|                      |                  |               |               |
   |-- 지갑 연결 승인 ------>|                      |                  |               |               |
   |                        |-- 원본 업로드 -------------------------->|               |               |
   |                        |-- 이미지 검수/압축/리사이즈               |               |               |
   |                        |-- S3 저장 (원본/편집본/썸네일) ---------->|               |               |
   |                        |-- IPFS 이미지 업로드 ----------------------------------------->|          |
   |                        |<-- imageCID -----------------------------------------------------|          |
   |                        |-- metadata JSON 생성                     |               |               |
   |                        |-- IPFS metadata 업로드 ----------------------------------->|              |
   |                        |<-- metadataCID --------------------------------------------------|        |
   |                        |-- ERC-721 safeMint(ownerAddress, ipfs://metadataCID) ------------------->|
   |                        |<-- txHash, tokenId ------------------------------------------------------|
   |                        |-- RecordNFTMint() --->|                  |               |               |
   |                        |<-- Fabric NFT 기록 완료 --|              |               |               |
   |                        |-- GrantPointAfterNFTMint() ----------->|                  |               |
   |                        |<-- 포인트 지급 완료 (pointAmount) -----|                  |               |
   |<-- "NFT 발급 + 포인트 지급 완료" ----|          |                  |               |
```

### 5.2 사용자 진행 상태 문구
| 단계 | 영어 | 한국어 |
|------|------|--------|
| NFC 인증 중 | Verifying your visit… | 방문을 확인하는 중입니다… |
| 방문 인증 완료 | Visit verified. Take a photo to mint your NFT. | 방문 인증 완료! NFT 발행을 위해 사진을 찍어주세요. |
| 카메라 준비 | Take a photo of this landmark | 랜드마크 사진을 찍어주세요 |
| 지갑 연결 요청 | Connect your wallet to mint NFT | NFT 발행을 위해 지갑을 연결하세요 |
| 업로드 중 | Uploading your photo… | 사진을 업로드하는 중입니다… |
| IPFS 처리 중 | Securing your photo on IPFS… | 사진을 안전하게 저장하는 중입니다… |
| 민팅 중 | Creating your NFT… | NFT를 발행하는 중입니다… |
| 포인트 지급 중 | Adding your points… | 포인트를 지급하는 중입니다… |
| 완료 | Your NFT is ready and points are added! | NFT 발급과 포인트 지급이 완료되었습니다! |

### 5.3 부분 실패 케이스 처리
| 실패 지점 | 상태 | 포인트 지급 | 사진 보전 | 재시도 방법 |
|----------|------|-----------|----------|-----------|
| Fabric 방문 인증 실패 | VISIT_RECORD_FAILED | ❌ | ❌ | NFC 재스캔 또는 서버 재시도 |
| IPFS 이미지 업로드 실패 | IMAGE_PINNING_FAILED | ❌ | S3 백업 있음 | “내 NFT 초안”에서 재시도 |
| Polygon mint 실패 | POLYGON_MINT_FAILED | ❌ | IPFS CID 보전 | “내 NFT 초안”에서 재시도 |
| mint 성공·Fabric NFT 기록 실패 | MINTED_BUT_FABRIC_RECORD_FAILED | 보류 | IPFS CID·txHash 보전 | 서버 재시도 큐에 자동 편입 |
| NFT 기록 성공·포인트 지급 실패 | REWARD_FAILED_AFTER_MINT | 보류 | NFT 발행 사실 보전 | 서버 자동 재시도(3회) + 운영자 수동 확인 |

***
## 6. 나중에 NFT 발행 플로우 (Draft)
### 6.1 Draft 정책
| 항목 | 정책 |
|------|------|
| Draft 보관 기간 | 기본 30일 (캠페인 종료일 + 7일 중 짧은 것) |
| 만료 알림 | 만료 3일 전 푸시 알림 발송 |
| 만료 후 처리 | Draft 상태 `EXPIRED`로 전환, S3 원본 삭제 예약 |
| 삭제 정책 | 사용자가 직접 삭제 가능 (단, IPFS 업로드 완료 후 민팅 전 단계까지만) |
| 앱 삭제/재설치 | Draft는 서버(S3 + MySQL)에 저장되므로 재설치 후 로그인 시 복구 가능 |
| 오프라인 촬영 | 로컬 임시 저장 후, 온라인 복구 시 서버 업로드 가능 (로컬 큐 방식) |
| 지갑 미연결 | Draft 저장까지는 지갑 불필요. 발행 시점에 연결 여부를 확인하고, 미연결이면 지갑 연결 요청 |
### 6.2 "나중에 발행" 화면 흐름
```
내 NFT 초안 페이지 (/my-drafts)
├── Draft 목록 (썸네일 + 랜드마크명 + 남은 기간)
├── Draft 카드 선택
│   ├── 사진 편집 화면
│   │   ├── 필터 적용 (흑백·빈티지·선명 등)
│   │   ├── NFT 프레임 선택 (지역별 테마 프레임)
│   │   ├── 지역 배지 적용 (서울·부산·제주 등)
│   │   └── 날짜 스탬프 적용
│   └── "NFT 발행하기" 버튼
│       ├── 지갑 연결 확인 (미연결 시 연결 필수)
│       ├── IPFS 업로드 (이미지 → metadata)
│       └── Polygon mint → Fabric NFT 기록 → 포인트 지급
└── 내 컬렉션으로 이동
```

***
## 7. 실패/재시도 플로우
### 7.1 실패 케이스별 처리 정의
| 실패 케이스 | 상태값 | 사용자 안내 문구 | 서버 재시도 | 사용자 재시도 | 운영자 개입 |
|-----------|--------|----------------|-----------|-------------|-----------|
| NFC 검증 실패 (태그 위조/만료) | NFC_FAILED | “인증에 실패했습니다. NFC 태그에 다시 접촉해주세요.” | ❌ | ✅ 재스캔 | ❌ |
| 방문 기록 생성 실패 | VISIT_RECORD_FAILED | “방문 인증 기록 생성에 실패했습니다. 잠시 후 다시 시도해주세요.” | ✅ 최대 3회 | ✅ 재스캔 | ✅ 3회 실패 시 |
| 카메라 권한 거부 | PHOTO_REQUIRED | “카메라 권한이 필요합니다. 설정에서 허용해주세요.” | ❌ | ✅ 설정 이동 | ❌ |
| 사진 촬영 중 앱 종료 | LOCAL_SAVED | “이전에 찍은 사진이 있습니다. 이어서 진행하시겠습니까?” | ❌ | ✅ Draft 복구 | ❌ |
| 사진 업로드 실패 | UPLOADING_FAILED | “사진 업로드에 실패했습니다. 네트워크 연결을 확인해주세요.” | ✅ 2회 | ✅ 재업로드 | ❌ |
| 이미지 검수 실패 (부적절 이미지) | MODERATION_FAILED | “해당 사진은 NFT로 발행할 수 없습니다. 다른 사진을 선택해주세요.” | ❌ | ✅ 다른 사진 선택 | ✅ 관리자 확인 |
| 지갑 연결 취소 | WALLET_REQUIRED | “NFT 발행을 위해 지갑 연결이 필요합니다. 나중에 다시 발행할 수 있습니다.” | ❌ | ✅ | ❌ |
| IPFS 이미지 업로드 실패 | IMAGE_PINNING_FAILED | “사진을 안전하게 저장하는 중 오류가 발생했습니다. 사진은 임시 저장되어 있습니다.” | ✅ 3회 | ✅ 내 초안에서 재시도 | ❌ |
| metadata 생성/업로드 실패 | METADATA_UPLOADING_TO_IPFS | “NFT 정보 생성 중 오류가 발생했습니다. 사진은 안전하게 보관 중입니다.” | ✅ 3회 | ✅ | ❌ |
| Polygon mint 실패 | POLYGON_MINT_FAILED | “NFT 발급이 완료되지 않았습니다. 포인트는 NFT 발급 완료 후 지급됩니다.” | ✅ 2회 | ✅ 내 초안에서 재시도 | ❌ |
| Polygon pending 장기화 | POLYGON_MINT_PENDING | “NFT 발급을 완료하는 중입니다. 잠시 후 확인해주세요.” | ✅ 상태 폴링 | ❌ | ❌ |
| mint 성공, Fabric NFT 기록 실패 | MINTED_BUT_FABRIC_RECORD_FAILED | “NFT는 발급되었습니다. 포인트 지급 전 기록을 동기화하고 있습니다.” | ✅ 자동 큐 | ❌ | ✅ 미해결 시 |
| NFT 기록 성공, 포인트 지급 실패 | REWARD_FAILED_AFTER_MINT | “NFT는 발급되었습니다. 포인트는 자동으로 다시 지급됩니다.” | ✅ 최대 3회 | ❌ | ✅ 3회 실패 시 |
| 네트워크 불안정 | 이전 상태 유지 | “네트워크 연결이 불안정합니다. 연결 후 자동으로 이어집니다.” | ✅ | ✅ | ❌ |

***
## 8. 상태 모델
### 8.1 Visit 상태 전이표
| 상태 | 의미 | 생성 시점 | 다음 상태 |
|------|------|----------|----------|
| `NFC_PENDING` | NFC 스캔 완료, 검증 대기 | 앱이 태그 데이터 전송 시 | NFC_VERIFIED / NFC_FAILED |
| `NFC_VERIFIED` | SUN/SDM 검증 성공 | Spring Boot 검증 성공 | VISIT_RECORDED |
| `NFC_FAILED` | 검증 실패 | 검증 오류 발생 | 종료 또는 재스캔 가능 |
| `VISIT_RECORDED` | Fabric에 방문 인증 기록 완료 | VerifyVisit() 커밋 | PHOTO_REQUIRED |
| `VISIT_RECORD_FAILED` | 방문 인증 기록 실패 | Fabric 오류 | 재시도 또는 운영자 처리 |
| `PHOTO_REQUIRED` | 카메라 실행 대기 | 방문 인증 완료 후 | NFT_DRAFT_CREATED |
| `NFT_DRAFT_CREATED` | 사진 초안 생성 완료 | 사진 선택 후 | MINT_PENDING / DRAFT_SAVED |
| `MINT_PENDING` | NFT 발행 처리 중 | 사용자가 “지금 발행” 선택 | NFT_MINTED / MINT_FAILED |
| `NFT_MINTED` | Polygon mint 및 Fabric NFT 기록 완료 | RecordNFTMint() 완료 | REWARD_PENDING |
| `REWARD_PENDING` | 포인트 지급 처리 중 | NFT 기록 완료 후 | REWARD_GRANTED / REWARD_FAILED_AFTER_MINT |
| `REWARD_GRANTED` | 포인트 지급 완료 | GrantPointAfterNFTMint() 완료 | COMPLETED |
| `REWARD_FAILED_AFTER_MINT` | NFT 발급 후 포인트 지급 실패 | 포인트 지급 오류 | 서버 재시도 또는 운영자 처리 |
| `COMPLETED` | NFT + 포인트 모두 완료 | mint 성공 + 포인트 지급 완료 | 종료 |

### 8.2 Photo Draft 상태 전이표
| 상태 | 의미 | DB 컬럼 |
|------|------|--------|
| `DRAFT_CREATED` | 사진 선택 직후 초안 생성 | `status` |
| `LOCAL_SAVED` | 앱 로컬 임시 저장 완료 | `local_path` |
| `UPLOADING` | S3 업로드 진행 중 | `upload_started_at` |
| `UPLOADED_TO_S3` | S3 저장 완료 | `s3_original_url` |
| `EDITING` | 사용자 편집 중 | `edited_s3_url` |
| `SELECTED_FOR_MINT` | 최종 이미지 확정 | `final_image_s3_url` |
| `READY_FOR_IPFS` | IPFS 업로드 준비 완료 | `moderation_status = APPROVED` |
| `EXPIRED` | Draft 보관 기간 만료 | `expired_at` |
| `DELETED` | 사용자 또는 정책에 의한 삭제 | `deleted_at` |

### 8.3 NFT Mint 상태 전이표
| 상태 | 의미 | 사용자 화면 문구 | 관리자 화면 |
|------|------|---------------|-----------|
| `NOT_STARTED` | 민팅 미시작 | - | 미발행 |
| `WALLET_REQUIRED` | 지갑 미연결 | “지갑 연결이 필요합니다” | 지갑 미연결 대기 |
| `WALLET_CONNECTED` | 지갑 연결 완료 | “NFT 발행 준비 완료” | 지갑 연결됨 |
| `POLYGON_MINT_REQUESTED` | mint 트랜잭션 제출 | “NFT를 발행하는 중입니다…” | 민팅 요청 중 |
| `POLYGON_MINT_PENDING` | 트랜잭션 pending | “NFT 발급을 완료하는 중입니다.” | 체인 처리 중 |
| `POLYGON_MINTED` | mint 성공, txHash 수신 | “NFT 발급 완료!” | 민팅 성공 |
| `POLYGON_MINT_FAILED` | mint 실패 | “NFT 발급이 완료되지 않았습니다. 사진은 안전하게 저장되어 있습니다.” | 민팅 실패 (재시도 버튼) |
| `FABRIC_RECORD_PENDING` | Fabric NFT 기록 중 | “NFT 기록을 동기화하는 중입니다.” | Fabric 기록 대기 |
| `FABRIC_RECORDED` | Fabric NFT 기록 완료 | “포인트를 지급하는 중입니다.” | 포인트 지급 대기 |
| `FABRIC_RECORD_FAILED` | Fabric NFT 기록 실패 | “NFT는 발급되었습니다. 기록 동기화 중입니다.” | Fabric 재시도 필요 |
| `REWARD_PENDING` | 포인트 지급 중 | “포인트를 지급하는 중입니다.” | 포인트 지급 대기 |
| `REWARD_GRANTED` | 포인트 지급 완료 | “포인트 지급 완료!” | 지급 완료 |
| `REWARD_FAILED_AFTER_MINT` | NFT 발급 후 포인트 지급 실패 | “NFT는 발급되었습니다. 포인트는 자동으로 다시 지급됩니다.” | 포인트 지급 재시도 필요 |
| `MINT_COMPLETED` | 전체 완료 | - | 발행 완료 |
| `MINTED_BUT_FABRIC_RECORD_FAILED` | mint 성공·Fabric 실패 | “NFT는 발급되었습니다.” | 불일치 경고 (수동 처리 필요) |

***
## 9. 사용자 앱 화면 설계 (React Native)
### 9.1 신규/변경 화면 목록
| # | 화면명 | Route | 목적 |
|---|--------|-------|------|
| 1 | 홈/캠페인 발견 | `/` | 이벤트 카드 목록 표시 |
| 2 | 컬렉션 상세 | `/event/:eventId` | 스텝·방문 현황·보상 안내 |
| 3 | NFC 방문 인증 | `/tag` | NFC 스캔 안내 및 실행 |
| 4 | NFC 검증 중 | (모달) | 검증 진행 애니메이션 |
| 5 | 방문 인증 성공 | (모달) | 방문 인증 완료 + 카메라 유도 |
| 6 | **인앱 카메라** | `/camera/:visitId` | 랜드마크 사진 촬영 화면 |
| 7 | **사진 후보 선택** | `/photo-select/:visitId` | 촬영된 사진 그리드 + 1장 선택 |
| 8 | **사진 편집** | `/photo-edit/:draftId` | 필터·프레임·배지·날짜 스탬프 |
| 9 | **NFT 미리보기** | `/nft-preview/:draftId` | 최종 NFT 이미지 확인 |
| 10 | **민팅 방식 선택** | (모달) | "지금 발행" / "나중에 발행" |
| 11 | 지갑 연결 | `/wallet/connect` | 회원가입 직후 선택 연결 또는 NFT 발행 직전 필수 연결 |
| 12 | **IPFS 업로드 진행** | (모달) | 단계별 업로드 진행 표시 |
| 13 | **NFT 발급 진행** | (모달) | 민팅 트랜잭션 진행 표시 |
| 14 | NFT 발급 완료 | (모달) | 완료 화면 + 공유 버튼 |
| 15 | NFT 발급 실패/재시도 | (모달) | 오류 안내 + 재시도 버튼 |
| 16 | 내 컬렉션 | `/collection` | 발급된 NFT 갤러리 |
| 17 | **내 NFT 초안** | `/my-drafts` | Draft 목록 + 이어서 발행 |
| 18 | NFT 상세 | `/nft/:nftId` | NFT 이미지·메타데이터·Polygon 링크 |
| 19 | 포인트 내역 | `/points` | 포인트 적립/사용 내역 |
| 20 | 마이페이지/지갑 관리 | `/mypage` | 지갑 연결·해제·통계 |
### 9.2 핵심 화면 설계
#### 화면 6: 인앱 카메라 (`/camera/:visitId`)
- **목적:** 사용자가 현장에서 랜드마크 사진을 촬영
- **주요 UI:** 카메라 뷰파인더, 촬영 버튼, 촬영 횟수 표시 (최대 10장), 랜드마크 가이드 오버레이
- **사용자 액션:** 촬영, 촬영 취소, 갤러리에서 선택 (옵션)
- **API 호출:** 없음 (로컬 처리)
- **표시할 정보:** 랜드마크명, 촬영 수, 남은 횟수
- **숨길 정보:** visitId, 내부 상태값
- **오류 처리:** 카메라 권한 없음 → 설정 이동 안내
- **다국어 문구 예시:**
  - EN: "Take photos of the landmark (up to 10)"
  - KO: "랜드마크 사진을 찍어주세요 (최대 10장)"
  - JA: "ランドマークの写真を撮ってください（最大10枚）"
  - ZH: "请拍摄地标照片（最多10张）"

#### 화면 7: 사진 후보 선택 (`/photo-select/:visitId`)
- **목적:** 촬영된 사진 중 NFT 이미지로 사용할 1장 선택
- **주요 UI:** 사진 그리드 (썸네일), 선택 체크박스, "다음" 버튼
- **사용자 액션:** 사진 탭하여 선택, 재촬영 버튼
- **API 호출:** `POST /api/mobile/photo-drafts` (사진 선택 후)
- **오류 처리:** 사진 없음 → 카메라 재실행 안내

#### 화면 8: 사진 편집 (`/photo-edit/:draftId`)
- **목적:** 선택한 사진에 필터·프레임·배지 적용
- **주요 UI:** 편집된 이미지 미리보기, 필터 슬라이더, 프레임 선택 목록, 배지 토글, 날짜 스탬프 위치 조정
- **사용자 액션:** 편집 완료 → NFT 미리보기로 이동, 건너뛰기
- **API 호출:** `PATCH /api/mobile/photo-drafts/{draftId}/edit`
- **오류 처리:** 편집 데이터 저장 실패 → 로컬 임시 보관

#### 화면 17: 내 NFT 초안 (`/my-drafts`)
- **목적:** "나중에 발행" 선택된 사진 초안 목록 관리
- **주요 UI:** Draft 카드 목록 (썸네일 + 랜드마크명 + 남은 기간 + 상태 배지), "NFT 발행" 버튼, 삭제 버튼
- **사용자 액션:** Draft 선택 → 편집 재개, NFT 발행 시작, Draft 삭제
- **API 호출:** `GET /api/mobile/photo-drafts`, `POST /api/mobile/photo-drafts/{draftId}/prepare-ipfs`
- **오류 처리:** Draft 없음 → "방문 인증 후 사진을 찍어 NFT를 만들어보세요" 빈 상태

***
## 10. 관리자 화면 설계
### 10.1 신규 관리자 메뉴
| 화면 | 목적 | 주요 기능 |
|------|------|---------|
| 사진 기반 NFT 발행 현황 | 모든 mint 요청 모니터링 | 상태별 필터·검색, 재시도 버튼 |
| IPFS 업로드/Pinning 상태 | IPFS 자산 현황 | CID 조회, pinning 실패 재시도 |
| Polygon mint 상태 | 온체인 트랜잭션 현황 | txHash 조회, 실패 재시도 |
| Fabric 기록 상태 | Fabric 원장 동기화 현황 | 불일치 케이스 수동 처리 |
| 이미지 검수/신고 관리 | 부적절 이미지 처리 | 승인/거부, 신고 이미지 처리 |
| NFT 초안(Draft) 현황 | Draft 만료·삭제 관리 | 만료 예정 알림, 배치 정리 |
### 10.2 권한 분리
| 권한 | 접근 가능 화면 |
|------|-------------|
| `SUPER_ADMIN` | 전체 |
| `REGIONAL_ADMIN` (지자체) | 자기 지역 캠페인·방문·포인트·정산 |
| `PARTNER_ADMIN` (제휴사) | 자기 이벤트의 NFT 발행 현황·정산 |
| `MODERATION` (검수 담당) | 이미지 검수/신고 관리만 |

***
## 11. 온체인/오프체인 데이터 분리
| 저장소 | 저장 데이터 | 변경 가능 여부 | 개인정보 포함 |
|--------|-----------|-------------|-------------|
| **Polygon** | tokenId, contractAddress, ownerAddress, tokenURI(`ipfs://metadataCID`), txHash, issuedAt | ❌ 불변 | ❌ (지갑주소만) |
| **IPFS** | 최종 NFT 이미지 파일, metadata JSON (`name`, `description`, `image`, `attributes`) | ❌ 불변 (CID 기반) | ❌ (개인정보 금지) |
| **Fabric** | visitId, userIdHash, campaignId, regionCode, spotCode, tagIdHash, visitProofHash, nftTokenId, nftContractAddress, nftTxHash, imageCID, metadataCID, pointRewardAmount, rewardPolicyHash, rewardTxId | ❌ 불변 원장 | ❌ (해시값만) |
| **MySQL** | userId, walletAddress, visitId, photoDraftId, originalS3Url, editedS3Url, thumbnailUrl, imageCID, metadataCID, gatewayUrl, mintStatus, ipfsStatus, moderationStatus, polygonTxHash, fabricTxId, errorReason, retryCount | ✅ 가변 | ✅ (GDPR 대상) |
| **S3** | 원본 사진, 편집본 임시 파일, 썸네일, 검수용 이미지, IPFS 업로드 실패 대비 백업 | ✅ 삭제 가능 | ✅ (민팅 완료 후 원본 삭제 정책) |

***
## 12. NFT Metadata 설계
### 12.1 ERC-721 Metadata JSON 예시
```json
{
  "name": "Gyeongbokgung Visit NFT #1042",
  "description": "A unique NFT minted at Gyeongbokgung Palace, Seoul, South Korea. Captured and owned by the visitor.",
  "image": "ipfs://Qm...imageCID",
  "external_url": "https://landin.app/nft/1042",
  "attributes": [
    { "trait_type": "Region", "value": "Seoul" },
    { "trait_type": "Landmark", "value": "Gyeongbokgung Palace" },
    { "trait_type": "Campaign", "value": "Seoul Spring 2026" },
    { "trait_type": "Visit Date", "value": "2026-05-16" },
    { "trait_type": "Proof Type", "value": "NFC_NTAG424_SUN" },
    { "trait_type": "Photo Type", "value": "USER_CAPTURED" },
    { "trait_type": "Rarity", "value": "RARE" },
    { "trait_type": "Minted On", "value": "Polygon" },
    { "trait_type": "Land-In Step", "value": "Step 1 of 3" }
  ]
}
```
### 12.2 metadata 정책
- **발행 전:** Draft 단계에서 attributes 수정 가능 (캠페인·랜드마크 자동 채움, 날짜는 촬영 시각)
- **발행 후:** IPFS CID가 확정되어 변경 불가 → 사용자에게 "발행 후 수정 불가" 명시 동의 필수
- **개인정보 최소화:** metadata JSON에 이름·이메일·전화번호 등 개인정보 포함 금지. `userIdHash`는 Fabric에만 저장
- **OpenSea 호환:** `attributes` 배열 형식 준수, `external_url` 포함

***
## 13. API / DB / 체인코드 설계
### 13.1 신규 API 목록
| Method | Endpoint | 목적 | 주요 Request | 주요 Response |
|--------|----------|------|-------------|-------------|
| POST | `/api/mobile/nfc/verify` | NFC 태그 검증 + 방문 인증 생성 | `tagUid`, `userId` | `visitId`, `nextStep: CAMERA` |
| POST | `/api/mobile/wallet/connect` | 지갑 주소 등록 | `walletAddress`, `chainId` | 200 |
| GET | `/api/mobile/wallet/status` | 지갑 연결 여부 확인 | - | `connected`, `walletAddress` |
| POST | `/api/mobile/photo-drafts` | 사진 초안 생성 | `visitId`, `imageFile` | `draftId`, `s3Url` |
| POST | `/api/mobile/photo-drafts/{draftId}/assets` | 추가 사진 업로드 | `imageFile` | `assetId`, `s3Url` |
| PATCH | `/api/mobile/photo-drafts/{draftId}/edit` | 편집 정보 저장 | `filterType`, `frameId`, `badgeId`, `datestamp` | `editedS3Url` |
| POST | `/api/mobile/photo-drafts/{draftId}/prepare-ipfs` | IPFS 업로드 시작 | `draftId` | `ipfsJobId` |
| GET | `/api/mobile/photo-drafts/{draftId}/ipfs-status` | IPFS 진행 상태 조회 | - | `imageCID`, `metadataCID`, `status` |
| POST | `/api/mobile/nfts/{draftId}/mint-polygon` | Polygon mint 요청 | `walletAddress`, `metadataCID` | `mintRequestId` |
| GET | `/api/mobile/nfts/{mintRequestId}/status` | mint·Fabric 기록·포인트 지급 상태 폴링 | - | `status`, `txHash`, `tokenId`, `pointAmount` |
| POST | `/api/mobile/nfts/{mintRequestId}/grant-reward` | NFT 발급 완료 후 포인트 지급 | `mintRequestId` | `pointAmount`, `rewardTxId` |
| POST | `/api/mobile/nfts/{mintRequestId}/retry` | mint 또는 포인트 지급 재시도 | - | `mintRequestId`, `status` |
| GET | `/api/mobile/photo-drafts` | 내 초안 목록 | - | Draft 목록 |
| DELETE | `/api/mobile/photo-drafts/{draftId}` | 초안 삭제 | - | 200 |
| GET | `/api/mobile/users/me/nfts` | 내 NFT 컬렉션 | - | NFT 목록 |
| GET | `/api/admin/nft-mints` | 관리자: 민팅 현황 | `status`, `date` | 민팅 목록 |
| POST | `/api/admin/nft-mints/{mintId}/retry` | 관리자: 수동 재시도 | - | 200 |
### 13.2 신규 DB 테이블 (기존 스키마 확장)
#### `photo_drafts` (사진 초안)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | CHAR(36) PK | Draft UUID |
| `user_id` | CHAR(36) FK → users | 소유자 |
| `visit_id` | CHAR(36) FK → visits | 관련 방문 |
| `step_id` | CHAR(36) FK → steps | 관련 스텝 |
| `status` | VARCHAR(50) | DRAFT_CREATED / UPLOADING / UPLOADED_TO_S3 / EDITING / SELECTED_FOR_MINT / READY_FOR_IPFS / EXPIRED / DELETED |
| `original_s3_url` | VARCHAR(512) | 원본 S3 URL |
| `edited_s3_url` | VARCHAR(512) | 편집본 S3 URL |
| `thumbnail_url` | VARCHAR(512) | 썸네일 URL |
| `filter_type` | VARCHAR(50) | 적용 필터 |
| `frame_id` | VARCHAR(50) | 적용 프레임 |
| `image_hash` | VARCHAR(128) | 중복 업로드 방지용 SHA-256 |
| `moderation_status` | VARCHAR(50) | PENDING / APPROVED / REJECTED |
| `moderation_reason` | VARCHAR(500) | 거부 사유 |
| `expires_at` | DATETIME | Draft 만료 시각 |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

#### `nft_mint_requests` (민팅 요청)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | CHAR(36) PK | |
| `user_id` | CHAR(36) FK → users | |
| `draft_id` | CHAR(36) FK → photo_drafts | |
| `visit_id` | CHAR(36) FK → visits | |
| `mint_status` | VARCHAR(50) | 상태값 (8.3 참조) |
| `image_cid` | VARCHAR(256) | IPFS 이미지 CID |
| `metadata_cid` | VARCHAR(256) | IPFS metadata CID |
| `token_uri` | VARCHAR(512) | `ipfs://{metadataCID}` |
| `owner_wallet_address` | VARCHAR(128) | Polygon 수령 지갑 |
| `polygon_tx_hash` | VARCHAR(128) | |
| `polygon_token_id` | VARCHAR(128) | |
| `fabric_tx_id` | VARCHAR(256) | |
| `error_reason` | VARCHAR(1000) | |
| `retry_count` | INT DEFAULT 0 | |
| `last_retry_at` | DATETIME | |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

#### `user_nfts` 테이블 확장 컬럼 (기존 스키마 추가)
| 추가 컬럼 | 타입 | 설명 |
|---------|------|------|
| `photo_draft_id` | CHAR(36) FK → photo_drafts | 원본 초안 참조 |
| `image_cid` | VARCHAR(256) | IPFS 이미지 CID |
| `metadata_cid` | VARCHAR(256) | IPFS metadata CID |
| `is_user_photo` | TINYINT(1) DEFAULT 0 | 사용자 사진 기반 여부 |
### 13.3 Fabric 체인코드 함수
| 함수 | 입력값 | 검증 조건 | 월드스테이트 업데이트 |
|------|--------|----------|------------------|
| `VerifyVisit()` | tagIdHash, userIdHash, campaignId, timestamp, sunMac | 태그 유효성, 중복 스캔(24시간), 사용자 상태 | VisitRecord 생성, visitStatus=`PHOTO_REQUIRED` |
| `RecordPhotoDraft()` | visitId, userIdHash, draftId, imageHashProof | visitId 존재, 방문 인증 이후 촬영 | PhotoDraftProof 저장 |
| `RecordNFTMint()` | visitId, userIdHash, tokenId, contractAddress, txHash, imageCID, metadataCID | visitId 존재 여부, 중복 mint 여부 | NFTRecord 생성(tokenId + CID 매핑), visitStatus=`NFT_MINTED` |
| `GrantPointAfterNFTMint()` | visitId, userIdHash, mintRequestId, rewardPolicyHash | NFTRecord 존재, 중복 지급 없음, 예산 잔액 | PointBalance 증가, CampaignBudget 차감, visitStatus=`COMPLETED` |
| `UsePoint()` | userId, merchantId, regionId, pointAmount, requestId | 포인트 잔액, 유효기간, 사용 가능 지역, 중복 결제 | PointBalance 차감, MerchantUnsettled 증가 |
| `CreateSettlement()` | periodStart, periodEnd, regionCode | 권한 확인 | SettlementRecord 생성 |
| `ReconcileNFTMintFailure()` | mintRequestId, tokenId, txHash | tokenId 미기록 여부 | NFTRecord 사후 등록 |
### 13.4 Polygon ERC-721 컨트랙트
```solidity
// LandinPhotoNFT.sol (핵심 함수)
function safeMint(address to, string calldata tokenURI_) 
    external onlyMinter whenNotPaused returns (uint256 tokenId);

function setMinter(address minter, bool enabled) 
    external onlyOwner;

function pause() external onlyOwner;
function unpause() external onlyOwner;

// Soulbound 여부: MVP에서는 전송 허용, Phase 3에서 재검토
// Gasless: Relayer 주소에 MINTER_ROLE 부여, 사용자 가스 부담 없음
```

***
## 14. 보안·부정행위·개인정보
### 14.1 부정행위 대응
| 부정행위 유형 | 대응 방법 |
|-------------|---------|
| NFC URL 재사용 | SUN/SDM 동적 MAC 검증 (매 스캔마다 새 값 생성) |
| 태그 복제 | NTAG 424 DNA의 암호화된 SDM 메시지로 원본 인증 |
| 중복 방문 보상 | Fabric 체인코드 중복 스캔 검사 (visitId + tagIdHash + 24시간 쿨다운) |
| 갤러리 사진 업로드 | 인앱 카메라 우선 (갤러리 선택은 선택 옵션으로 제한 + 촬영 시각 메타데이터 검증) |
| 다른 장소 사진 업로드 | 랜드마크 유사도 AI 검사 (Phase 2) + 관리자 수동 검수 |
| 동일 이미지 재사용 | `image_hash` (SHA-256) 중복 검사 (사용자 × 이미지 해시 UNIQUE) |
| GPS 위변조 | GPS 보조 검증 (NFC 스캔 시 위치 좌표 서버 전송, 랜드마크 반경 검사) |
| 민팅 요청 재전송 | `requestId` / `nonce` 기반 멱등성 보장, Fabric 중복 체인코드 거부 |
### 14.2 개인정보/법적 리스크
#### 기획 단계에서 완화 가능
- IPFS metadata에 이름·이메일 등 개인정보 포함 금지 (설계로 해결)
- 사진 원본은 S3에 임시 저장, 민팅 완료 후 원본 삭제 정책 (설정으로 해결)
- 민팅 전 "초상권·개인정보·저작권 동의" 팝업 필수 (UX 설계로 해결)
- 얼굴 블러 옵션 제공 (편집 화면에 블러 도구 포함)
- Fabric/Polygon에 원본 사진 미저장 (아키텍처로 해결)

#### 법률 자문 필요
- IPFS에 업로드된 사진 속 타인 초상권 침해 시 삭제 요청 대응 (IPFS의 불변성 문제)
- NFT 수집의 가상자산성 여부 (「가상자산이용자보호법」 적용 가능성)
- 포인트의 선불전자지급수단 해당 여부 (「전자금융거래법」 제2조 제14호)
- 외국인 관광객 대상 개인정보 수집 시 해외 개인정보보호법 적용 (GDPR 등)
- 지자체 예산을 민간 플랫폼 포인트로 전환 시 「보조금관리법」 적용 검토

***
## 15. UX 마찰 최소화
### 15.1 지갑 연결 전략
| 단계 | 지갑 필요 여부 | 정책 |
|------|-------------|------|
| 회원가입·로그인 직후 | 선택 | 지갑 연결 안내 페이지 노출. “나중에 연결하기” 선택 가능 |
| 앱 탐색·캠페인 조회 | ❌ | 지갑 없이 이용 가능 |
| NFC 스캔·방문 인증 | ❌ | 지갑 없이 visitId 생성 |
| 사진 촬영·선택·편집 | ❌ | 지갑 없이 진행 가능 |
| Draft 저장 (“나중에 발행”) | ❌ | 지갑 없이 저장 가능 |
| **NFT 발행 직전** | ✅ | 기존 연결 지갑이 있으면 그대로 사용. 없으면 이 시점에 지갑 연결 필수 |
| 포인트 적립 | 간접 필요 | 포인트는 NFT 발행 완료 후 지급되므로 NFT 발행을 위한 지갑 연결이 선행됨 |
| 포인트 사용 | ❌ | 포인트 사용 자체는 Land-In 계정 기준으로 처리 |
### 15.2 기술 용어 → 사용자 문구 변환표
| 기술 문구 | 사용자 문구 (EN / KO) |
|---------|---------------------|
| "Polygon transaction pending" | "NFT 발급을 완료하는 중입니다. / Your NFT is being finalized." |
| "Gas fee insufficient" | "네트워크 비용 처리에 실패했습니다. / Network fee payment failed." |
| "Mint failed" | "NFT 발급이 완료되지 않았습니다. 사진은 안전하게 저장되어 있습니다. / NFT issuance failed. Your photo is safely saved." |
| "IPFS CID" | "NFT 고유 식별 코드 / Your NFT's unique identifier" |
| "Wallet address" | "NFT 수령 주소 / Your NFT wallet address" |
| "Smart contract" | (숨김) |
| "Fabric ledger" | (숨김) |
| "IPFS pinning" | "사진 영구 저장 중 / Securing your photo permanently" |
### 15.3 MetaMask 미설치 사용자 대응
1. MetaMask 앱 미설치 감지 → "MetaMask 설치 안내" 화면으로 유도
2. WalletConnect v2로 대체 연결 옵션 제공
3. MVP에서는 회원가입 직후 지갑 연결을 권장하되 스킵을 허용하고, NFT 발행 직전 미연결 사용자에게만 필수 연결을 요청
4. Phase 2에서 Embedded Wallet(Privy, Dynamic.xyz 등) 검토

***
## 16. 기술 아키텍처 다이어그램
```
[React Native App]
  ├── NFC 스캔 (react-native-nfc-manager)
  ├── 카메라 (react-native-vision-camera)
  ├── 사진 편집 UI (캔버스 기반 로컬 처리)
  └── WalletConnect SDK / MetaMask SDK
         |
         | HTTPS REST API
         ↓
[Spring Boot API Server]
  ├── NFC 검증 모듈 (NTAG 424 DNA SUN/SDM)
  ├── 이미지 처리 서비스 (압축·리사이즈·검수)
  ├── IPFS 업로드 서비스 (Pinata/NFT.Storage API)
  ├── Polygon 민팅 서비스 (Gasless Relayer / Web3j)
  ├── Fabric SDK (VerifyVisit, RecordNFTMint, GrantPointAfterNFTMint)
  └── 재시도 큐 (Spring Batch / Redis Queue)
         |
    ┌────┴─────────────────────────┐
    ↓          ↓          ↓        ↓
[MySQL]    [S3/R2]    [Fabric]  [IPFS]
 방문·포인트  원본·편집본  포인트·방문  이미지·metadata
 사진초안    썸네일      NFT 원장   (영구 저장)
 민팅상태    검수용 백업              |
                                    ↓
                              [Polygon PoS]
                               ERC-721 NFT
                               tokenId·ownerAddress
                               tokenURI(ipfs://)
```

***
## 17. MVP 범위
### Phase 1: MVP (대학 프로젝트 / 데모)
**반드시 구현:**
- React Native 앱 (Android)
- 이메일 로그인
- NFC Mock 또는 실제 NTAG 424 DNA 스캔 (Android)
- 인앱 카메라 (`react-native-vision-camera`)
- 사진 선택/S3 임시 저장
- 기본 편집 UI (필터 2~3종, 날짜 스탬프)
- IPFS 이미지·metadata 업로드 (Pinata API)
- Polygon Amoy testnet ERC-721 mint
- tokenURI = `ipfs://{metadataCID}`
- 내 컬렉션 조회
- Fabric 로컬 네트워크 기록 (또는 Mock)

**제외 가능:**
- 실결제 / 실정산
- 항공사 API 직접 연동
- AI 이미지 검수 (수동 검수로 대체)
- iOS NFC 지원
- Gasless Relayer (사용자 직접 가스비 부담 또는 서버 후불 처리)
- 완전한 Draft 만료·배치 처리
### Phase 2: 파일럿
- NTAG 424 DNA 실제 SUN/SDM 검증
- Gasless Relayer 구현
- IPFS pinning 이중화 (Pinata + NFT.Storage)
- AI 이미지 부적절 콘텐츠 검수
- Fabric 포인트 원장 실운영
- 지자체 캠페인 예산 관리
- 실패 재시도 큐 (Spring Batch)
- iOS NFC 지원 (CoreNFC)
### Phase 3: 상용화
- 항공사·지자체·가맹점 제휴 실운영
- 실결제·정산 시스템
- 외국인 eKYC
- Dynamic NFT 검토
- Soulbound Token 정책 재검토
- 다국어 고객 지원 (EN/JA/ZH/KO)
- 대규모 NFT 발행 모니터링 대시보드

***
## 18. 개발 우선순위 (MVP)
| 우선순위 | 항목 | 난이도 | 선행 조건 | 담당 영역 | 완료 기준 |
|---------|------|--------|---------|----------|---------|
| 1 | 로그인/회원가입 | 낮음 | - | 앱·백엔드 | JWT 발급·인증 통과 |
| 2 | 회원가입 후 지갑 연결 안내/스킵 | 중간 | 1 | 앱·백엔드 | 연결·스킵 모두 정상 진행 |
| 3 | 캠페인·랜드마크 조회 | 낮음 | 1 | 앱·백엔드 | 이벤트 목록·상세 화면 표시 |
| 4 | NFC 스캔 (Android Mock) | 중간 | 3 | 앱 | tagUid 읽기·전송 성공 |
| 5 | 방문 인증 상태 생성 | 중간 | 4 | 백엔드·DB/Fabric | visitId 생성, PHOTO_REQUIRED 상태 전환 |
| 6 | **React Native 인앱 카메라** | 높음 | 5 | 앱 | 사진 촬영·로컬 저장 |
| 7 | **사진 선택·S3 업로드** | 중간 | 6 | 앱·백엔드 | S3 URL 반환 |
| 8 | **기본 사진 편집 UI** | 높음 | 7 | 앱 | 필터·날짜 스탬프 적용 미리보기 |
| 9 | NFT 발행 직전 지갑 연결 확인 | 중간 | 2, 8 | 앱·백엔드 | 미연결 시 연결 요청, 연결 후 발행 진행 |
| 10 | **IPFS 이미지 업로드** | 중간 | 7 | 백엔드 | imageCID 반환 |
| 11 | **metadata JSON 생성·IPFS 업로드** | 낮음 | 10 | 백엔드 | metadataCID 반환 |
| 12 | **Polygon testnet ERC-721 mint** | 높음 | 9, 11 | 백엔드 | txHash·tokenId 수신 |
| 13 | Fabric NFT 기록 | 높음 | 12 | 백엔드·Fabric | RecordNFTMint 원장 기록 확인 |
| 14 | NFT 발행 후 포인트 지급 Mock | 중간 | 13 | 백엔드·Fabric | 포인트 잔액 증가 및 rewardTxId 생성 |
| 15 | 내 컬렉션 조회 | 낮음 | 13 | 앱·백엔드 | NFT 목록 화면 표시 |
| 16 | 관리자 이미지 검수 화면 | 중간 | 7 | 관리자 웹 | 승인/거부 처리 |
