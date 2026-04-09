# 제휴사 관리자 기준 플로우 차트

현재 프로젝트의 실제 코드와 더미/시드 데이터를 기준으로, 나중에 추가될 **제휴사 관리자 이벤트 등록 페이지**를 가정한 플로우입니다.

기준으로 삼은 현재 데이터 구조:

- `Event`: `id(slug)`, `title`, `city`, `country`, `status`, `featured`, `startDate`, `endDate`, `description`, `heroImageUrl`, `heroImageFallbackUrl`, `mapImageUrl`, `partnerName`, `partnerLogoUrl`, `themeColor`
- `Step`: `orderIndex`, `placeName`, `placeDescription`, `imageUrl`, `imageFallbackUrl`, `lat`, `lng`, `finalStep`
- `NfcTag`: step 당 1개 `tagUid`
- `NftTemplate`: step 당 1개 `name`, `imageUrl`, `rarity`, `description`
- `RewardTemplate`: event 당 1개 `title`, `description`, `partnerName`, `howToUse`, `validityDays`, `emoji`, `accentColor`

참고:

- 현재 코드에는 아직 제휴사 관리자 전용 권한/역할 모델이 없습니다. 아래 문서는 **향후 `partner admin` 권한이 추가된다고 가정한 운영 플로우**입니다.
- 현재 `EventStatus`는 `UPCOMING`, `ACTIVE`, `COMPLETED`, `ENDED` 중심입니다. 따라서 관리자 UI의 `임시저장`은 백엔드 영속 상태라기보다 **화면 내 draft 상태** 또는 별도 저장 개념으로 보는 것이 자연스럽습니다.

```mermaid
flowchart TD
    A[제휴사 관리자 앱/관리 콘솔 진입] --> B{관리자 로그인 상태인가?}
    B -- 아니오 --> C[/partner-admin login/]
    C --> D[이메일/비밀번호 로그인]
    D --> E[인증 성공]
    E --> F[/partner admin dashboard/]
    B -- 예 --> F

    subgraph AdminHome [관리자 홈]
        F --> G[내 제휴사 이벤트 목록 조회]
        F --> H[신규 이벤트 등록]
        F --> I[기존 이벤트 수정]
        F --> J[이벤트 상태/노출 현황 확인]
    end

    H --> K[이벤트 생성 폼 시작]
    I --> K1[기존 이벤트 불러오기]
    K1 --> K

    subgraph EventBase [1. 이벤트 기본 정보 입력]
        K --> L[기본 정보 입력]
        L --> L1[id slug 입력]
        L --> L2[이벤트명/도시/국가 입력]
        L --> L3[시작일/종료일 입력]
        L --> L4[설명 문구 입력]
        L --> L5[제휴사명/로고/테마색 입력]
        L --> L6[대표 이미지/대체 이미지/맵 이미지 입력]
        L --> L7[status 및 featured 여부 설정]
        L7 --> M{기본 정보 검증 통과?}
        M -- 아니오 --> M1[필수값/slug 중복/날짜 오류 수정]
        M1 --> L
        M -- 예 --> N[다음 단계로 이동]
    end

    subgraph StepDesign [2. 방문 스텝 설계]
        N --> O[스텝 목록 작성]
        O --> O1[step 개수 추가]
        O1 --> O2[순서별 orderIndex 지정]
        O2 --> O3[장소명/placeName 입력]
        O3 --> O4[장소 설명/placeDescription 입력]
        O4 --> O5[장소 이미지/대체 이미지 입력]
        O5 --> O6[위치 좌표 lat/lng 입력 선택]
        O6 --> O7[마지막 스텝 여부(finalStep) 지정]
        O7 --> P{스텝 구조 검증 통과?}
        P -- 아니오 --> P1[순서 중복/마지막 스텝 누락/필수값 누락 수정]
        P1 --> O
        P -- 예 --> Q[다음 단계로 이동]
    end

    subgraph NfcNft [3. NFC 및 NFT 템플릿 설정]
        Q --> R[각 스텝별 NFC/NFT 설정]
        R --> R1[step 별 NFC tagUid 등록]
        R1 --> R2[tagUid 중복 여부 검증]
        R2 --> R3[step 별 NFT 이름 입력]
        R3 --> R4[NFT 이미지 입력]
        R4 --> R5[rarity 설정 common/rare/legendary]
        R5 --> R6[NFT 설명 입력]
        R6 --> S{NFC/NFT 설정 검증 통과?}
        S -- 아니오 --> S1[tagUid 중복/누락, NFT 값 누락 수정]
        S1 --> R
        S -- 예 --> T[다음 단계로 이동]
    end

    subgraph RewardSetup [4. 완주 리워드 설정]
        T --> U[리워드 템플릿 입력]
        U --> U1[리워드 제목/설명 입력]
        U1 --> U2[제휴사명 입력 또는 이벤트 제휴사명 재사용]
        U2 --> U3[사용 방법/howToUse 입력]
        U3 --> U4[유효기간 일수/validityDays 입력]
        U4 --> U5[이모지/accentColor 설정]
        U5 --> V{리워드 검증 통과?}
        V -- 아니오 --> V1[필수값/유효기간 오류 수정]
        V1 --> U
        V -- 예 --> W[미리보기로 이동]
    end

    subgraph PreviewPublish [5. 미리보기 및 등록]
        W --> X[사용자 화면 기준 미리보기]
        X --> X1[홈 카드/상세 페이지 문구 확인]
        X1 --> X2[루트 타임라인 확인]
        X2 --> X3[NFT 갤러리 노출 형태 확인]
        X3 --> X4[리워드 문구/쿠폰 안내 확인]
        X4 --> Y{수정이 필요한가?}
        Y -- 예 --> Y1[원하는 단계로 돌아가 수정]
        Y1 --> L
        Y1 --> O
        Y1 --> R
        Y1 --> U
        Y -- 아니오 --> Z{저장 방식 선택}
        Z -- 임시저장 --> Z1[초안 저장]
        Z1 --> F
        Z -- 등록/게시 --> Z2[이벤트 + steps + nfc_tags + nft_templates + reward_template 저장]
        Z2 --> Z3{게시 성공?}
        Z3 -- 아니오 --> Z4[저장 실패 원인 확인 후 수정]
        Z4 --> Y1
        Z3 -- 예 --> AA[이벤트 등록 완료]
    end

    subgraph PostManage [6. 등록 후 운영]
        AA --> AB[이벤트 상세 운영 화면]
        AB --> AB1[현재 status 확인 upcoming/active/completed/ended]
        AB1 --> AB2[featured 노출 여부 수정]
        AB2 --> AB3[기간/설명/이미지 수정]
        AB3 --> AB4[스텝/NFC/NFT/리워드 수정]
        AB4 --> AB5[사용자 노출 전 최종 점검]
        AB5 --> AC{추가 운영 작업이 있는가?}
        AC -- 있음 --> AD[재수정 후 저장]
        AD --> AB
        AC -- 없음 --> AE[이벤트 목록으로 복귀]
        AE --> F
    end
```

## 핵심 해석

- 이 관리자 페이지는 단순 “이벤트 등록”이 아니라, 실제 서비스 구조상 **이벤트 + 방문 스텝 + NFC 태그 + NFT 템플릿 + 완주 리워드**를 함께 설계하는 콘솔이어야 합니다.
- 현재 코드 기준으로 `RewardTemplate`은 이벤트당 1개, `NfcTag`와 `NftTemplate`은 스텝당 1개라서, 관리자 UI도 이 제약을 자연스럽게 강제하는 편이 좋습니다.
- `slug`, `step order`, `finalStep`, `tagUid`는 운영 실수 시 실제 사용자 플로우를 깨뜨릴 수 있으므로 등록 화면에서 강한 검증이 필요합니다.
- `featured`는 현재 구조상 `status`와 별개 플래그이므로, 관리자도 “이벤트 상태”와 “홈 추천 노출 여부”를 분리해서 다뤄야 합니다.
- 현재 프로젝트에는 관리자 전용 권한 모델이 아직 없으므로, 실제 구현 시에는 최소한 `partner admin`이 **자기 제휴사 이벤트만 조회/수정**하도록 권한 범위를 먼저 정하는 것이 좋습니다.
