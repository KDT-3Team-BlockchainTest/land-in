# 사용자 기준 플로우 차트

현재 `frontend` 구현과 연결된 API 호출 기준으로 정리한 사용자 중심 플로우입니다.

```mermaid
flowchart TD
    A[앱 진입] --> B{로그인 상태인가?}
    B -- 아니오 --> C[/login/]
    C --> D[로그인 또는 회원가입]
    D --> E[인증 성공]
    E --> F[/ 홈]
    B -- 예 --> F

    subgraph MainNav [주요 진입 화면]
        F --> G[추천/진행중/오픈예정 이벤트 탐색]
        F --> H[진행 현황 배너 클릭]
        F --> I[하단 탭: Collection]
        F --> J[하단 탭: Tag]
        F --> K[하단 탭: Reward]
        F --> L[하단 탭: MyPage]
    end

    H --> M[/my-progress/]
    M --> M1{진행 중 컬렉션이 있는가?}
    M1 -- 있음 --> M2[진행 통계 확인]
    M2 --> M3[진행 중 컬렉션 카드 확인]
    M3 --> N[/event/:eventId/]
    M1 -- 없음 --> M4[빈 상태 화면]
    M4 --> F

    G --> N

    subgraph EventFlow [이벤트 상세]
        N --> N1[이벤트 정보/루트/보상 확인]
        N1 --> N2{현재 상태는?}
        N2 -- 참여 가능, 미참여 --> N3[이벤트 참여]
        N3 --> J
        N2 -- 참여 중, current step 존재 --> J
        N2 -- 완료 또는 종료 --> I
        N2 -- 그 외 --> F
    end

    subgraph TagFlow [태그 인증 및 NFT 획득]
        J --> J1{ongoing 컬렉션이 있는가?}
        J1 -- 없음 --> J2[인증 대상 없음 화면]
        J2 --> I
        J1 -- 있음 --> J3[현재 step 확인]
        J3 --> J4[NFC Tag UID 입력]
        J4 --> J5[인증 시작]
        J5 --> J6[scanning]
        J6 --> J7[verified]
        J7 --> J8[백엔드 NFC 검증]
        J8 --> J9{검증 성공?}
        J9 -- 아니오 --> J10[에러 화면]
        J10 --> J4
        J9 -- 예 --> J11[NFT 민팅 성공 화면]
        J11 --> O[/nft-gallery/:eventId/]
        J11 --> J12[공유 버튼]
        J12 --> J13[현재 구현상 추가 동작 없음]
        J11 --> J14{마지막 step 완료인가?}
        J14 -- 예 --> K
        J14 -- 아니오 --> I
    end

    subgraph CollectionFlow [컬렉션 및 NFT 보기]
        I --> I1[/collection/]
        I1 --> I2[필터 선택: all/ongoing/completed/ended/NFT]
        I2 --> I3{NFT 탭인가?}
        I3 -- 아니오 --> I4[컬렉션 카드 목록]
        I4 --> N
        I4 --> O
        I3 -- 예 --> I5[NFT 카드 목록]
        I5 --> O
        O --> O1[컬렉션 진행률/획득 NFT 확인]
        O1 --> N
        O1 --> I1
    end

    subgraph RewardFlow [리워드 확인]
        K --> K1[/reward/]
        K1 --> K2[필터 선택: available/used/expired]
        K2 --> K3{리워드가 있는가?}
        K3 -- 없음 --> K4[빈 상태 화면]
        K3 -- 있음 --> K5[리워드 카드 목록]
        K5 --> K6[QR 보기]
        K6 --> K7[리워드 코드 모달]
        K7 --> K8[쿠폰 코드/사용 방법 확인]
        K8 --> K1
    end

    subgraph MyPageFlow [마이페이지]
        L --> L1[/mypage/]
        L1 --> L2[프로필/보유 NFT/참여 도시 확인]
        L1 --> L3[여행 통계 확인]
        L1 --> L4[업적 확인]
        L1 --> L5[설정 목록 확인]
        L1 --> L6[로그아웃]
        L6 --> C
    end
```

## 핵심 해석

- 현재 사용자 여정의 중심 허브는 `[event/:eventId]` 입니다.
- `Tag` 화면은 아무 이벤트나 직접 고르는 구조가 아니라, `ongoing` 컬렉션 중 첫 번째 대상 기준으로 동작합니다.
- NFC 인증 성공 후 사용자가 바로 보는 결과는 `NFT 민팅 화면 -> NFT 갤러리`이고, 리워드는 필요 시 `Reward` 탭에서 따로 확인하는 구조입니다.
- `Reward` 페이지에는 `사용 처리 API` 연결 코드는 일부 있지만, 현재 모달 UI에서는 실제 사용 버튼이 노출되지 않습니다.
