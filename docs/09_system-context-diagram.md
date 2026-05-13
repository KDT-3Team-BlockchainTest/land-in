# Land-in 시스템 컨텍스트 다이어그램

현재 코드와 배포 문서 기준의 상위 시스템 경계입니다.

```mermaid
flowchart LR
    user["사용자<br/>모바일 브라우저"]
    admin["서비스/제휴 관리자<br/>운영 데이터 관리<br/>Partner Admin Console"]
    nfcTag["현장 NFC 태그<br/>tagUid 또는 URL 저장"]
    webNfc["브라우저 Web NFC API<br/>Android Chrome 중심"]
    metamask["MetaMask 지갑<br/>Injected provider / Mobile browser"]
    hoodi["Hoodi Testnet<br/>RPC 네트워크"]
    contract["LandinBadgeNFT<br/>ERC-721 스마트 컨트랙트"]

    subgraph landin["Land-in 시스템"]
        frontend["Frontend SPA<br/>React + Vite<br/>Vercel 배포"]
        adminFrontend["Admin SPA<br/>React + Vite<br/>로컬/별도 배포 가능"]
        backend["Backend API<br/>Spring Boot<br/>Railway 배포"]
        mysql["MySQL DB<br/>Railway MySQL<br/>JPA ddl-auto update"]
    end

    user -->|"이벤트 탐색, 로그인, 컬렉션/NFT/리워드 조회"| frontend
    user -->|"현장 태그 스캔"| nfcTag
    nfcTag -->|"UID 또는 /tag?tagUid=..."| webNfc
    webNfc -->|"태그 값 전달"| frontend

    frontend -->|"REST API<br/>/api/auth, /api/events, /api/nfc, /api/nfts, /api/rewards"| backend
    backend -->|"사용자, 이벤트, 스텝, NFC 태그,<br/>참여, NFT, 리워드, 스캔 로그 저장"| mysql

    frontend -->|"지갑 연결 요청<br/>Hoodi chainId 검증용 정보 수집"| metamask
    metamask -->|"walletAddress, chainId, provider"| frontend
    frontend -->|"PATCH /api/auth/wallet"| backend

    backend -->|"NFC 검증 성공 시<br/>StepCompletion, UserNft, UserReward 생성"| mysql
    backend -->|"wallet + chain 설정 완료 시<br/>safeMint(address,string)"| hoodi
    hoodi -->|"트랜잭션 실행"| contract
    contract -->|"Transfer 이벤트 / tokenId"| hoodi
    hoodi -->|"tx hash, receipt"| backend
    backend -->|"민팅 상태, tokenId, transactionHash 저장"| mysql

    contract -.->|"tokenURI 조회 대상"| backend
    backend -.->|"GET /api/nfts/{nftId}/metadata"| contract

    admin -->|"로그인, 이벤트/스텝/NFC/리워드 등록/수정"| adminFrontend
    adminFrontend -->|"REST API<br/>/api/admin/auth, /api/admin/events, /api/admin/uploads"| backend
```

## 컨텍스트 요약

- 사용자는 Vercel에 배포된 React 앱을 통해 로그인, 이벤트 참여, NFC 인증, NFT/리워드 조회를 수행합니다.
- NFC 태그는 자체 서버가 아니라 `tagUid` 또는 `/tag?tagUid=...` URL을 담는 물리 매체입니다.
- 백엔드는 Railway의 Spring Boot API이며 인증, 이벤트, 참여, NFC 검증, NFT, 리워드 도메인을 처리합니다.
- MySQL은 현재 JPA `ddl-auto: update`로 스키마가 생성되는 영속 저장소입니다.
- 지갑 연결은 MetaMask를 통해 주소와 Hoodi 체인 정보를 백엔드에 저장합니다.
- 온체인 민팅은 백엔드가 Hoodi RPC로 `LandinBadgeNFT.safeMint(address,string)`를 호출하는 구조입니다.
- 관리자/제휴사 운영 흐름은 `frontend-admin` React 앱과 `/api/admin/**` 백엔드 API로 구현되어 있습니다.
- 관리자 계정은 `admins` 테이블에 저장되며, 초기 계정은 `AdminBootstrap`이 관리자 데이터가 없을 때 1회 생성합니다.
- 관리자 콘솔에서 이벤트, 스텝, NFC 태그 UID, NFT 템플릿, 완료 보상 템플릿을 등록하고 대표 이미지는 `/api/admin/uploads/images`로 업로드합니다.
