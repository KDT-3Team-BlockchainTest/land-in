Backend Requirements              
                                                                                      
  ---    
  1. Overview
                                                                                       
  The frontend is a fully functional dummy-data SPA. Every piece of state that
  currently lives in data/*.js files or localStorage represents a backend              
  responsibility. The following document enumerates what the backend must own, derived
  from reading actual frontend code.

  ---
  2. Required Backend Domains / Modules

  User / Auth
  - User identity, profile metadata, session management

  Event
  - Event catalog (title, dates, status, steps, city, country, partner)
  - Event lifecycle management (upcoming → featured → active → completed → ended)

  Participation
  - Per-user event join records
  - Per-user per-step progress (done / current / locked)

  Tag / NFC
  - NFC tag verification
  - Tag-triggered step advancement
  - Anti-replay / duplicate tag prevention

  NFT
  - NFT minting on successful tag
  - Per-user NFT inventory
  - NFT metadata (image, name, rarity, associated event/step)

  Collection
  - Collection completion detection (all steps done → completed)
  - Collection status derivation (ongoing / completed / ended)

  Reward
  - Reward issuance on collection completion
  - Reward catalog (title, description, partner, validity, coupon code)
  - Reward status lifecycle (available → used → expired)
  - Coupon code generation and validation

  Dashboard / Stats
  - Aggregated stats per user: NFT count, city count, country count, completed
  collection count, distance traveled (if tracked), active event count

  ---
  3. Required Business Capabilities

  3.1 User Registration and Authentication
  Evidence: MyPage.jsx hardcodes "지현" as the username with a static avatar. The
  frontend has no login flow, but a real backend requires identity. All participation,
  progress, and rewards are inherently per-user.
  Capability needed: Create account, authenticate, return session token, fetch own
  profile.

  3.2 Event Discovery
  Evidence: data/events.js exports eventCatalog, featuredEvent, activeEvents,
  upcomingEvents. These are static arrays that drive Home.jsx (featured banner, active
  event list, upcoming list) and EventDetailPage.jsx.
  Capability needed: Return event list filterable by status. Return single event by ID
  with full step list.

  3.3 Event Participation (Join)
  Evidence: useJoinedEventIds in hooks/useJoinedEventIds.js writes to localStorage key
  land-in-joined-event-ids. joinEvent(id) is the only write path in the entire app.
  Default joined IDs are seeded from data/eventParticipation.js as
  DEFAULT_JOINED_EVENT_IDS = ["paris-spring-2026", "seoul-palace-2026",
  "jeju-coast-2025"].
  Capability needed: Record that a user has joined an event. Return list of event IDs
  the user has joined. Enforce join only once per user per event.

  3.4 NFC Tag Verification and Step Advancement
  Evidence: TagPage.jsx runs a 5-phase state machine: ready → scanning → verified →
  minting → minted. The "scanning" and "verified" phases are timer-simulated with no
  real network call. After minted, no state is persisted anywhere — localStorage is not
   written, no API is called.
  Capability needed:
  - Accept a tag payload (NFC tag ID or signed token from the physical tag)
  - Validate that the tag corresponds to a real step in a real event
  - Validate that the requesting user has joined that event
  - Validate that the step is the correct next step for that user (not already done,
  not locked ahead)
  - Advance the user's step state from current to done, unlock next step
  - Trigger NFT mint for the completed step
  - Return mint result (NFT metadata) to client

  3.5 Step Progress Tracking
  Evidence: data/events.js embeds steps arrays per event, each step has a collected:
  boolean field. RouteStepList and CollectionOverviewCard derive routeStep state
  (done/current/locked/reward) from this. Currently all step states are hardcoded in
  the event object itself with no per-user override.
  Capability needed: Store per-user per-step completion state. Return full step list
  for an event with each step's state for the requesting user.

  3.6 NFT Minting
  Evidence: TagPage.jsx phase 4 is minting, phase 5 is minted. The NftGalleryPage and
  CollectionNftCard display NFT image, name, rarity. data/events.js stores nft: {
  image, name, rarity } per step. getCollectedNfts() in collections.js returns NFTs
  only for steps where collected: true.
  Capability needed: On step completion, create an NFT record owned by the user. NFT
  must carry: image reference, name, rarity, associated event ID, associated step ID,
  mint timestamp. Return NFT metadata to client immediately after mint. Store NFT in
  user's inventory.

  3.7 Collection Completion and Reward Issuance
  Evidence: data/collections.js getCollectionStatus() returns "completed" when all
  steps in a joined event have collected: true. data/rewards.js is a completely static
  file with 5 hardcoded rewards not connected to any event completion logic.
  Capability needed: After each step/NFT write, check if all steps in the event are now
   complete for this user. If yes, mark collection as completed and issue the
  corresponding reward. Reward issuance should be idempotent (complete → reward only
  once). The reward must be associated with the specific collection/event that
  triggered it.

  3.8 Reward Management
  Evidence: RewardsPage.jsx reads rewardCatalog from data/rewards.js. Each reward has:
  id, title, collectionName, description, validUntil, usedDate, status
  (available/used/expired), couponCode, partner, howToUse, emoji, accentColor.
  RewardCodeModal.jsx displays the coupon code and a CSS-placeholder QR code.
  Capability needed:
  - Store rewards per user
  - Return user's reward list filterable by status
  - Accept a "use reward" action → transition status from available to used, record
  usedDate
  - Generate real coupon code on issuance
  - Generate real QR code (either server-side image or a URL that a QR library can
  encode client-side)
  - Handle expiry: transition available → expired based on validUntil date

  3.9 Dashboard / Stats Aggregation
  Evidence: data/dashboard.js getTagDashboard() returns {activeCollections, totalNfts,
  joinedCities, activeEventsCount}. getProfileSummary() returns {nftCount, cityCount,
  countryCount, completedCollectionCount, landmarkCount, totalDistanceLabel: "8,240
  km"}. The distance is a hardcoded string. countryCount is approximated as Math.min(3,
   trackedCollections.length).
  Capability needed:
  - Compute and return aggregated stats for the authenticated user
  - nftCount: count of user's minted NFTs
  - cityCount: count of distinct cities from events the user has joined
  - countryCount: count of distinct countries — requires country field on events
  (currently city is stored but country is not explicit in data/events.js)
  - completedCollectionCount: count of events where all steps are done
  - landmarkCount: likely equivalent to total steps completed (needs confirmation)
  - totalDistanceLabel: if this is to be real, requires GPS data per landmark or
  hardcoded distance per step — this is the most ambiguous stat

  ---
  4. Required Persistence / Data Storage

  Users table
  Fields (minimum): id, display_name, avatar_url, created_at

  Events table
  Fields: id (slug), title, city, country, status, start_date, end_date, description,
  featured flag, partner info, hero image reference, map image reference, theme color

  Steps table
  Fields: id, event_id, order_index, place_name, place_description, image references,
  nfc_tag_id (the physical tag identifier), nft_name, nft_image_reference, nft_rarity,
  is_final_step (reward trigger)

  Event Participations table
  Fields: user_id, event_id, joined_at
  Constraint: unique (user_id, event_id)

  Step Completions table
  Fields: user_id, step_id, completed_at, nft_id (FK)
  Constraint: unique (user_id, step_id)

  NFTs table
  Fields: id, user_id, step_id, event_id, name, image_url, rarity, minted_at

  Rewards table
  Fields: id, user_id, event_id, title, description, partner, coupon_code, status,
  valid_until, used_at, issued_at

  Reward Catalog / Templates table (optional, could be static config)
  Fields: event_id, reward_title, reward_description, partner, how_to_use, emoji,
  accent_color

  ---
  5. Required Status / Lifecycle Handling

  Event status (server-managed, time-driven or admin-driven):
  upcoming → featured → active → completed → ended
  - The frontend reads status from the event object. Backend must either store explicit
   status or derive it from dates.
  - featured is a separate flag from active (the frontend shows one featured event in
  the hero banner while also listing active events separately).

  Collection status (derived, not stored):
  ongoing: user joined, at least one step done, not all done
  completed: user joined, all steps done
  ended: event status is ended, regardless of user progress
  This can be computed on read from step completion records + event status. Does not
  need to be persisted.

  Step routeStep state (derived, not stored):
  done: step completion record exists for this user
  current: no completion record, and all preceding steps are done (or it's step 0)
  locked: a preceding step is not yet done
  reward: last step, is done
  This is a pure read-time derivation from step completion records.

  Reward status (stored, with time-based transition):
  available → used: triggered by user action
  available → expired: triggered by valid_until date passing (can be computed on read,
  or batch-processed)

  NFC tag state machine (transient, not stored):
  The 5-phase animation in TagPage.jsx is purely frontend UX. The backend only needs to
   handle a single atomic verify-and-mint request. It does not need to model the
  scanning/animation phases.

  ---
  6. Required Authentication and Authorization

  Authentication
  The frontend has no login screen, but all meaningful data is per-user. Minimum viable
   auth: token-based (JWT or session cookie). Every API call that reads or writes
  user-specific data must be authenticated.

  Authorization rules (derived from frontend flows):
  - A user can only view their own participation records, NFTs, and rewards
  - A user can only advance steps in events they have joined
  - A user cannot join an event that is ended or upcoming (frontend blocks the join
  button based on event status — backend must enforce the same)
  - A user cannot complete a step out of order (step N cannot be marked done if step
  N-1 is not done)
  - A user cannot re-mint an NFT for a step they already completed

  Public vs. authenticated:
  - Event catalog (list + detail): can be public
  - Participation, progress, NFTs, rewards, stats: must be authenticated

  ---
  7. Required File / Media Handling

  Event images: hero image, map image, partner logo — referenced per event. Backend
  must store or proxy these.

  Step / place images: each step has a place image. PlaceImage.jsx uses a 2-level
  fallback (src → fallbackSrc → inline SVG placeholder). Backend must provide stable
  image URLs.

  NFT images: each NFT has an image. These are currently static filenames in
  data/events.js (e.g., referenced per step nft object). On real minting, the backend
  must return a stable NFT image URL.

  QR code for rewards: RewardCodeModal.jsx has a CSS grid as a placeholder QR. The
  backend must either:
  - Generate a QR code image server-side and return a URL, or
  - Return a scannable value (coupon code / URL) that the frontend renders as QR using
  a client-side library

  User avatars: MyPage.jsx shows a circular avatar. Backend needs to store or return
  avatar URL per user.

  No video, audio, or large binary upload flows are visible in the frontend.

  ---
  8. Domain-Specific Requirements

  NFC / Tag domain
  - Each physical NFC tag corresponds to exactly one step in one event
  - The tag payload must be verifiable (cannot be spoofed by replaying a captured
  payload)
  - The backend must reject: already-completed steps, out-of-order steps, tags for
  events the user hasn't joined, tags for events that are ended/upcoming
  - One tag scan = one step completion = one NFT mint. These must be atomic.

  NFT domain
  - NFT metadata schema must match what the frontend displays: name, image, rarity
  - Rarity values seen in dummy data: "Rare", "Common", "Legendary" (no enforcement
  seen in frontend, but backend should treat as an enum)
  - NFTs are non-transferable in the current frontend (no transfer UI exists)
  - NFTs in the gallery are filterable by event — backend must return event_id with
  each NFT

  Collection domain
  - A collection is not a separate database entity — it is an event viewed through the
  lens of a user's participation and progress
  - The "collection complete" trigger is the moment all steps in an event are marked
  done for a user
  - This trigger must fire exactly once per user per event

  Reward domain
  - Rewards are issued automatically on collection completion, not manually claimed
  - Each collection has exactly one reward (one-to-one: completed event → one reward
  issued)
  - The coupon code must be unique per issuance (not shared across users)
  - Reward validity period (validUntil) must be set at issuance time — the frontend
  displays it and uses it for expiry logic

  ---
  9. Confirmed vs. Inferred Requirements

  Confirmed (directly visible in frontend code):

  ┌────────────────────────────────────┬───────────────────────────────────────────┐
  │            Requirement             │                 Evidence                  │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ Per-user event join records        │ useJoinedEventIds.js, localStorage write  │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ Per-user per-step completion state │ steps[].collected: boolean in             │
  │                                    │ data/events.js                            │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ NFT minting on tag                 │ TagPage.jsx phase 4–5                     │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ NFT inventory per user             │ getCollectedNfts(), NftGalleryPage.jsx    │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ Reward list per user with status   │ data/rewards.js, RewardsPage.jsx          │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ Reward coupon code display         │ RewardCodeModal.jsx                       │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ Event catalog with lifecycle       │ data/events.js                            │
  │ status                             │                                           │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ Dashboard stats (nftCount,         │ data/dashboard.js getTagDashboard()       │
  │ cityCount)                         │                                           │
  ├────────────────────────────────────┼───────────────────────────────────────────┤
  │ User profile display name          │ MyPage.jsx hardcoded "지현"               │
  └────────────────────────────────────┴───────────────────────────────────────────┘

  Inferred (implied by architecture, not directly modeled):

  ┌────────────────────────────────┬────────────────────────────────────────────────┐
  │          Requirement           │                     Basis                      │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ Reward issuance triggered by   │ data/rewards.js rewards reference              │
  │ collection completion          │ collectionName but no trigger logic exists     │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ QR code generation             │ CSS placeholder in RewardCodeModal.jsx         │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ NFC tag signature verification │ No verification in TagPage.jsx; needed for     │
  │                                │ security                                       │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ Country field on events        │ countryCount stat computed with Math.min(3,    │
  │                                │ length) approximation                          │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ Distance tracking              │ "8,240 km" hardcoded string — unclear if GPS   │
  │                                │ or manual input                                │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ Reward expiry batch processing │ validUntil exists but no expiry transition     │
  │                                │ logic in frontend                              │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ Event featured flag (separate  │ Frontend shows featured + active as separate   │
  │ from active)                   │ sections                                       │
  ├────────────────────────────────┼────────────────────────────────────────────────┤
  │ Step ordering enforcement      │ Frontend derives locked state from order,      │
  │                                │ backend must enforce write side                │
  └────────────────────────────────┴────────────────────────────────────────────────┘

  ---
  10. Open Questions Before Implementation

  1. Distance tracking: Is totalDistanceLabel intended to be real GPS data, a sum of
  hardcoded distances per step, or always a fixed display string? This changes
  infrastructure significantly.
  2. NFC tag format: What does the physical NFC tag contain? A plain event+step
  identifier, a signed token, or a URL? This determines the verification model.
  3. Authentication method: Social login (Kakao is common for Korean travel apps),
  phone OTP, or email/password? The frontend has no login screen, so this is fully
  open.
  4. Reward QR semantics: Does the QR encode the coupon code (static), a one-time-use
  URL (dynamic), or a partner-specific payload? Affects whether QR generation is
  server-side or client-side.
  5. Country data: Events in data/events.js have a city field. Is country inferred from
   city, stored explicitly, or looked up from an external service?
  6. Multi-user rewards: Are coupon codes unique per user per redemption, or shared
  codes per event (partner provides a pool)?
  7. NFT ownership model: Is this a "real" NFT (on-chain), a simulated NFT (off-chain
  metadata), or purely a cosmetic badge? The frontend treats it as cosmetic — this
  determines whether a blockchain integration is needed.
  8. Step out-of-order policy: Can a user visit landmarks out of geographic order?
  Frontend enforces sequential unlock, but is this a business rule or a UX choice that
  could be relaxed?
  9. Event admin interface: Is there a CMS or admin panel for creating events, steps,
  and reward templates? Not visible in the frontend, but implied by the need to manage
  the event catalog.
  10. Offline / intermittent connectivity: NFC tags are scanned in the field. Should
  the tag verification be resilient to offline conditions (queue and retry) or is
  connectivity assumed at tag scan time?

  ---
  Summary: Minimum Backend to Make the Frontend Functional

  These are the irreducible backend capabilities required to replace all dummy data and
   make the current frontend work end-to-end:

  1. Auth endpoint: return authenticated user identity (display name, avatar)
  2. Event list endpoint: return events by status (featured, active, upcoming, ended)
  3. Event detail endpoint: return one event by ID including its full step list, with
  per-user step states (done/current/locked) for the authenticated user
  4. Join event endpoint: record that a user has joined an event
  5. Tag verify + mint endpoint: validate NFC tag → advance step → mint NFT → check if
  collection complete → issue reward if so — all atomic
  6. User NFT list endpoint: return all NFTs minted by the user with event association
  7. User reward list endpoint: return all rewards for the user, filterable by status
  8. Use reward endpoint: transition a reward from available → used
  9. Dashboard stats endpoint: return aggregated nftCount, cityCount,
  completedCollectionCount, activeCollectionsCount for the user
  10. Collection list endpoint: return the user's collections (joined events) with
  derived status and progress, filterable by collection status

  Everything else — QR generation, distance tracking, country lookup, expiry batch
  jobs, admin CMS — is enhancement beyond the minimum viable backend.