# Land-in Progress Handoff

Last updated: 2026-04-09

## Purpose

This document records the current implementation status, deployment status, completed debugging work, and the next tasks needed to continue the project without losing context.

## Current Product Direction

Land-in is a mobile-first tourism service where users:

1. Join/login with a Land-in account
2. Visit real landmarks
3. Tap an NFC tag on-site
4. Verify the visit through the app
5. Receive a collectible NFT-like reward
6. Eventually receive a real on-chain NFT after wallet integration and blockchain minting are completed

Current production behavior is still mostly off-chain. NFC verification works, but blockchain minting has not been implemented yet.

## Deployment Status

### Frontend

- Deployed on Vercel
- Active public domain:
  - `https://land-in-eight.vercel.app`

### Backend

- Deployed on Railway
- Active public domain:
  - `https://land-in-production.up.railway.app`

### Database

- Railway MySQL is connected and working
- Backend is now able to seed initial data into Railway MySQL

## Environment Setup Notes

### Vercel

The frontend must use this environment variable:

```env
VITE_API_BASE_URL=https://land-in-production.up.railway.app/api
```

Important:

- The `/api` suffix is required
- Vercel must be redeployed after changing environment variables

### Railway

The backend was configured to work with Railway MySQL using:

```env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://land-in-eight.vercel.app,https://*.vercel.app
JWT_SECRET=<set in Railway, do not commit secrets>
```

Important:

- The backend must run with the `prod` profile in Railway
- `allowPublicKeyRetrieval=true` was required for Railway MySQL authentication

## Backend Initialization / Seed Data

Initial data is created by:

- `backend/src/main/java/com/landin/backend/config/DataInitializer.java`

This component currently runs for these profiles:

- `local`
- `prod`
- `production`

It creates:

- event catalog
- steps
- NFC tags
- NFT templates
- reward templates
- demo user
- demo user event participation
- demo user step completions
- demo user NFTs
- demo user rewards

Database schema generation is handled by:

- `backend/src/main/resources/application.yml`

with:

```yaml
spring.jpa.hibernate.ddl-auto: update
```

## NFC Flow Status

### What works now

- NFC reading from Android Chrome works
- Tag verification request reaches the backend
- Verified scans are saved in `nfc_scan_logs`
- NFC tags are registered in `nfc_tags`
- Example successful verified tag:
  - `TAG-PARIS-001`

### Important implementation details

- The frontend tag page supports:
  - direct Web NFC reading
  - URL-based verification via `/tag?tagUid=...`
  - Smart Poster parsing (nested records)

Main files:

- `frontend/src/pages/tag/TagPage.jsx`
- `frontend/src/api/nfc.js`
- `backend/src/main/java/com/landin/backend/domain/nfc/service/NfcService.java`

### Known NFC gotchas already discovered

- Old frontend builds cached on mobile can cause stale behavior
- After a new Vercel deployment, mobile browser refresh may be required
- Kakao in-app browser did not work reliably for Web NFC
- Android Chrome worked correctly

### Current tag writing guidance

For production domain testing, NFC tags should use:

```text
https://land-in-eight.vercel.app/tag?tagUid=TAG-PARIS-001
```

or any other registered tag UID, such as:

```text
https://land-in-eight.vercel.app/tag?tagUid=TAG-PARIS-003
```

For the simplest testing, plain text tags containing only the UID are still safer than Smart Poster format.

## NFT Status

### What the app does now

The current service does **not** mint real blockchain NFTs yet.

Instead, when NFC verification succeeds, the backend creates an off-chain NFT record in the database.

Main backend flow:

- `backend/src/main/java/com/landin/backend/domain/nfc/service/NfcService.java`

This saves:

- `StepCompletion`
- `UserNft`

### Important clarification

Current “NFT issuance” means:

- DB-based collectible issuance
- not wallet-based minting
- not on-chain ownership
- no smart contract call
- no transaction hash

## Fixes Already Completed

### Deployment / infrastructure

- Added frontend API base URL support via environment variable
- Added Vercel routing config
- Fixed Railway deployment profile handling
- Fixed Railway MySQL JDBC connection issues
- Fixed CORS for deployed frontend domain

### Data seed / initialization

- `DataInitializer` was extended to run on deploy profiles
- Seed logic was improved to recover partially seeded databases
- Missing event/step/tag/template/reward data can now be inserted even when some rows already exist

### NFC / frontend

- Added Web NFC permission prompt flow
- Added Smart Poster nested record parsing
- Fixed domain handling for deployed tag URLs
- Confirmed backend receives successful NFC scans

### NFT read-model bug

- Fixed lazy loading issue in NFT listing by fetching the related event in `UserNftRepository`

## Wallet Integration Status

### Confirmed target

- Testnet: **Hoodi**

### Backend work already added

Backend already has initial wallet-connection support:

- user entity fields for wallet information
- wallet connection request DTO
- `/api/auth/wallet` endpoint
- Hoodi chain validation in the backend service

Relevant backend files:

- `backend/src/main/java/com/landin/backend/domain/user/entity/User.java`
- `backend/src/main/java/com/landin/backend/domain/user/dto/WalletConnectRequest.java`
- `backend/src/main/java/com/landin/backend/domain/user/dto/AuthResponse.java`
- `backend/src/main/java/com/landin/backend/domain/user/dto/UserProfileResponse.java`
- `backend/src/main/java/com/landin/backend/domain/user/service/UserService.java`
- `backend/src/main/java/com/landin/backend/domain/user/controller/AuthController.java`

### Frontend work already added

Frontend wallet onboarding work has started:

- wallet connect utility
- wallet API client
- wallet connect page
- login/signup redirect to wallet connect when no wallet is linked
- my page wallet section for later reconnection

Main files:

- `frontend/src/utils/wallet.js`
- `frontend/src/api/wallet.js`
- `frontend/src/pages/wallet/WalletConnectPage.jsx`
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/pages/login_all/Login.jsx`
- `frontend/src/pages/login_all/Join.jsx`
- `frontend/src/pages/mypage/MyPage.jsx`
- `frontend/src/router.jsx`

### Current UX direction

After signup/login:

1. If wallet already exists, go home
2. If wallet is not connected, show wallet onboarding page first
3. User can:
   - connect wallet
   - skip for now
4. User can reconnect later from My Page

## Mobile Wallet Risk / Decision

This is a mobile-first tourism product, so wallet handling needs extra care.

### Important limitation

`window.ethereum` works well on desktop with MetaMask extension, but mobile regular browsers may not inject a provider.

That means:

- desktop Chrome + MetaMask extension: usually fine
- mobile Chrome: may fail
- mobile wallet in-app browser: more reliable

### Recommended next direction

Do not depend only on injected wallet discovery for the final product.

Recommended production direction:

- keep account signup/login first
- allow wallet connection as onboarding
- support skip
- add a mobile-friendly wallet connection method such as WalletConnect / MetaMask mobile connection flow

## Remaining Work

### High priority

1. Finalize frontend wallet onboarding UX and validate on mobile
2. Test the `/api/auth/wallet` flow end-to-end on deployed environments
3. Decide whether mobile wallet connection will use:
   - injected provider only
   - WalletConnect
   - MetaMask mobile browser flow

### Blockchain implementation

1. Define real minting architecture on Hoodi
2. Create smart contract (ERC-721 or ERC-1155)
3. Add wallet address as part of functional Web3 user state
4. Add on-chain NFT fields to DB, such as:
   - wallet address
   - contract address
   - chain id
   - token id
   - transaction hash
   - mint status
5. Replace DB-only “minting” with:
   - NFC verification success
   - mint request creation
   - blockchain transaction
   - confirmation tracking

### Product logic

1. Add location-based verification if required by the product spec
2. Decide whether NFC verification without wallet should:
   - create off-chain records only
   - queue pending mints
   - block minting until wallet is linked

## Suggested Next Session Starting Points

If work resumes later, the most efficient next checks are:

1. Run frontend build
2. Run backend compile
3. Deploy frontend to Vercel
4. Deploy backend to Railway
5. Test wallet onboarding on mobile
6. Decide final mobile wallet connection strategy
7. Start Hoodi smart contract + minting flow design

## Useful Checkpoints

### Confirm backend seed success

Check:

- `events`
- `steps`
- `nfc_tags`
- `users`
- `user_nfts`
- `nfc_scan_logs`

### Confirm NFC success

Look for:

- `SUCCESS` rows in `nfc_scan_logs`
- matching `tag_uid` values such as `TAG-PARIS-001`

### Confirm frontend is using the correct backend

The frontend should send requests to:

```text
https://land-in-production.up.railway.app/api
```

not to:

```text
/api
```

unless local proxy mode is intended.

## Notes

- Do not commit real secrets into the repository
- Mobile browser caching can make debugging misleading after Vercel redeploys
- Railway DB and Vercel frontend are already working enough for account and NFC verification testing
