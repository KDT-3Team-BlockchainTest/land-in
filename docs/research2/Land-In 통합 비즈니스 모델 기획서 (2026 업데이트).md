# Land-In 통합 비즈니스 모델 기획서 (2026 업데이트)

> 본 문서는 『Land-In 서비스 정의서』와 『Land-In 종합 분석 리포트』를 기반으로, 투자자·항공사·지자체·KTO·결제 파트너를 대상으로 한 **비즈니스 모델 중심 기획서**이다.[^1][^2]

***

## 1. 서비스 개요 및 가치 제안

### 1.1 한 문장 정의

Land-In은 한국을 방문하는 외국인 관광객이 서울·부산·강원도·제주 등 복수 광역을 여행할 때, **하나의 앱과 입국 NFT·지역 스탬프(QR·NFC)·L-Point로 이동·결제·보상을 통합 경험**하도록 만드는 광역 관광 플랫폼이다.[^1]

핵심 구조는 **B2B 정산(Hyperledger Fabric 프라이빗 블록체인) + B2C 보상(Polygon 퍼블릭 NFT) + 오프체인 개인정보 DB**로 구성된 하이브리드 아키텍처로, 지자체·항공사·KTO·PG사가 서로 신뢰 가능한 정산 레이어 위에서 외국인 관광객 UX를 통합하는 데 목적이 있다.[^2][^1]

### 1.2 해결하는 문제

- 외국인은 서울사랑상품권·부산페이(동백전)·강원사랑상품권·탐나는전 등 **지역별로 분절된 앱·결제 시스템을 각각 설치·인증**해야 하며, 여러 도시를 여행하는 동선에서 지역별 혜택을 놓치고 있다.[^1]
- 지자체·항공사·KTO는 **외국인 유치 효과를 공동으로 측정·정산할 인프라가 없고**, 서울에 70% 이상 지출이 집중되는 구조를 해소하지 못하고 있다.[^2][^1]
- NFT를 활용한 관광 패스(제주 NOWDA, 비짓부산패스, Trip.PASS 등)는 개별 지역·서비스 단위로 존재할 뿐, **국가 단위의 멀티도시·멀티항공사 통합 레이어**는 부재하다.[^2]

Land-In은 이 세 가지 문제를 한 번에 해결하는 **국가 단위 인바운드 관광 정산·보상 백본**을 지향한다.[^1][^2]

### 1.3 주요 이해관계자와 제공 가치

| 이해관계자 | 주요 니즈 | Land-In이 제공하는 가치 |
|-----------|---------|---------------------|
| 외국인 관광객 | 서울-부산-제주-강원을 통합하는 도시 여행의 단순한 결제·혜택 | 앱 하나로 전국에서 결제, NFT 스탬프 수집, L-Point 보상 |
| 지자체·관광공사 | 외국인 유치·지역 소비 확대, 예산 효율 집행 | 지역화폐·관광 보조금을 디지털 인센티브로 집행·측정 |
| 항공사(FFP) | 마일리지 부채 관리, 노선 수익성 개선 | 마일리지 → 지역 소비 유도, 탑승→소비 데이터 확보 |
| KTO·중앙정부 | 지방 분산, 정책 효과 계량화 | 광역·국가 단위 외국인 소비 KPI 통합 뷰 |
| 결제/핀테크 (Trip.PASS 등) | 외국인 사용자 온보딩, 결제 건수 확대 | 인바운드 프런트 UX, 자사 인프라는 백엔드로 활용 |

***

## 2. 시장 동향 및 기회

### 2.1 인바운드 관광 및 지역화폐 시장

- 2025년 방한 외국인 관광객은 1,893만 명으로 역대 최대치를 기록했으며, 2026년 2,036만 명 돌파가 전망된다.[^2]
- 1인당 평균 지출은 2019년 대비 17.4% 감소했고, 관광수입도 줄어 **“많이 오지만 덜 쓰는” 구조적 문제**가 발생했다.[^2]
- 방문 비율은 서울 77%대, 부산·제주 10%대 수준으로 서울 집중이 심화되고 있어, 정부는 농어촌 인구감소지역 여행 시 경비의 50%를 지역화폐로 환급하는 정책 등 지방 분산 인센티브를 확대하고 있다.[^2]
- 지역화폐 시장은 2026년 연간 발행 24조 원 규모로 성장했으며, 제주 탐나는전·서울사랑상품권 등은 외국인 접근성 개선과 NFT 관광카드 연계를 통해 인바운드 수요 흡수를 시도하고 있다.[^2]

### 2.2 NFT 관광·결제 서비스 벤치마킹

- 제주 NOWDA NFT 관광카드는 NFC 카드와 Npay NFT를 연계해 관광 보조금을 지역화폐로 지급하며, 2026년 3.0 버전에서 QR 결제와 NFT 발행을 통합했다.[^2]
- 비짓부산패스는 2023년 출시 이후 211개 가맹점·31개 판매처를 확보하고, BIG3/BIG5 패스 구성으로 체감 40~50% 할인 수준의 가치를 제공하며 지역 관광매출 확대에 기여하고 있다.[^2]
- Trip.PASS는 외국인 대상 DID 기반 KYC와 PG 인프라를 결합해 KTX·편의점·교통·선불카드 결제를 통합하는 서비스로, Land-In의 결제 백본(L2) 후보로 적합하다.[^3][^4]

이러한 선행 사례는 **지역 단위·서비스 단위 성공 모델은 존재하지만, 이를 국가 단위로 묶어줄 상위 레이어가 부재**함을 보여준다. Land-In은 이 상위 레이어를 목표로 한다.[^2]

### 2.3 항공사 마일리지·로열티 시장

- 글로벌 항공사들은 FFP(마일리지) 사업에서 높은 EBIT 기여를 얻고 있으며, 카드사·파트너사에 마일리지를 판매하는 B2B 매출 비중이 크다.[^2]
- 국내에서는 대한항공이 네이버페이 포인트 전환 비율을 25:1로 상향하는 등 마일리지의 가치·사용처 관리에 적극적이다.[^2]
- 항공사 입장에서는 **마일리지 부채(IFRS 15 하 이연수익)를 어떻게 조기 사용·수익 인식으로 전환할지**가 핵심 과제이며, Land-In의 "마일리지 → 지역 소비" 구조는 이 과제를 직접 겨냥한다.[^1]

***

## 3. 기술·데이터 아키텍처 (NFC·NFT·블록체인·DB)

### 3.1 하이브리드 블록체인 구조

Land-In의 기술 스택은 **L0~L4의 5계층 구조**로 설계된다.[^2]

| 레이어 | 기술 | 역할 | 온체인/오프체인 |
|--------|------|------|----------------|
| L4 | Land-In 앱 | Social Login, Gasless NFT, 다국어, QR 결제 | — |
| L3 | Polygon / BASE | 입국 NFT, 지역 스탬프, Explorer Pass | 퍼블릭 온체인 |
| L2 | 오케스트레이션 API | 결제 라우팅, 지역화폐 변환, KYC, 마일리지·포인트 변환 | 오프체인 |
| L1 | Hyperledger Fabric | 다자 정산, KYC 해시, 탑승 검증, 포인트 발행·소각 로그 | 프라이빗 온체인 |
| L0 | 파트너 시스템 | 항공사 PSS, 지자체 지역화폐, PG, 가맹점 POS, Trip.PASS | 오프체인 |

- **Fabric (L1)**: 항공사·지자체·KTO·PG사가 참여하는 프라이빗 블록체인으로, 각 기관별 채널에 따라 정산·감사·KYC 해시가 분리 저장된다.[^2]
- **Polygon/BASE (L3)**: 사용자 NFT(입국 NFT, 지역 스탬프, Explorer Pass 등)를 발행하는 퍼블릭 체인으로, 소유권·발행 이력·멤버십 등급 증명을 담당한다.[^2]
- **DB/IPFS (오프체인)**: 여권·KYC 결과·PNR 등 개인정보 및 NFT 메타데이터 이미지는 암호화 DB와 IPFS+CDN에 저장되고, Fabric에는 그 해시만 앵커링된다.[^2]

### 3.2 Hyperledger Fabric 기반 정산·포인트 원장

**Fabric 선택 이유**[^1][^2]
- 서울시·부산시·강원도·제주도·KTO·항공사 등 **서로 다른 법인이 단일 DB를 신뢰하지 않는 구조**에서, 신원 확인된 기관 간 다자 정산을 프라이빗하게 처리할 수 있다.
- 채널(Channel)·Private Data Collection을 활용해 **항공사정산·지역화폐정산·감사로그 채널**을 분리하고, 참여 기관별로 열람 권한을 제한할 수 있다.

**운영 비용 구조 (레퍼런스 기반)**[^2]
- PoC/MVP: ChainLaunch Free + VPS로 월 4~50달러 수준에서 Fabric 네트워크 운영이 가능하다.
- 소규모 프로덕션: VPS 직접 배포 시 월 150~600달러.
- 중규모~엔터프라이즈: Kubernetes 기반(AWS m5.xlarge) 또는 ChainLaunch Pro 사용 시 연 6만 달러 수준.
- 1,000 TPS·4노드 구성 기준 Hetzner 최적화 시 연 약 7,195달러 수준으로 운용 가능하다.

### 3.3 퍼블릭 NFT 레이어 (Polygon)

**NFT 발행 비용·Gasless 구조**[^2]
- Polygon PoS 기준 NFT 1건 민팅 비용은 0.01달러 미만이며, 평균 가스비는 트랜잭션당 0.002달러 수준이다.
- Biconomy·Gelato Relay와 같은 Gasless Relayer를 사용하면 **사용자는 서명만 하고 가스비는 플랫폼이 부담**하는 구조로 UX를 단순화할 수 있다.
- Phase 1에서 NFT 1만 건 발행 시, Gasless 기준 총 비용은 약 50달러 수준으로 사실상 무시 가능하다.

**Ethereum 메인넷 대비 우위**[^2]
- Ethereum 메인넷은 NFT 단건 민팅 비용이 비수기 8~15달러, 성수기 50달러 이상으로 Polygon 대비 1,000배 이상 비싸 관광 보상용 대량 발행에 적합하지 않다.
- Polygon 또는 BASE가 글로벌 결제·NFT 발행에 현실적인 선택지이며, Land-In은 Polygon 중심으로 설계하되 BASE 확장 가능성을 열어둔다.

### 3.4 NFC (NTAG 424 DNA) 기반 방문 인증

Land-In은 **결제 QR과 방문 인증 NFC를 분리**하여 도입 장벽과 보안 요구사항을 각각 최적화한다.[^2]

- 결제: 기존 QR(카카오페이·네이버페이·Trip.PASS 등) 또는 Land-In QR로 수행.
- 방문 미션: NTAG 424 DNA 기반 NFC 스티커를 랜드마크·관광지에 부착해 인증.

**NTAG 424 DNA 특성 및 이유**[^2]
- NFC Forum Type 4 / ISO/IEC 14443-A 규격, AES-128 기반 SUN(Secure Unique NFC) 동적 URL 생성 기능.
- 매 스캔마다 다른 URL이 생성되어 **복제·재사용 방지**, 위치 위변조를 차단한다.
- 앱 미설치 사용자는 Dynamic URL로 브라우저 랜딩, 앱 설치 유도 후 인증 가능.
- 앱 설치 사용자는 Mutual Authentication으로 더 강력한 인증과 정확 타임스탬프 기록.

**비용·배포**[^2]
- 태그 단가: 개당 0.3~0.8달러 (대량 주문 기준).
- Phase 1(30개 거점): 약 15달러 수준.
- Phase 2(500개 거점): 약 250달러 수준으로, 인프라 비용에 비해 미미.

### 3.5 개인정보 및 오프체인 DB 설계

개인정보보호법(PIPA)·GDPR 준수를 위해 **개인 식별 정보는 블록체인에 직접 저장하지 않고, 암호화 DB + 해시 앵커링 구조**를 채택한다.[^3][^2]

| 데이터 유형 | 저장 위치 | 비고 |
|-----------|---------|------|
| 여권 OCR 정보 | AES-256 암호화 DB | 해시만 Fabric Private Data에 저장 |
| KYC 결과 | 암호화 DB | 3rd party eKYC 결과 포함 |
| 탑승 기록(PNR·BCBP) | 임시 DB + 해시 | 목적 달성 후 원본 최소 보유 |
| 가맹점 카탈로그 | 일반 DB | 읽기 최적화, 비식별 정보 |
| NFT 메타데이터 이미지 | IPFS + CDN | Polygon NFT tokenURI 참조 |
| 결제 로그 | 암호화 DB | 5년 보관 의무 반영 |

***

## 4. 포인트·마일리지·지역화폐 정책 (Tokenomics)

### 4.1 L-Point 기본 설계 원칙

- L-Point는 **법정통화 1:1 연동 결제 크레딧**로, 투기성 가상자산이 아닌 관광 소비 인센티브 성격을 명확히 한다.[^2]
- 현금 환급·타 가상자산 전환을 금지하고, 사용처를 제휴 가맹점·관광 서비스로 제한해 전자금융업·가상자산 규제 충돌을 최소화한다.[^3][^2]
- 개인별 보유 한도는 50만 원 이내로 설계하여 소액 선불 특례 구간에 머물게 하고, 유효기간은 발행일로부터 1년 (만료 시 운영사 수익 귀속)으로 설정한다.[^2]

**포인트 재원 구조**[^2]

| 재원 출처 | 발행 기준 | 포인트 형태 |
|-----------|---------|-------------|
| 지자체 관광 보조금 | 지자체 예산 100% | 지역 제한 L-Point |
| 항공사 파트너십 fee | 탑승 1건당 계약 단가 | 광역 L-Point |
| 플랫폼 자체 예산 | MAU 프로모션 | 광역 L-Point |
| QR 결제 수수료 일부 | 결제액의 0.3~0.5% | 적립형 L-Point |

### 4.2 지자체 투자·포인트 발행 메커니즘

**예시: 강원도 Phase 1**[^2]

- 강원도 외국인 관광 예산 배정: 5억 원
  - SaaS 이용료: 1억 원
  - NFT 발행·운영 비용: 0.1억 원
  - L-Point 인센티브 재원: 3.9억 원
- L-Point 발행 규모: 3억 9,000만 포인트 (1포인트 = 1원)
- 목표 사용자 1,000명 기준 1인당 최대 39,000포인트 (약 27달러)까지 지급 가능.

**포인트 지급 트리거·단가 가이드**[^2]

| 이벤트 | 지급 포인트 | 기준 |
|--------|-----------|------|
| 입국 NFT 발행 | 5,000~10,000 | 파트너 항공사 탑승 검증 후 |
| 지역 첫 방문 스탬프 | 2,000~3,000/지역 | GPS·NFC·QR 복합 검증 |
| 가맹점 첫 결제 | 결제액의 5~10% | 지역·업종별 차등 |
| 스탬프 N개 달성 | 10,000~50,000 | 등급 업그레이드 NFT 포함 |
| SNS 공유·리뷰 | 500~1,000 | 월 1회 한도 |

지자체는 L-Point를 **정책 예산 집행 도구**로 바라보며, 예산 대비 체류일수·지역별 소비·재방문율과 같은 KPI를 Fabric·NFT 데이터를 통해 투명하게 보고받는다.[^1][^2]

### 4.3 항공사 마일리지 ↔ L-Point 전환 구조

**현행 레퍼런스**[^2]
- 대한항공 스카이패스: 네이버페이 포인트 → 마일리지 전환 비율 25:1.
- 아시아나는 탑승 마일 1:1, 제휴 마일 0.82:1 기준 대한항공으로 통합 예정.
- LCC는 별도 마일리지 프로그램이 없거나 단순 포인트 구조로 협상 난이도가 낮다.

**Land-In 설계안**[^1][^2]

- Phase 1: LCC와 단순 파트너십
  - IATA BCBP 스캔 또는 PNR 입력으로 탑승 검증.
  - 마일리지 전환이 아닌 **입국 L-Point 직접 지급** 방식.
- Phase 2: FSC 마일리지 → L-Point 단방향 전환
  - 마일리지 1마일당 원화 15~25원 상당의 가치 기준 협상.
  - 마일리지 → L-Point 전환만 허용, 역전환(L-Point → 마일리지)은 미지원.
  - 전환 수수료 5~10% 부과 및 사용처를 관광 소비로 제한해 마일리지의 현금화 해석을 방지.

**금지 원칙**[^3][^2]
- L-Point → 현금·현금성 자산 환급.
- L-Point → 타 항공사 마일리지 교차 전환.
- 미사용 L-Point의 현금 환급.

### 4.4 지역화폐 ↔ L-Point 정책 및 법적 포지셔닝

**법제도 상황**[^3][^2]
- 지역사랑상품권법은 외국인 사용을 명시 금지하지 않으나, **플랫폼 포인트와의 쌍방 전환에 대한 명시 규정은 없다**.
- 서울사랑상품권은 영문 성명 가입을 허용하는 등 외국인 접근성을 점진적으로 개선 중이다.
- 탐나는전은 NOWDA NFT와 연계해 관광 보조금을 지역화폐로 지급·관리하는 선례를 만들고 있다.

**Land-In 추천 구조**[^3][^2]

| 전환 방향 | 가능성 | 설계안 |
|-----------|------|-------|
| L-Point → 지역화폐 결제 대리 | 높음 | L-Point로 결제 시 플랫폼이 지역화폐로 가맹점에 대신 결제 |
| 지역화폐 → L-Point | 회색지대 | 지자체 MOU·법무 검토 후 부분 허용 가능 |
| 지역화폐 잔액 조회·연동 | 높음 | 읽기 전용 API + 사용자 동의 |

실무 설계에서는 **직접 전환 대신 “결제 대리” 구조**를 채택해 법적 리스크를 줄인다.[^3][^2]

***

## 5. NFT 발급·운영 비용과 수익 모델

### 5.1 NFT 발급 프로세스 및 비용 구조

**발급 플로우 (입국 NFT 예시)**[^2]

1. 입국 이벤트 발생 (탑승권 QR/BCBP 스캔 또는 PNR 입력).
2. Hyperledger Fabric에 탑승 검증 이벤트 기록 (가스비 없음).
3. 오케스트레이션 API가 조건(파트너 항공사, 목적지, 체류일수 등) 검증.
4. Gasless Relayer가 Polygon에 NFT 민팅 트랜잭션 제출.
5. 사용자의 지갑(앱 내 지갑)에 입국 NFT 수신.

**NFT 유형별 비용 추정 (Phase 1)**[^2]

| NFT 유형 | 트리거 | 건당 Gasless 비용 | 예상 발행량 | 총 가스비 |
|---------|-------|-----------------|------------|---------|
| 입국 NFT | 파트너 항공사 탑승 | 0.005달러 | 1,000 | 5달러 |
| 지역 스탬프 | QR 결제·NFC 태깅 | 0.002달러 | 5,000 | 10달러 |
| 등급 업그레이드 | 스탬프 N개 달성 | 0.005달러 | 500 | 2.5달러 |
| 한정 콜렉터블 | 캠페인 | 0.01달러 | 100 | 1달러 |
| **합계** | | | 6,600 | **18.5달러** |

Phase 1 기준 NFT 가스비는 **월 2~3만 원 수준**으로, 전체 운영비 중 무시할 수 있는 규모다. Phase 3에서 NFT 100만 건까지 확대해도 연 2,000달러 내 관리 가능하다.[^2]

### 5.2 NFT 기반 수익 모델

1. **2차 거래 로열티**: 희귀 스탬프·등급 NFT가 OpenSea·자체 마켓에서 거래될 경우, 5~10% 로열티 수취.
2. **프리미엄 NFT 패스 판매**: Explorer Pass 등 프리미엄 NFT를 10~30달러에 판매.
3. **브랜드 스폰서 NFT**: 기업·브랜드와 제휴한 Limited Edition NFT 발행 수수료.
4. **데이터 기반 B2B 매출**: 익명화된 방문·소비 패턴을 지자체·항공사·KTO에 제공하는 구독형 데이터 서비스.

NFT 수익 모델은 **Phase 1에서는 보조 수익원**, Phase 3에서는 마케팅·데이터 사업의 핵심 레버리지로 성장할 수 있다.[^2]

***

## 6. 전체 수익·비용 구조 및 수익성

### 6.1 수익원 전체 맵

Land-In의 중장기 수익원은 다음과 같이 다각화된다.[^2]

| 수익 유형 | 설명 | Phase 1 수준 | Phase 2 수준 |
|----------|-----|------------|------------|
| QR 결제 수수료 | 결제액의 1.5~2% 정산 수수료 | 규모 제한적 | MAU 1만 × 일 1회 × 5,000원 결제 시 월 5억 결제 → 2% = 1,000만 원 |
| 지자체 SaaS 이용료 | 지역당 연 1~3억 원 라이선스 | 강원 1억 원/년 가정 | 4개 광역 4~8억 원/년 |
| 항공사 파트너십 fee | 탑승 1건당 500~2,000원 | 1,000탑승 → 100만 원/년 | 1만 탑승 → 1,500만 원/년 |
| NFT 프리미엄 판매 | Explorer Pass 판매 수익 | 100건 × 20달러 = 2,000달러 | 5,000건 × 20달러 = 10만 달러 |
| NFT 2차 로열티 | NFT 거래액의 5~10% | 초기 미미 | 커뮤니티 성장 시 Upside |
| 데이터·리포트 판매 | 인바운드 인사이트 리포트 | 미도입 | 지자체·KTO와 연 계약 |

### 6.2 운영비 구조

**외부 비용 (인건비 제외)**[^2]

| 항목 | Phase 1 월 비용 | Phase 2 월 비용 |
|------|---------------|---------------|
| Fabric 인프라 | 50달러 이하 | 300~600달러 |
| Polygon Gasless 가스비 | 5달러 이하 | 50~100달러 |
| 앱/API 서버 | 200~500달러 | 500~2,000달러 |
| KYC/eKYC | 0.5~1달러/건 × 1,000건 = 500~1,000달러 | 5,000~10,000달러 |
| 법무·컴플라이언스 | 초기 1,000만 원 (일회성) | 연 500만 원 유지 |

KRW 환산 시 Phase 1 총 외부 운영비는 **월 100~200만 원 수준**, Phase 2는 **월 500~1,500만 원 수준**으로 추산된다.[^2]

### 6.3 단계별 수익성 판단

- **Phase 1 (강원 파일럿)**: 지자체 SaaS 1억 원/년(월 833만 원) + 항공사 fee·QR 수수료를 감안하면, 외부 비용(150만 원/월 내) 기준으로는 흑자 구조가 가능하다.[^2]
- **Phase 2 (4개 광역)**: 지자체 SaaS 4~8억 원/년(월 3,300~6,700만 원)과 QR 수수료·항공사 fee를 합산하면, 외부 비용(500~1,500만 원/월)을 크게 상회하는 흑자 구간에 진입한다.[^2]
- **Phase 3**: FSC·OTA·NFT 마켓플레이스·데이터 사업이 더해지면, 월 수익 1억 원 이상 규모도 도달 가능하다는 시나리오가 제시된다.[^2]

***

## 7. 법적·규제 리스크와 대응 전략

### 7.1 리스크 매트릭스

| 법률/규제 | 리스크 수준 | 쟁점 | 대응 방향 |
|-----------|-----------|-----|---------|
| 전자금융거래법 | 높음 | L-Point 선불전자지급수단 해당 여부 | 한도·사용처 제한, 현금화 금지, 법무 의견서 확보 |
| 지역사랑상품권법 | 중간 | 포인트 ↔ 지역화폐 전환 근거 부재 | 결제 대리 구조, 지자체와 MOU 기반 구현 |
| 개인정보보호법(PIPA) | 높음 | 여권·KYC·탑승 데이터 처리 | 최소 수집·해시 앵커링, CPO·DPO 지정 |
| GDPR | 높음 | EU 거주자 데이터 처리 | SCC·DPA 계약, 동의 절차 정비 |
| 가상자산이용자보호법 | 중간 | NFT·포인트의 가상자산 판단 | 투자성 배제, 관광 보상 용도로 한정 |
| 항공사 PSS·PNR | 높음 | 실시간 API 연동 부담 | Phase 1에서는 BCBP 스캔·PNR 수동 입력으로 우회 |

Land-In은 **선불업 등록을 피하는 방향이 기본 시나리오**지만, 성장 단계에서 특정 매출구조가 선불업·전자금융업과 충돌할 경우 등록 옵션도 열어 둔 채 설계한다.[^3][^2]

### 7.2 핵심 쟁점별 설계 원칙

1. **선불전자지급수단 회피 조건**[^3][^2]
   - 개인당 잔액 50만 원 이하.
   - 사용처: 제휴 가맹점·관광 서비스 한정.
   - 현금 환급 불가.
   - 목적: 관광 인센티브(공공정책 연계)로 명시.
2. **개인정보·국외 이전**[^3][^2]
   - 여권 정보는 KYC 완료 후 즉시 파기, 해시만 Fabric에 저장.
   - 항공사·지자체와의 데이터 공유는 DPA·SCC 등 표준 계약을 통해 정당화.
3. **가상자산 규제 회피**[^2]
   - L-Point를 온체인 토큰으로 발행하지 않고, 오프체인 포인트 + 온체인 NFT 조합으로 설계.
   - NFT는 투자 상품이 아닌 "관광 스탬프·멤버십"으로 포지셔닝.

***

## 8. 파트너별 비즈니스 모델 정의

### 8.1 항공사 (특히 LCC·향후 FSC)

**비즈니스 구조**[^1][^2]
- 파트너 항공사 승객이 Land-In 입국 NFT를 받으면, 항공사는 **마일리지 부채 조기 사용·로열티 사업 수익화·노선별 지역 소비 데이터 확보**라는 세 가지 이익을 얻는다.
- LCC의 경우 별도 마일리지 인프라가 없으므로, 탑승 기록을 Fabric으로 전달하고 Land-In이 L-Point를 지급하는 구조만으로도 차별화된 서비스가 된다.

**투자·수익 구조 가이드**
- 초기 LCC 파트너에게는 **현금 투자보다 마케팅 협찬·탑승 데이터 제공**을 중심으로 협상한다.
- FSC 단계에서는 연 단위 플랫폼 사용료(연 1~3억 원) + 탑승 건당 fee(500~2,000원)를 패키지로 제안할 수 있다.[^2]

### 8.2 지자체·관광공사

**투자 구조**[^2]
- 지자체는 직접 지분투자 대신 **관광 예산을 SaaS 이용료·인센티브 예산으로 배정**하는 형태가 가장 감사·회계상 안전하다.
- 예: 연 3억 원 예산 중 1억은 플랫폼 이용료, 2억은 L-Point 인센티브 재원으로 구성.

**성과·KPI**
- 외국인 MAU, 체류일수, 지역별 소비액, 스탬프 수, 재방문율 등 지표를 Fabric·NFT 데이터를 기반으로 월 단위 리포트로 제공한다.

### 8.3 결제/핀테크 (Trip.PASS 등)

**역할 분리**[^3][^2]
- Land-In: 인바운드 관광객을 모으고 지역 스탬프·L-Point UX를 제공하는 프런트엔드.
- Trip.PASS: KYC·PG·교통 결제를 담당하는 백엔드 인프라.

**수익 배분**
- QR 결제 수수료 1.5~2% 중 일부를 Trip.PASS에 지급하고, Trip.PASS는 자사 선불카드 잔액·PG 수수료로 추가 수익을 얻는다.[^2]

### 8.4 제휴사의 금전적 이득 정량 예시

- **지자체:** 강원 파일럿 기준, 외국인 1,000명이 1인당 20만 원을 결제하면 총 2억 원의 지역 매출이 발생하고, 이 중 1.8%인 360만 원만 플랫폼 수수료로 나가며 나머지 1억 9,640만 원이 지역 상권에 귀속된다.  관광 예산 5억 원 중 3.9억 원을 L-Point 인센티브로 집행하는 구조에서, 숙박·식당·액티비티의 추가 소비 및 부가세·숙박세 등을 고려하면 **예산 대비 2배 이상 지역경제 파급효과를 목표**로 설계할 수 있다.[^2]
- **항공사(LCC):** 탑승 1건당 500~2,000원의 마케팅 fee를 Land-In에 지불하고, 입국 승객에게 L-Point·스탬프를 묶은 패키지를 제공함으로써 비수기·비인기 노선의 탑승률을 3~5%포인트만 끌어올려도 항공사 입장에서는 수억 원 단위의 추가 매출·이익을 얻을 수 있다(정확 수치는 노선·운임 구조에 따라 계약 시 산정).  또한 FFP 마일리지의 조기 사용을 유도해 IFRS 15 기준 마일리지 부채를 앞당겨 수익으로 인식하는 효과도 있다.[^1][^2]
- **KTO·중앙정부:** 지자체별로 흩어진 관광 예산을 Land-In 같은 통합 인프라를 통해 집행하면, 중앙 차원에서 "서울 vs 지방" 소비 구조·체류일수·재방문율을 한 번에 측정할 수 있어, **정책당 비용 대비 효과(예: 지방 체류 1박 증가당 소요 예산)**를 정량 평가하는 기반이 된다.[^2]
- **PG/결제·핀테크(Trip.PASS 등):** Land-In을 통해 유입되는 외국인을 자사 선불카드·결제망으로 온보딩하면, 결제 수수료·선불 잔액 운용 수익이 늘어나는 동시에 KYC·AML 인프라를 추가로 활용할 수 있다.[^3][^2]

### 8.5 Trip.PASS와의 경쟁·협력 시나리오

Trip.PASS는 이미 외국인 eKYC·선불카드·PG·교통(지하철·버스·KTX 일부) 결제 인프라를 보유한 강력한 경쟁자이자 잠재적인 핵심 파트너다.[^3][^2]

**시나리오 A — 독립 경쟁 구조:**
- 구조: Trip.PASS와 Land-In이 각자 앱·포인트·제휴망을 유지하며 별도 경쟁.
- 장점: 전략·제품 로드맵을 타사에 종속되지 않고 자유롭게 설계할 수 있다.
- 단점: 외국인 마케팅 비용이 양쪽에서 중복 투입되고, 지자체·항공사 입장에서는 유사 서비스가 난립해 선택과 집중이 어렵다.

**시나리오 B — 권장 구조: 백엔드 협력, 프런트 차별화:**
- 구조: Land-In은 **NFT 스탬프·L-Point·멀티 광역 UX**에 집중하고, Trip.PASS는 **eKYC·선불카드·PG·교통 결제** 백본을 제공하는 형태로 L2 오케스트레이션 레이어에서 결합한다.[^2]
- 장점: Land-In은 전자금융업·선불업 인가 부담을 줄이고 Time-to-Market을 단축할 수 있고, Trip.PASS는 새로운 인바운드 사용자와 결제 트래픽을 확보한다.[^3][^2]
- 단점: Trip.PASS 인프라에 대한 의존도가 커지며, 수수료 마진을 공유해야 하고, 장기적으로는 제품 로드맵·브랜딩에서 이해 충돌 가능성이 존재한다.

**시나리오 C — 중장기 통합·지분 제휴:**
- 구조: Land-In과 Trip.PASS가 일정 수준의 지분 교환 또는 합작법인(JV) 형태로 통합 UX·브랜드를 만들고, 백엔드 인프라를 공동으로 운영.
- 장점: 중복 개발·마케팅 비용을 줄이고, 지자체·항공사·KTO 입장에서는 "국가 단위 통합 플랫폼"으로 설득력이 커진다.
- 단점: 의사결정 구조가 복잡해지고, 기존 주주·투자자 간 이해 관계 조정이 필요하며, 규제 인허가(전자금융업, 개인정보보호) 책임이 집중된다.[^3][^2]

현 시점에서 Land-In 기획서는 **시나리오 B(Trip.PASS를 결제 백본으로 활용하는 구조)**를 기본 가정으로 삼되, 시장 반응·투자 구조에 따라 시나리오 C로의 업사이드 옵션을 열어 두는 것이 합리적인 방향으로 제안된다.  Trip.PASS는 KTO·서울시 등과 연계된 외국인 전용 모바일 패스포트·선불카드·결제·세금환급 플랫폼으로 운영되고 있으며, 교통·결제·ID 인증을 하나의 앱·카드로 제공하는 구조와 전자금융업 등록 이력을 갖고 있어[e.g. 서울시·VisitKorea·VisitSeoul 공식 안내].  제주의 NOWDA NFT 관광카드와 탐나는전(지역화폐)을 결합한 프로젝트는 NFT 기반 관광 카드와 지역화폐·관광 보조금 통합이 실제로 운영·확대되고 있음을 보여주며, 이는 Land-In의 "NFT + 지역화폐 + 관광 인센티브" 구조가 개념이 아니라 검증된 아키텍처를 광역·멀티항공사 레벨로 확장하는 것이라는 근거로 활용할 수 있다.[^5][^6][^7][^8][^9][^10][^11][^12][^2]

***

## 9. 단계별 실행 전략 및 투자 스케줄

### 9.1 Phase 1 (0~6개월, 강원 속초·양양 파일럿)

**목표**[^1][^2]
- 외국인 MAU 1,000명.
- QR 결제 5,000건.
- NFT 1만 건 발행.
- 지역화폐 연동 1개(강원사랑상품권 혹은 강원+속초 복합 구조).

**투자·비용**
- 지자체 SaaS 및 인센티브 예산: 5억 원 (위 예시 구조).
- Fabric·서버·NFT 가스비·KYC 등 외부 비용: 월 100~200만 원.

**주요 연동 스코프**
- 항공사: 파라타에어·비엣젯 등 LCC 1개.
- 결제 백본: Trip.PASS API.
- 지역화폐: 강원 지역화폐 API 읽기 + 결제 대리 구조.

### 9.2 Phase 2 (6~18개월, 4개 광역 확장)

**목표**[^2]
- 외국인 MAU 1만 명.
- 서울·부산·강원·제주 4개 광역 지역화폐 연동.
- 항공사 2~3개(LCC+FSC).

**투자·수익 구조**
- 지자체 SaaS: 지역당 연 1~3억 원 × 4개.
- 항공사 fee·QR 수수료 확대.
- 외부 비용: 월 500~1,500만 원 수준.

### 9.3 Phase 3 (18개월+, FSC·OTA·NFT 마켓플레이스)

**확장 방향**[^2]
- FSC(PSS NDC API) 연동으로 정교한 마일리지·L-Point 전환 서비스 출시.
- Agoda·Klook 등 OTA와 화이트레이블 NFT 패스 공급 계약 체결.
- 자체 또는 파트너 NFT 마켓플레이스에서 스탬프·Explorer Pass 2차 거래 활성화.

***

## 10. 인베스터·파트너용 메시지 정리

### 10.1 투자 포인트

1. **거대한 시장 + 정책 드라이브**: 2026년 2,000만 명 인바운드 시대, 정부의 지방 분산·지역화폐 고도화 정책과 정면으로 맞닿은 서비스.[^2]
2. **차별화된 기술 구조**: Fabric + Polygon 하이브리드, NFC 스탬프, Gasless NFT 등 검증된 기술 조합으로 구현 가능한 구조.[^1][^2]
3. **명확한 수익 모델**: 지자체 SaaS, QR 수수료, 항공사 fee, NFT/데이터 수익 등 다각화된 수익원.
4. **법적 리스크 관리 전략 내장**: PIPA·전자금융·지역화폐·가상자산 규제에 대한 사전 설계와 회피·완화 전략 이미 정의.

### 10.2 항공사·지자체 설득용 한 줄 메시지

- **항공사**: "탑승객이 한국에서 어디에 얼마를 쓰는지까지 연결해 주는 첫 번째 로열티 인프라입니다."
- **지자체/KTO**: "서울에만 몰리던 외국인 소비를 귀 지역으로 가져와, 그 효과를 정량적으로 보여주는 디지털 관광 인센티브 플랫폼입니다."

***

*본 기획서는 2026년 5월 기준, Land-In 프로젝트 내부 정의서·분석 리포트 및 관련 조사 자료를 종합해 작성되었으며, 실제 파트너 협상 시 단가·비율·법적 해석은 별도의 계약·법무 검토를 통해 확정해야 한다.*

---

## References

1. [11.-Land-In-seobiseu-jeongyiseo-eobdeiteu-2026.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80ccc35b-9da6-4fb4-96b9-88e38dff9494/1b32b661-f48b-47c2-b319-bd8e1ae5f716/11.-Land-In-seobiseu-jeongyiseo-eobdeiteu-2026.md?AWSAccessKeyId=ASIA2F3EMEYEYYEKYTUA&Signature=j8CCrJ1fver%2B9FoZbZpruSd5S7o%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEFEaCXVzLWVhc3QtMSJIMEYCIQD4RZzbPSWUqWPqXnYcG%2Fp8fmWtw92QarkjGHOGV3WZqwIhAPTWbhjGnyGRRQN4B7Wk9767Lepk0Pu9jPIQsf5gyialKvMECBoQARoMNjk5NzUzMzA5NzA1IgyKcmJfN1n2MTeQLMEq0ASJljzGnsmxVWi%2FwaNtZsYdJHczLDCS0P%2FP2k9x%2BNsl5kfU5tECL7NLHegBM%2FF60QMtuR5eFxlqCaJQuyY8DWe03xiFhdHwWZRlBAedEDLUE2BIv9PxdMjWju8PxOPR%2FSkEsqElCtwNSFirbc2V4u%2B0qpvB3gGqLoNkCAfHX7DSu2s%2FaxCI%2BMh2CVIibxf5Kro%2FCvW5QnsCtZP3GICD3TARwKJ%2Bi5xFTi4QvPT28sv%2FC5eDHI%2FUeBUYn99dn0bhzvSFUhey2r9ngexLa77dpaS1DE3A1fVIyo6vt24%2F5CNmTGHeCwMCVTO9L9%2Foq6jmY3SI17m9Tlg9ZIxva9L0ySALUpfky9Xcb%2BFAWhwPnopSgPycObPN27tKEQRU1dSHV1DeTvCsCApLxY4jYL5L3j%2BdyObSQuxHKvfPu3Cua0mhsh8kvuusZeHkoAFRR1IloRQj7bfiduDELUlLJrofdre0A%2BcsOXFDx9ms4weBxk%2Fe0L45BUwa17Et2mf0XVishODN6UdS9MQ%2FxAzLgwnqV6apLVt%2FqPI21%2BuBYX%2BZFStwb780HUbX%2Bl42GApdTEqLRt%2FduaHSg1hO4T3ZgMMkYqMLlKAqgvTP2nDnbcl1bwv7bAWjgVd4CVM3Ddv9ck4q%2B%2F9eMIQHXJmDy4YSdyXfJ9bBpCwKMD86z7RAwOZDz00fVdQDst5U06G4OKT3loEgM7vzTzMsB5qJX0LuGdDFgi3NTw7VA8JIglWqwAWuPZ8CfhlD4Zc3unpVWRQ5WKJSi9x47i8Ey9TwYuq0gRmnQnioMKmGiNAGOpcBLoNBrSWE0jQFmvBrH42mGZmxwlOQ0ZzNNgaWQ%2BVIAm%2FgXhLG1hLIeuDh7PdhElxk67yzqrCnMYsU4XOC%2B51gv%2BIDtph1aevWeNREGbygsvJ3KvFjF07bdqF%2BamR0hMxKHqVrNX%2FPubFlu8asXwu5mI6FASrzZPb9QYoTiJ50sV1AJoHHwj9R04Hjhq%2BTTndzzFDw%2B62FPQ%3D%3D&Expires=1778520316) - # Land-In 서비스 정의서

> **문서 목적:** 이 정의서는 Perplexity가 후속 조사를 수행할 때 "우리 서비스가 무엇인지"를 빠르게 판단하기 위한 단일 참조 기준...

2. [10.-Land-In-jonghab-bunseog-ripoteu-2026.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80ccc35b-9da6-4fb4-96b9-88e38dff9494/46b4c086-1b75-4885-ae7a-68057845aedd/10.-Land-In-jonghab-bunseog-ripoteu-2026.md?AWSAccessKeyId=ASIA2F3EMEYEYYEKYTUA&Signature=70oZdvoAkMnskZ4nuQIjgHaMQVU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEFEaCXVzLWVhc3QtMSJIMEYCIQD4RZzbPSWUqWPqXnYcG%2Fp8fmWtw92QarkjGHOGV3WZqwIhAPTWbhjGnyGRRQN4B7Wk9767Lepk0Pu9jPIQsf5gyialKvMECBoQARoMNjk5NzUzMzA5NzA1IgyKcmJfN1n2MTeQLMEq0ASJljzGnsmxVWi%2FwaNtZsYdJHczLDCS0P%2FP2k9x%2BNsl5kfU5tECL7NLHegBM%2FF60QMtuR5eFxlqCaJQuyY8DWe03xiFhdHwWZRlBAedEDLUE2BIv9PxdMjWju8PxOPR%2FSkEsqElCtwNSFirbc2V4u%2B0qpvB3gGqLoNkCAfHX7DSu2s%2FaxCI%2BMh2CVIibxf5Kro%2FCvW5QnsCtZP3GICD3TARwKJ%2Bi5xFTi4QvPT28sv%2FC5eDHI%2FUeBUYn99dn0bhzvSFUhey2r9ngexLa77dpaS1DE3A1fVIyo6vt24%2F5CNmTGHeCwMCVTO9L9%2Foq6jmY3SI17m9Tlg9ZIxva9L0ySALUpfky9Xcb%2BFAWhwPnopSgPycObPN27tKEQRU1dSHV1DeTvCsCApLxY4jYL5L3j%2BdyObSQuxHKvfPu3Cua0mhsh8kvuusZeHkoAFRR1IloRQj7bfiduDELUlLJrofdre0A%2BcsOXFDx9ms4weBxk%2Fe0L45BUwa17Et2mf0XVishODN6UdS9MQ%2FxAzLgwnqV6apLVt%2FqPI21%2BuBYX%2BZFStwb780HUbX%2Bl42GApdTEqLRt%2FduaHSg1hO4T3ZgMMkYqMLlKAqgvTP2nDnbcl1bwv7bAWjgVd4CVM3Ddv9ck4q%2B%2F9eMIQHXJmDy4YSdyXfJ9bBpCwKMD86z7RAwOZDz00fVdQDst5U06G4OKT3loEgM7vzTzMsB5qJX0LuGdDFgi3NTw7VA8JIglWqwAWuPZ8CfhlD4Zc3unpVWRQ5WKJSi9x47i8Ey9TwYuq0gRmnQnioMKmGiNAGOpcBLoNBrSWE0jQFmvBrH42mGZmxwlOQ0ZzNNgaWQ%2BVIAm%2FgXhLG1hLIeuDh7PdhElxk67yzqrCnMYsU4XOC%2B51gv%2BIDtph1aevWeNREGbygsvJ3KvFjF07bdqF%2BamR0hMxKHqVrNX%2FPubFlu8asXwu5mI6FASrzZPb9QYoTiJ50sV1AJoHHwj9R04Hjhq%2BTTndzzFDw%2B62FPQ%3D%3D&Expires=1778520316) - # Land-In 종합 분석 리포트: 시장 동향·기술 아키텍처·포인트 정책·수익성

> **작성일:** 2026년 5월 12일 | **버전:** v1.0 | **대상:** Land...

3. [8.-gugnaegyeongjaengseobiseu_unyeonggujobunseog_2026.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80ccc35b-9da6-4fb4-96b9-88e38dff9494/bc9c9030-5d33-4e35-9f20-af8a31a4e0c7/8.-gugnaegyeongjaengseobiseu_unyeonggujobunseog_2026.pdf?AWSAccessKeyId=ASIA2F3EMEYEYYEKYTUA&Signature=7or%2FKlT%2FmF4qKGtPJISB2JIN3SQ%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEFEaCXVzLWVhc3QtMSJIMEYCIQD4RZzbPSWUqWPqXnYcG%2Fp8fmWtw92QarkjGHOGV3WZqwIhAPTWbhjGnyGRRQN4B7Wk9767Lepk0Pu9jPIQsf5gyialKvMECBoQARoMNjk5NzUzMzA5NzA1IgyKcmJfN1n2MTeQLMEq0ASJljzGnsmxVWi%2FwaNtZsYdJHczLDCS0P%2FP2k9x%2BNsl5kfU5tECL7NLHegBM%2FF60QMtuR5eFxlqCaJQuyY8DWe03xiFhdHwWZRlBAedEDLUE2BIv9PxdMjWju8PxOPR%2FSkEsqElCtwNSFirbc2V4u%2B0qpvB3gGqLoNkCAfHX7DSu2s%2FaxCI%2BMh2CVIibxf5Kro%2FCvW5QnsCtZP3GICD3TARwKJ%2Bi5xFTi4QvPT28sv%2FC5eDHI%2FUeBUYn99dn0bhzvSFUhey2r9ngexLa77dpaS1DE3A1fVIyo6vt24%2F5CNmTGHeCwMCVTO9L9%2Foq6jmY3SI17m9Tlg9ZIxva9L0ySALUpfky9Xcb%2BFAWhwPnopSgPycObPN27tKEQRU1dSHV1DeTvCsCApLxY4jYL5L3j%2BdyObSQuxHKvfPu3Cua0mhsh8kvuusZeHkoAFRR1IloRQj7bfiduDELUlLJrofdre0A%2BcsOXFDx9ms4weBxk%2Fe0L45BUwa17Et2mf0XVishODN6UdS9MQ%2FxAzLgwnqV6apLVt%2FqPI21%2BuBYX%2BZFStwb780HUbX%2Bl42GApdTEqLRt%2FduaHSg1hO4T3ZgMMkYqMLlKAqgvTP2nDnbcl1bwv7bAWjgVd4CVM3Ddv9ck4q%2B%2F9eMIQHXJmDy4YSdyXfJ9bBpCwKMD86z7RAwOZDz00fVdQDst5U06G4OKT3loEgM7vzTzMsB5qJX0LuGdDFgi3NTw7VA8JIglWqwAWuPZ8CfhlD4Zc3unpVWRQ5WKJSi9x47i8Ey9TwYuq0gRmnQnioMKmGiNAGOpcBLoNBrSWE0jQFmvBrH42mGZmxwlOQ0ZzNNgaWQ%2BVIAm%2FgXhLG1hLIeuDh7PdhElxk67yzqrCnMYsU4XOC%2B51gv%2BIDtph1aevWeNREGbygsvJ3KvFjF07bdqF%2BamR0hMxKHqVrNX%2FPubFlu8asXwu5mI6FASrzZPb9QYoTiJ50sV1AJoHHwj9R04Hjhq%2BTTndzzFDw%2B62FPQ%3D%3D&Expires=1778520316) - NFT Trip.PASS LAND-IN COMPETITIVE LANDSCAPE REPORT Domestic Tourism-Payment Service Analysis 2026 Pe...

4. [국내경쟁서비스_운영구조분석_2026.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_474c3513-dab0-4421-81cd-4c172aa6fe56/6762f8e4-2790-44c2-aedc-e783a60094d2/%EA%B5%AD%EB%82%B4%EA%B2%BD%EC%9F%81%EC%84%9C%EB%B9%84%EC%8A%A4_%EC%9A%B4%EC%98%81%EA%B5%AC%EC%A1%B0%EB%B6%84%EC%84%9D_2026.pdf?AWSAccessKeyId=ASIA2F3EMEYEYYEKYTUA&Signature=uuiALwtm7Eu%2F%2B5Kjqx%2F04RGrZiU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEFEaCXVzLWVhc3QtMSJIMEYCIQD4RZzbPSWUqWPqXnYcG%2Fp8fmWtw92QarkjGHOGV3WZqwIhAPTWbhjGnyGRRQN4B7Wk9767Lepk0Pu9jPIQsf5gyialKvMECBoQARoMNjk5NzUzMzA5NzA1IgyKcmJfN1n2MTeQLMEq0ASJljzGnsmxVWi%2FwaNtZsYdJHczLDCS0P%2FP2k9x%2BNsl5kfU5tECL7NLHegBM%2FF60QMtuR5eFxlqCaJQuyY8DWe03xiFhdHwWZRlBAedEDLUE2BIv9PxdMjWju8PxOPR%2FSkEsqElCtwNSFirbc2V4u%2B0qpvB3gGqLoNkCAfHX7DSu2s%2FaxCI%2BMh2CVIibxf5Kro%2FCvW5QnsCtZP3GICD3TARwKJ%2Bi5xFTi4QvPT28sv%2FC5eDHI%2FUeBUYn99dn0bhzvSFUhey2r9ngexLa77dpaS1DE3A1fVIyo6vt24%2F5CNmTGHeCwMCVTO9L9%2Foq6jmY3SI17m9Tlg9ZIxva9L0ySALUpfky9Xcb%2BFAWhwPnopSgPycObPN27tKEQRU1dSHV1DeTvCsCApLxY4jYL5L3j%2BdyObSQuxHKvfPu3Cua0mhsh8kvuusZeHkoAFRR1IloRQj7bfiduDELUlLJrofdre0A%2BcsOXFDx9ms4weBxk%2Fe0L45BUwa17Et2mf0XVishODN6UdS9MQ%2FxAzLgwnqV6apLVt%2FqPI21%2BuBYX%2BZFStwb780HUbX%2Bl42GApdTEqLRt%2FduaHSg1hO4T3ZgMMkYqMLlKAqgvTP2nDnbcl1bwv7bAWjgVd4CVM3Ddv9ck4q%2B%2F9eMIQHXJmDy4YSdyXfJ9bBpCwKMD86z7RAwOZDz00fVdQDst5U06G4OKT3loEgM7vzTzMsB5qJX0LuGdDFgi3NTw7VA8JIglWqwAWuPZ8CfhlD4Zc3unpVWRQ5WKJSi9x47i8Ey9TwYuq0gRmnQnioMKmGiNAGOpcBLoNBrSWE0jQFmvBrH42mGZmxwlOQ0ZzNNgaWQ%2BVIAm%2FgXhLG1hLIeuDh7PdhElxk67yzqrCnMYsU4XOC%2B51gv%2BIDtph1aevWeNREGbygsvJ3KvFjF07bdqF%2BamR0hMxKHqVrNX%2FPubFlu8asXwu5mI6FASrzZPb9QYoTiJ50sV1AJoHHwj9R04Hjhq%2BTTndzzFDw%2B62FPQ%3D%3D&Expires=1778520316) - NFT Trip.PASS LAND-IN COMPETITIVE LANDSCAPE REPORT Domestic Tourism-Payment Service Analysis 2026 Pe...

5. [Trip.PASS: Travel Smart, Save Big!- VISITKOREA](https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=226871) - Trip.PASS is an all-in-one rechargeable prepaid card for international travelers visiting Korea. You...

6. [Jeju's NFT Tourist Pass NOWDA Tops 100,000 Users, Marks New ...](https://creatrip.com/en/news-feed/13629) - Jeju's NFT-based digital tourist pass NOWDA has exceeded 100,000 users just four months after launch...

7. [Travel smart in Korea using Trip.PASS](https://korea.stripes.com/travel/trip-pass-card-korea.html) - Trip.PASS is an all-in-one rechargeable prepaid card for international travelers visiting Korea. You...

8. [South Korea's Jeju Island to launch a tourism card project based on ...](https://cryptorank.io/news/feed/a17eb-jeju-island-to-launch-nft-tourism-card) - The island aims to use the NFT digital cards to provide discounts and travel subsidies to visitors. ...

9. [Jeju to launch new membership service providing points and ...](https://www.khan.co.kr/en/article/202503181743437) - The Jeju Digital Tourist Card is a “Jeju membership” system that allows anyone visiting Jeju to appl...

10. [Trip PASS | - Visit Seoul](https://english.visitseoul.net/partners-en/trip-pass) - Trip.PASS is the optimized solution for a short-term stay or foreign traveler as it provides service...

11. [New foreign tourist app allows mobile passport, payment - Korea.net](https://www.korea.net/NewsFocus/Society/view?articleId=243608) - A single mobile app allows foreign tourists in Seoul to use services in a more convenient and safer ...

12. [Naver Pay Signs NFT-Based Business Agreement with Jeju Tourism ...](https://www.asiae.co.kr/en/article/2025062013524173257) - Naver Pay and Jeju Tourism Organization to Launch NFT-Based Digital Tourism Pass "NOWDA" in Septembe...

