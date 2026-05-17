# Temp Chaincode Drafts

이 디렉터리는 Land-In 사진 기반 NFT 기능 검토용 임시 체인코드 초안이다.

- 실행/배포용이 아니라 구조 검토용
- 실제 반영 시 `dev-mode/chaincode/...`, `dev-mode/land-in/contracts/...`로 이동
- 기준 기능:
  - `VerifyVisit`
  - `RecordNFTMint`
  - `GrantPointAfterNFTMint`
  - `UsePoint`

포함 파일:

- `fabric/main.go`
- `fabric/contract/visit_contract.go`
- `fabric/contract/nft_record_contract.go`
- `fabric/contract/reward_contract.go`
- `fabric/contract/query_contract.go`
- `fabric/model/visit.go`
- `fabric/model/nft_mint_record.go`
- `fabric/model/reward_ledger.go`
- `fabric/pkg/keys.go`
- `polygon/LandinPhotoNFT.sol`
