# 서비스 전체 관리자 기준 플로우 차트

현재 프로젝트의 실제 코드, 시드 데이터, 그리고 [05_user-flow-chart.md](c:\Users\dltmd\Desktop\land-in\docs\05_user-flow-chart.md), [06_partner-admin-flow-chart.md](c:\Users\dltmd\Desktop\land-in\docs\06_partner-admin-flow-chart.md)를 바탕으로 정리한 **서비스 전체 관리자(super admin)** 관점의 운영 플로우입니다.

이 문서는 현재 코드에 이미 존재하는 도메인들을 중심으로 구성했습니다.

- 사용자 도메인: `User`
- 이벤트 도메인: `Event`, `EventStatus(UPCOMING, ACTIVE, COMPLETED, ENDED)`, `featured`
- 참여/진행 도메인: `EventParticipation`, `Step`, `StepCompletion`
- NFC 도메인: `NfcTag`, `NfcScanLog`, `NfcScanResult(SUCCESS, ALREADY_DONE, WRONG_ORDER, NOT_JOINED, UNKNOWN_TAG)`
- NFT 도메인: `NftTemplate`, `UserNft`
- 리워드 도메인: `RewardTemplate`, `UserReward`, `RewardStatus(AVAILABLE, USED, EXPIRED)`

참고:

- 현재 코드에는 아직 `service admin`, `partner admin` 같은 역할 모델과 전용 관리자 API가 없습니다.
- 아래 흐름은 **지금 서비스 구조를 실제 운영 가능한 관리자 콘솔로 확장한다는 가정** 아래 정리한 문서입니다.

```mermaid
flowchart TD
    A[서비스 관리자 콘솔 진입] --> B{관리자 로그인 상태인가?}
    B -- 아니오 --> C[/service-admin login/]
    C --> D[운영 관리자 로그인]
    D --> E[인증 성공]
    E --> F[/service admin dashboard/]
    B -- 예 --> F

    subgraph AdminHome [서비스 관리자 홈]
        F --> G[전체 서비스 현황 요약]
        F --> H[제휴사/제휴사 관리자 관리]
        F --> I[이벤트 심사 및 운영]
        F --> J[사용자 활동 모니터링]
        F --> K[NFC/NFT/리워드 운영]
        F --> L[서비스 공지/운영 정책 관리]
    end

    subgraph PartnerOps [1. 제휴사 및 권한 운영]
        H --> H1[제휴사 목록 조회]
        H1 --> H2[신규 제휴사 등록]
        H1 --> H3[제휴사 관리자 계정 발급]
        H1 --> H4[제휴사별 이벤트 권한 범위 설정]
        H4 --> H5{권한 설정 완료?}
        H5 -- 아니오 --> H4
        H5 -- 예 --> F
    end

    subgraph EventReview [2. 이벤트 심사 및 게시]
        I --> I1[제휴사 등록 이벤트/수정 요청 목록 조회]
        I1 --> I2[이벤트 기본 정보 검토]
        I2 --> I3[이벤트 상태값 검토 upcoming/active/completed/ended]
        I3 --> I4[featured 노출 여부 검토]
        I4 --> I5[스텝/순서/finalStep 검토]
        I5 --> I6[NFC tagUid 중복 여부 검토]
        I6 --> I7[NFT 템플릿 검토]
        I7 --> I8[RewardTemplate 검토]
        I8 --> I9{운영 기준 충족?}
        I9 -- 아니오 --> I10[반려/수정 요청 전달]
        I10 --> H1
        I9 -- 예 --> I11[승인 및 게시]
        I11 --> I12[공개 이벤트 카탈로그 반영]
        I12 --> I13{추가 운영 설정 필요한가?}
        I13 -- featured 지정 --> I14[홈 추천 배너 노출 설정]
        I13 -- 활성화 일정 조정 --> I15[status 또는 기간 재조정]
        I13 -- 없음 --> F
        I14 --> F
        I15 --> F
    end

    subgraph UserFlowBridge [3. 사용자 서비스 반영]
        I12 --> U1[사용자 앱 Home/Event/Collection/Tag/Reward 에 노출]
        U1 --> U2[사용자 이벤트 참여]
        U2 --> U3[NFC 인증]
        U3 --> U4[StepCompletion 기록]
        U4 --> U5[UserNft 발급]
        U5 --> U6{모든 step 완료인가?}
        U6 -- 예 --> U7[UserReward 발급]
        U6 -- 아니오 --> U8[다음 step 진행]
    end

    subgraph MonitorOps [4. 운영 모니터링]
        J --> J1[가입 사용자/참여 사용자 추이 확인]
        J1 --> J2[이벤트별 참여 수 확인]
        J2 --> J3[도시/국가/컬렉션 완료 통계 확인]
        J3 --> J4[NFT 발급량 확인]
        J4 --> J5[리워드 발급/사용/만료 현황 확인]
        J5 --> J6[NFC 스캔 로그 확인]
        J6 --> J7{이상 징후가 있는가?}
        J7 -- 없음 --> F
        J7 -- 있음 --> M
    end

    subgraph IncidentFlow [5. 예외 및 장애 대응]
        M[운영 이슈 상세 분석] --> M1[UNKNOWN_TAG 급증 확인]
        M --> M2[WRONG_ORDER 다발 확인]
        M --> M3[NOT_JOINED 빈발 확인]
        M --> M4[ALREADY_DONE 중복 스캔 확인]
        M --> M5[Reward 사용 불가/만료 이슈 확인]
        M1 --> M6[해당 이벤트/스텝/NFC 태그 점검]
        M2 --> M6
        M3 --> M7[참여 정책/UX 점검]
        M4 --> M8[현장 운영 이슈 여부 점검]
        M5 --> M9[RewardTemplate/validityDays/쿠폰 처리 점검]
        M6 --> M10{즉시 조치 필요?}
        M7 --> M10
        M8 --> M10
        M9 --> M10
        M10 -- 예 --> M11[이벤트 비노출 또는 태그 비활성화]
        M10 -- 아니오 --> M12[운영 메모 후 모니터링 지속]
        M11 --> I
        M12 --> F
    end

    subgraph RewardOps [6. 리워드 운영]
        K --> K1[RewardTemplate 정책 점검]
        K1 --> K2[이벤트별 리워드 발급 현황 확인]
        K2 --> K3[AVAILABLE / USED / EXPIRED 분포 확인]
        K3 --> K4[파트너사 문의 대응]
        K4 --> K5{리워드 정책 수정 필요한가?}
        K5 -- 예 --> K6[유효기간/문구/파트너 안내 수정]
        K6 --> I
        K5 -- 아니오 --> F
    end

    subgraph UserSupport [7. 사용자 운영 지원]
        J --> N1[사용자 계정/프로필 확인]
        N1 --> N2[특정 사용자 참여 이력 확인]
        N2 --> N3[사용자 NFT/Reward 상태 확인]
        N3 --> N4{문의/분쟁 처리 필요한가?}
        N4 -- 아니오 --> F
        N4 -- 예 --> N5[이벤트/스텝/리워드 이력 기반으로 운영 판단]
        N5 --> N6[제휴사 관리자와 협의]
        N6 --> N7[조치 결과 기록]
        N7 --> F
    end

    subgraph PolicyCycle [8. 서비스 정책 개선]
        L --> P1[운영 정책 검토]
        P1 --> P2[이벤트 승인 기준 정비]
        P2 --> P3[NFC 태그 운영 가이드 정비]
        P3 --> P4[리워드 사용 정책 정비]
        P4 --> P5[제휴사 관리자 운영 가이드 배포]
        P5 --> H
    end
```

## 핵심 해석

- 서비스 전체 관리자는 단순히 이벤트를 등록하는 사람이 아니라, **제휴사 관리자 운영 + 이벤트 심사 + 사용자 서비스 반영 + 실시간 운영 모니터링**을 모두 담당하는 상위 운영자입니다.
- [05_user-flow-chart.md](c:\Users\dltmd\Desktop\land-in\docs\05_user-flow-chart.md)의 사용자 플로우는 이 문서의 `사용자 서비스 반영` 이후에 실제로 발생하는 결과 흐름이고, [06_partner-admin-flow-chart.md](c:\Users\dltmd\Desktop\land-in\docs\06_partner-admin-flow-chart.md)의 제휴사 관리자 플로우는 이 문서의 `이벤트 심사 및 게시` 직전 단계로 연결됩니다.
- 현재 실제 백엔드 코드에서 운영 리스크가 큰 지점은 `Event status`, `featured`, `tagUid`, `step order`, `RewardTemplate`, `NfcScanLog` 입니다. 서비스 관리자 플로우는 결국 이 값들을 안전하게 통제하는 구조여야 합니다.
- 특히 `NfcScanResult` 로그와 `RewardStatus` 분포는 운영자가 서비스 품질을 체감하는 핵심 지표가 될 가능성이 큽니다.
- 아직 관리자 역할/권한 모델이 없기 때문에, 실제 구현 시에는 최소한 `service admin > partner admin > end user`의 권한 레이어를 먼저 정의하는 것이 좋습니다.
