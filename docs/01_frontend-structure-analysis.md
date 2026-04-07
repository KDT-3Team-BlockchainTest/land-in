  ---    
  1. Overall Frontend Structure Summary
                                                                                       
  This is a mobile-first travel collectible app (max-width 420px) where users visit
  real-world landmarks, scan NFC tags on-site, and collect location-based NFTs.        
  Completing a collection of landmarks unlocks partner rewards (discounts, passes,   
  etc.).

  fe/src/
  ├── main.jsx                 ← React entry point, RouterProvider
  ├── App.jsx                  ← App shell: Header + Outlet + BottomNav
  ├── router.jsx               ← 8 routes, all children of App
  ├── index.css                ← Design tokens, reset, shared utilities
  │
  ├── assets/                  ← PNG icons (multi-state: active/inactive/white) + 3
  local place images
  │
  ├── components/
  │   ├── layout/              ← Header, BottomNav
  │   └── common/              ← 25 feature components, currently flat
  │
  ├── data/                    ← All dummy data + derived logic
  │   ├── events.js            ← Single source of truth (6 events, full shape)
  │   ├── collections.js       ← Derived from events.js, takes joinedEventIds
  │   ├── dashboard.js         ← Derived from collections.js
  │   ├── eventParticipation.js← localStorage state layer
  │   ├── profile.js           ← Achievements + settings (partially derived)
  │   └── rewards.js           ← Completely static reward catalog
  │
  ├── hooks/
  │   └── useJoinedEventIds.js ← Only hook; wraps localStorage participation state
  │
  └── pages/                   ← 8 pages, each with .jsx + .css

  The architecture is read-heavy: most pages derive display data from eventCatalog
  filtered through joinedEventIds. The only write operation is joinEvent(), which adds
  an event ID to localStorage.

  ---
  2. Route and Screen Map

  /                       Home               ← index route
  /collection             CollectionPage     ← "컬렉션" BottomNav
  /tag                    TagPage            ← "태그" BottomNav (NFC simulation)
  /reward                 RewardsPage        ← "리워드" BottomNav
  /mypage                 MyPage             ← "마이페이지" BottomNav
  /my-progress            MyProgressPage     ← Globe icon on BottomNav (NOT a standard
  tab)
  /event/:eventId         EventDetailPage    ← Navigated to from multiple pages
  /nft-gallery/:eventId   NftGalleryPage     ← Navigated to from Collection +
  EventDetail

  Layout: All 8 routes share one App shell via <Outlet>. EventDetailPage and
  NftGalleryPage have full-bleed hero images so they do NOT use page-layout /
  page-layout__content; the other 5 use the shared layout utility.

  Navigation model:
  - BottomNav has 5 named tabs (Home, Collection, Tag, Reward, MyPage) + 1 unlabeled
  globe button → /my-progress
  - /my-progress is not in the BottomNav tab list, making it a "hidden" screen
  reachable only via the Home ProgressBanner click or the globe button
  - /event/:eventId and /nft-gallery/:eventId are detail screens, reachable from cards
  throughout the app

  ---
  3. Responsibilities by Page

  Home.jsx (/)

  Purpose: Discovery hub. Shows what events exist and surface the user's current
  progress.
  - Reads featuredEvent, activeEvents, upcomingEvents from data/events.js
  - Reads joinedEventIds from hook; computes nftCount and ongoingCount via
  getCollectionStats()
  - Derives activeEventCards by merging joined: bool into each active event
  - Passes joinEvent() down to ActiveEventCard for in-place join
  - Navigates to /my-progress on ProgressBanner click; individual cards navigate to
  /event/:id
  - Does NOT itself navigate to tag, collection, or gallery — those are separate flows

  EventDetailPage.jsx (/event/:eventId)

  Purpose: Full event context before and during participation.
  - Reads event by useParams() → getEventById(), redirects to / if not found
  - Reads joinedEventIds for join state; calls joinEvent() if needed
  - Computes statusLabel, actionLabel, and handleBottomAction() based on a
  multi-condition decision tree:
    - joinable + not joined → join + go to /tag
    - has current step → go to /tag
    - completed or ended → go to /collection
    - fallback → go to /
  - Renders: EventDetailHero, EventProgressCard, EventHighlightsCard, EventRewardCard,
  EventRouteTimeline, GradientActionButton
  - This page is the central navigation hub — most user journeys pass through it

  TagPage.jsx (/tag)

  Purpose: NFC scan simulation and NFT mint animation.
  - Reads joinedEventIds → getTagDashboard() → takes first activeCollection
  - Finds routeStep where stepState === "current" within that collection
  - Runs a 5-phase state machine: ready → scanning → verified → minting → minted
    - ready → scanning: user taps button, timer starts (2500ms)
    - scanning → verified: auto-advance (2500ms)
    - verified → minting: auto-advance (1700ms)
    - minting → minted: auto-advance (2500ms)
  - Builds a mintedNft object from the current step + increments the last serial number
  - Critical limitation: the mint is entirely cosmetic. No state update happens.
  collectedNfts and stepState in event data remain unchanged after "minting".
  - If no active collection or no current step: renders a "nothing to verify" state
  card

  CollectionPage.jsx (/collection)

  Purpose: Personal collection dashboard and NFT archive.
  - Reads joinedEventIds → getCollectionStats() for summary panel,
  getFilteredCollections() for list, getCollectedNfts() for NFT tab
  - Maintains activeFilter state (all / ongoing / completed / ended / nft)
  - When activeFilter === "nft": renders flat grid of ALL NFTs across all collections
  (CollectionNftCard)
  - Otherwise: renders collection cards (CollectionOverviewCard) filtered by status
  - CollectionOverviewCard links to both /event/:id (route view) and /nft-gallery/:id
  (NFT view)

  MyProgressPage.jsx (/my-progress)

  Purpose: Active campaign tracker — what to do next.
  - Reads joinedEventIds → getTagDashboard() → activeCollections (only ongoing status)
  - Shows StatSummaryGrid (NFT count, cities, active events)
  - Shows RouteMapTeaser linking to the primary active event
  - For each activeCollection: renders TagCampaignCard (compact event + full route
  timeline with step states)
  - Empty state when no active events (new user or all completed)
  - This screen is the daily-use operational view vs EventDetail which is
  discovery/joining

  RewardsPage.jsx (/reward)

  Purpose: Coupon and reward management.
  - Uses rewardCatalog from data/rewards.js — completely static, not joined to event
  data
  - Maintains activeFilter state (available / used / expired)
  - Computes filter counts by scanning rewardCatalog 3 times
  - "QR 보기" button opens RewardCodeModal with selectedReward state
  - Modal shows: emoji, title, description, a dummy QR grid (placeholder), coupon code,
   partner, how-to-use

  MyPage.jsx (/mypage)

  Purpose: Profile, travel stats, achievements, settings.
  - Reads joinedEventIds → getProfileSummary() → derived counts; passes to
  getAchievementItems()
  - travelStats() is a local function inside the component that builds a 3-item stat
  array (landmarks, countries, distance) from profileSummary
  - Achievements are conditionally unlocked based on cityCount,
  completedCollectionCount, landmarkCount thresholds
  - Settings items (settingsItems) are fully static — buttons do nothing
  - Logout button is non-functional

  NftGalleryPage.jsx (/nft-gallery/:eventId)

  Purpose: Per-collection NFT gallery with progress context.
  - Reads eventId from params → getTrackedCollectionById() (requires joined); redirects
   to /collection if not found
  - Shows stats (collected, progress %, remaining locked count)
  - Shows ProgressBar, GalleryBanner (status-aware: ongoing / completed / ended)
  - Renders collected NFTs as NftGalleryTokenCard + locked placeholder slots for
  remaining
  - CTA navigates back to /event/:id

  ---
  4. Responsibilities by Shared Components / Layout

  Layout

  ┌───────────┬─────────────────────────────────────────────────────────────────────┐
  │ Component │                           Responsibility                            │
  ├───────────┼─────────────────────────────────────────────────────────────────────┤
  │ Header    │ Fixed top bar; brand (→ /), globe button (language selector —       │
  │           │ currently non-functional)                                           │
  ├───────────┼─────────────────────────────────────────────────────────────────────┤
  │ BottomNav │ Fixed 5-tab navigation + globe shortcut to /my-progress; reads      │
  │           │ useLocation() for active state; renders from navItems data array    │
  └───────────┴─────────────────────────────────────────────────────────────────────┘

  UI Atoms

  ┌──────────────────────┬──────────────────────────────────────────────────────────┐
  │      Component       │                      Responsibility                      │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │ IconImage            │ Thin wrapper around <img> with fixed size prop (sets     │
  │                      │ width/height in px)                                      │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │                      │ Image with two-level fallback chain: src → fallbackSrc → │
  │ PlaceImage           │  inline SVG placeholder. Handles broken Unsplash URLs    │
  │                      │ gracefully.                                              │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │                      │ Accepts value, max, className, fillClassName. Computes   │
  │ ProgressBar          │ percentage. Used in 4+ places with different fill        │
  │                      │ styles.                                                  │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │ EventTagBadge        │ Colored pill badge for event tags (featured, hot,        │
  │                      │ ongoing, completed, ended, upcoming)                     │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │ GradientActionButton │ Full-width gradient CTA button; used as the bottom       │
  │                      │ sticky action in EventDetailPage                         │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │ EmptyState           │ Card-style empty state (icon + title + description +     │
  │                      │ optional children link)                                  │
  ├──────────────────────┼──────────────────────────────────────────────────────────┤
  │ SectionHeader        │ Title + optional description + optional "action" button  │
  │                      │ with arrow icon                                          │
  └──────────────────────┴──────────────────────────────────────────────────────────┘

  Feature Components

  ┌────────────────────────┬───────────────────────┬───────────────────────────────┐
  │       Component        │     Data consumed     │         Navigates to          │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ FeaturedEventCard      │ event prop (full      │ /event/:id via <Link>         │
  │                        │ event object)         │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ ActiveEventCard        │ event prop + onJoin   │ /event/:id via useNavigate    │
  │                        │ callback              │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ UpcomingEventCard      │ event prop            │ /event/:id via <Link>         │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ MoreEventsCard         │ No data               │ Static "더 많은 이벤트 준비   │
  │                        │                       │ 중" placeholder               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ ProgressBanner         │ title, description,   │ Calls onClick (→              │
  │                        │ onClick               │ /my-progress)                 │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ EventDetailHero        │ Full event +          │ No navigation                 │
  │                        │ statusLabel           │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ EventProgressCard      │ collected, total      │ No navigation                 │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ EventHighlightsCard    │ highlights[]          │ No navigation                 │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ EventRewardCard        │ title, description    │ No navigation                 │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ EventRouteTimeline     │ steps[],              │ No navigation (display only)  │
  │                        │ fallbackImage         │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │                        │ ongoingCount,         │                               │
  │ CollectionSummaryPanel │ completedCount,       │ No navigation                 │
  │                        │ nftCount              │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │                        │ filters[],            │                               │
  │ CollectionFilterTabs   │ activeFilter,         │ No navigation                 │
  │                        │ onChange              │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ CollectionOverviewCard │ Full collection       │ /event/:id and                │
  │                        │ object (derived)      │ /nft-gallery/:id              │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ CollectionNftCard      │ NFT object from       │ /nft-gallery/:collectionId    │
  │                        │ getCollectedNfts()    │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ NftGalleryTokenCard    │ NFT object or locked  │ No navigation                 │
  │                        │ flag                  │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ StatSummaryGrid        │ items[] (label,       │ No navigation                 │
  │                        │ value, color, icon)   │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │                        │ to, title,            │                               │
  │ RouteMapTeaser         │ description,          │ Target to via <Link>          │
  │                        │ actionLabel           │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ TagCampaignCard        │ Full collection       │ /event/:id                    │
  │                        │ object (derived)      │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ NftTipCard             │ No data (static)      │ No navigation                 │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ RewardCouponCard       │ reward object +       │ Calls onShowCode              │
  │                        │ onShowCode callback   │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ RewardCodeModal        │ reward object +       │ No navigation                 │
  │                        │ onClose               │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ ProfileAchievementCard │ Achievement item      │ No navigation                 │
  │                        │ object                │                               │
  ├────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ ProfileMenuCard        │ items[] (static       │ No navigation                 │
  │                        │ settings)             │                               │
  └────────────────────────┴───────────────────────┴───────────────────────────────┘

  ---
  5. Dummy Data Structure and Usage

  data/events.js — the backbone of the entire app

  eventCatalog — 6 events, each with this shape:
  {
    id: string,                        // "paris-spring-2026"
    title: string,
    region: string,                    // "프랑스 · 파리"
    flag: string,                      // "FR" (emoji flag code)
    period: string,                    // "2026. 4. 1 - 6. 30"
    status: "featured"|"active"|"completed"|"ended"|"upcoming",
    participationState: "joined"|"joinable"|"upcoming",
    detailStatusLabel: string,         // label shown in EventDetailHero
    heroDayLabel?: string,             // overrides timer label when present
    daysLeft?: number,                 // active events
    daysUntilOpen?: number,            // upcoming events
    landmarkCount: number,             // total steps (excluding reward step)
    collected: number,                 // hardcoded — how many NFTs collected
    image: string,                     // Unsplash URL or local import
    tag: "featured"|"hot"|undefined,   // EventTagBadge
    rewardLabel: string,               // short reward description for cards
    highlights: string[],              // 3 bullet points for EventHighlightsCard
    rewardTitle: string,
    rewardDescription: string,
    bottomCtaLabel: string,
    collectedNfts: NftItem[],          // hardcoded array of collected NFTs
    routeSteps: RouteStep[],           // full ordered route with states
  }

  NftItem shape:
  {
    id: string,          // "paris-nft-1"
    name: string,        // "에펠탑 NFT"
    placeName: string,
    image: string,
    serial: string,      // "#1247"
    description: string,
  }

  RouteStep shape:
  {
    id: string,          // "paris-step-1"
    title: string,
    subtitle: string,    // "@ 파리"
    description: string,
    image: string,
    stepState: "done"|"current"|"locked"|"reward",
    badgeText?: string,  // "NFT #1247" — only on done steps
    statusText?: string, // "다음 목적지" — only on current step
    actionLabel?: string,// "태그" — only on current step
    rewardText?: string, // reward description — only on reward step
  }

  Exported derived values:
  - featuredEvent → paris only
  - activeEvents → tokyo only (status === "active")
  - upcomingEvents → bangkok, barcelona, dubai
  - Note: paris (featured), seoul (completed), jeju (ended) appear nowhere on the Home
  screen directly except through Collection/Progress screens

  ┌──────────────────┬──────────────────┬───────────┬──────────────────┬────────┐
  │                  │                  │ Used in C │     Used in      │ Visibl │
  │      Event       │   Used on Home   │ ollection │    MyProgress    │ e in T │
  │                  │                  │           │                  │ agPage │
  ├──────────────────┼──────────────────┼───────────┼──────────────────┼────────┤
  │                  │                  │           │                  │ ✓      │
  │ paris (featured) │ FeaturedEventCar │ ✓         │ ✓ (TagCampaignCa │ (first │
  │                  │ d                │ (ongoing) │ rd)              │  activ │
  │                  │                  │           │                  │ e)     │
  ├──────────────────┼──────────────────┼───────────┼──────────────────┼────────┤
  │                  │                  │ only if   │                  │ only   │
  │ tokyo (active)   │ ActiveEventCard  │ joined    │ only if joined   │ if     │
  │                  │                  │           │                  │ joined │
  ├──────────────────┼──────────────────┼───────────┼──────────────────┼────────┤
  │ seoul            │ Not shown        │ ✓ (comple │ Not shown (not   │ Not    │
  │ (completed)      │                  │ ted tab)  │ ongoing)         │ shown  │
  ├──────────────────┼──────────────────┼───────────┼──────────────────┼────────┤
  │ jeju (ended)     │ Not shown        │ ✓ (ended  │ Not shown        │ Not    │
  │                  │                  │ tab)      │                  │ shown  │
  ├──────────────────┼──────────────────┼───────────┼──────────────────┼────────┤
  │ bangkok/bcn/duba │ UpcomingEventCar │ Not shown │ Not shown        │ Not    │
  │ i                │ d                │           │                  │ shown  │
  └──────────────────┴──────────────────┴───────────┴──────────────────┴────────┘

  ---
  data/eventParticipation.js — the only client-side state

  localStorage key: "land-in-joined-event-ids"
  Default (hardcoded): ["paris-spring-2026", "seoul-palace-2026", "jeju-coast-2025"]

  - Provides readJoinedEventIds(), writeJoinedEventIds(), addJoinedEventId(),
  isJoinedEvent()
  - The sanitizeJoinedEventIds() function always merges DEFAULT_JOINED_EVENT_IDS with
  stored values, meaning the 3 defaults can never be removed from the current build
  - This is the only piece of user-specific state in the entire app

  ---
  data/collections.js — derived state, not raw data

  All functions take joinedEventIds[] as their primary input. Derived collection
  status:

  event.status === "ended"                    → collectionStatus: "ended"
  event.collected >= event.landmarkCount      → collectionStatus: "completed"
  otherwise (joined + not ended)             → collectionStatus: "ongoing"

  Used by: CollectionPage, MyProgressPage, MyPage, Home (for ProgressBanner stats),
  TagPage (via dashboard), NftGalleryPage

  ---
  data/dashboard.js — second-level derivation

  getTagDashboard()  → { activeCollections, totalNfts, joinedCities, activeEventsCount
  }
  getProfileSummary() → { nftCount, cityCount, countryCount, completedCollectionCount,
  landmarkCount, totalDistanceLabel }

  Note: totalDistanceLabel: "8,240 km" is a hardcoded string, not computed from any
  data.
  Note: countryCount: Math.min(3, trackedCollections.length) is an approximation, not
  real country data.

  ---
  data/rewards.js — fully static, disconnected

  5 rewards hardcoded with status: "available"|"used"|"expired". There is no
  programmatic relationship between completing an event collection and a reward
  appearing in RewardsPage. A user who joins paris and completes it in the frontend
  would NOT see a new reward appear — they would have to wait for a backend to issue
  it.

  ┌──────────────────────┬────────────────────┬───────────┐
  │        Reward        │ Related collection │  Status   │
  ├──────────────────────┼────────────────────┼───────────┤
  │ 루브르 할인          │ paris              │ available │
  ├──────────────────────┼────────────────────┼───────────┤
  │ 파리 여행자 배지 NFT │ paris              │ used      │
  ├──────────────────────┼────────────────────┼───────────┤
  │ 경복궁 야간 관람권   │ seoul              │ available │
  ├──────────────────────┼────────────────────┼───────────┤
  │ 제주 리조트 혜택     │ jeju               │ expired   │
  ├──────────────────────┼────────────────────┼───────────┤
  │ 도쿄 카페 쿠폰       │ tokyo              │ used      │
  └──────────────────────┴────────────────────┴───────────┘

  ---
  data/profile.js — partially derived

  getAchievementItems(profileSummary) — achievement unlock thresholds:
  - first-nft: always unlocked (hardcoded state: "unlocked")
  - city-explorer: unlocked if cityCount >= 3
  - collection-master: unlocked if completedCollectionCount >= 3
  - landmark-hunter: unlocked if landmarkCount >= 30

  settingsItems — static array, no functionality.

  ---
  6. Main User Flows Across Screens

  ┌──────────────────────────────────────────────────────────────────┐
  │ DISCOVERY FLOW (new user / exploring)                            │
  │                                                                  │
  │  Home → FeaturedEventCard → EventDetail → [join] → Tag          │
  │  Home → ActiveEventCard → EventDetail → [join/continue] → Tag   │
  │  Home → UpcomingEventCard → EventDetail → [can't join yet]      │
  └──────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────┐
  │ DAILY TAG FLOW (returning user at a landmark)                    │
  │                                                                  │
  │  BottomNav[Tag] → TagPage[ready] → [tap] → scanning             │
  │    → verified → minting → minted → NftGallery or share          │
  │                                                                  │
  │  OR: Home[ProgressBanner] → MyProgress → TagCampaignCard         │
  │    → EventDetail → [CTA=Tag] → TagPage                          │
  └──────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────┐
  │ COLLECTION REVIEW FLOW                                           │
  │                                                                  │
  │  BottomNav[Collection] → CollectionPage[filter] →               │
  │    CollectionOverviewCard → EventDetail or NftGallery            │
  │                                                                  │
  │  OR: CollectionPage[NFT tab] → CollectionNftCard → NftGallery   │
  └──────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────┐
  │ REWARD USE FLOW                                                  │
  │                                                                  │
  │  BottomNav[Reward] → RewardsPage → [QR 보기] → RewardCodeModal  │
  │                                                                  │
  │  (Note: reward issuance on collection completion not connected)  │
  └──────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────┐
  │ PROFILE / ACHIEVEMENT FLOW                                       │
  │                                                                  │
  │  BottomNav[MyPage] → MyPage → achievements / stats / settings   │
  │  BottomNav[Globe] → MyProgress → campaign details               │
  └──────────────────────────────────────────────────────────────────┘

  ---
  7. Feature Flow by Screen

  NFC Tag / Mint Flow (TagPage)

  Entry conditions:
    - User must have a joined event with participationState "ongoing"
    - That collection must have exactly one step with stepState === "current"

  Phase state machine:
    ready
      ↓ user taps "인증하기"
    scanning  (2500ms auto-advance)
      ↓
    verified  (1700ms auto-advance)
      ↓
    minting   (2500ms auto-advance)
      ↓
    minted
      → user taps "컬렉션 보기" → /nft-gallery/:activeCollectionId
      → user taps "성과 공유" → (no-op currently)

  mintedNft is built at:
    title: currentStep.title
    location: currentStep.subtitle stripped of "@"
    image: currentStep.image
    serial: last collectedNft serial + 1, or #1201 if none

  ⚠ Nothing is persisted after mint. On page reload, state resets.

  Event Join Flow

  User on ActiveEventCard (Home) or EventDetailPage:
    event.participationState === "joinable" AND NOT in joinedEventIds
      → joinEvent(event.id) called
      → joinedEventIds updated in localStorage
      → re-render: event now shows as joined

  Note: joining alone does NOT add the event to "Collection" view.
  getCollectionStatus() returns "ongoing" only when:
    - joined AND event.status !== "ended" AND collected < landmarkCount
  Tokyo (status: "active") joined → appears as ongoing in Collection.

  Collection Filtering Flow (CollectionPage)

  Filter tab: "all" → getTrackedCollections(joinedEventIds)
  Filter tab: "ongoing" → filter by collectionStatus === "ongoing"
  Filter tab: "completed" → filter by collectionStatus === "completed"
  Filter tab: "ended" → filter by collectionStatus === "ended"
  Filter tab: "nft" → getCollectedNfts(joinedEventIds) → flat NFT list

  Sort order within each filter:
    ongoing → completed → ended
    Within same status: sorted by collected desc

  Reward Code Display Flow

  RewardsPage filter → filteredRewards list
    → RewardCouponCard
      → if status === "available": shows "QR 보기" button
      → onClick: setSelectedReward(reward)
        → RewardCodeModal renders (outside page scroll, in <>fragment)
          → shows: fake QR grid, coupon code, partner, howToUse
          → backdrop click or close button → setSelectedReward(null)

  ---
  8. Current Frontend Data Flow

  localStorage
      ↓
  readJoinedEventIds()
      ↓
  useJoinedEventIds() [hook]
      ↓ joinedEventIds[]
      ├── Home.jsx
      │     getCollectionStats(joinedEventIds) → nftCount, ongoingCount
      │
      ├── CollectionPage.jsx
      │     getCollectionStats()       → summary panel
      │     getFilteredCollections()   → card list
      │     getCollectedNfts()         → NFT grid
      │
      ├── MyProgressPage.jsx
      │     getTagDashboard()          → activeCollections, stats
      │
      ├── TagPage.jsx
      │     getTagDashboard()          → activeCollections[0] → currentStep → mintedNft
      │
      ├── MyPage.jsx
      │     getProfileSummary()        → stats for display
      │                                → getAchievementItems() → achievements[]
      │
      ├── EventDetailPage.jsx
      │     getEventById(eventId)      → event (from static catalog)
      │     joinedEventIds.includes()  → isJoined
      │     joinEvent()                ← mutation (write to localStorage)
      │
      └── NftGalleryPage.jsx
            getTrackedCollectionById() → collection with derived fields

  events.js ──────────────────────────────────────────────────────┐
    eventCatalog (source of truth)                                │
      ↓                                                           │
    featuredEvent → Home FeaturedEventCard                        │
    activeEvents → Home ActiveEventCards                          │
    upcomingEvents → Home UpcomingEventCards                      │
    getEventById() → EventDetailPage                              │
      → collections.js (takes eventCatalog + joinedEventIds)      │
         → dashboard.js (takes collection functions)              │
         → profile.js (takes dashboard output)                    ├─ all derived
                                                                  │
  rewards.js ─────────────────────────────────────────────────────┘
    rewardCatalog (completely independent)
      → RewardsPage (no connection to joinedEventIds or events)

  Write paths (only one):
  User clicks join → Home or EventDetailPage
    → joinEvent(eventId)
    → setJoinedEventIds(addJoinedEventId(eventId, currentIds))
    → useEffect fires → writeJoinedEventIds() → localStorage

  ---
  9. Confirmed Facts vs Assumptions

  Confirmed from code

  ┌───────────────────────────────┬────────────────────────────────────────────────┐
  │             Fact              │                     Source                     │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ Exactly 6 events in the       │ events.js                                      │
  │ catalog                       │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ 3 events are pre-joined by    │ eventParticipation.js:DEFAULT_JOINED_EVENT_IDS │
  │ default (paris, seoul, jeju)  │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ Default user has 12 collected │ paris(6) + seoul(3) + jeju(3) in events.js     │
  │  NFTs total                   │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ The NFC mint produces no      │ TagPage.jsx — no joinEvent() or equivalent     │
  │ persistent state change       │ write                                          │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ The TagPage always picks      │                                                │
  │ activeCollections[0] — only   │ TagPage.jsx:120                                │
  │ one event can be "active" at  │                                                │
  │ once                          │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ Rewards are completely        │                                                │
  │ hardcoded and disconnected    │ rewards.js + RewardsPage.jsx                   │
  │ from collection completion    │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ The BottomNav globe button    │                                                │
  │ goes to /my-progress, not to  │ BottomNav.jsx:58-62                            │
  │ a map                         │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ The Header globe button is    │                                                │
  │ supposed to be a language     │ Now removed — was dead prop                    │
  │ selector (calls               │                                                │
  │ onLocaleClick)                │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ Distance "8,240 km" is a      │ dashboard.js:37                                │
  │ hardcoded string              │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ countryCount is Math.min(3,   │                                                │
  │ trackedCollections.length) —  │ dashboard.js:33                                │
  │ an approximation, not real    │                                                │
  │ data                          │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ The first-nft achievement is  │                                                │
  │ always unlocked regardless of │ profile.js:7                                   │
  │  actual NFT count             │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ PlaceImage has a 2-level      │                                                │
  │ fallback chain for broken     │ PlaceImage.jsx                                 │
  │ image URLs                    │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ EventDetailPage redirects to  │ EventDetailPage.jsx:18-20                      │
  │ / if eventId is unknown       │                                                │
  ├───────────────────────────────┼────────────────────────────────────────────────┤
  │ NftGalleryPage redirects to   │                                                │
  │ /collection if collection not │ NftGalleryPage.jsx:68-70                       │
  │  joined                       │                                                │
  └───────────────────────────────┴────────────────────────────────────────────────┘

  Assumptions made by the frontend (require backend confirmation)

  ┌──────────────────────────────────────────┬─────────────────────────────────────┐
  │                Assumption                │            Where implied            │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ NFC tags are physical hardware at        │ "NFC 태그" terminology throughout   │
  │ landmarks                                │                                     │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ Verification is location-based (user     │ Implied by NFC model, but not       │
  │ must be physically present)              │ enforced in frontend                │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ Each landmark has exactly one current    │ TagPage.jsx only handles a single   │
  │ step per user per event                  │ current step                        │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ A user can only be "active" in one       │ activeCollections[0] hard-selection │
  │ collection at a time for the tag flow    │                                     │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ NFTs are digital collectibles (possibly  │ "NFT" branding, serial numbers,     │
  │ on-chain), not just points               │ "발행" (minting) language           │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ Reward issuance is triggered server-side │ Rewards are static in frontend      │
  │  on collection completion                │                                     │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ Coupon codes are valid redeemable        │ RewardCouponCard shows couponCode   │
  │ strings, not just display text           │ and QR placeholder                  │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ The QR in RewardCodeModal encodes the    │ Currently a CSS grid placeholder —  │
  │ couponCode                               │ no real QR generated                │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ Events have a time-bounded open period   │ Implied by the data fields, not     │
  │ (period field, daysLeft, daysUntilOpen)  │ enforced                            │
  ├──────────────────────────────────────────┼─────────────────────────────────────┤
  │ User authentication exists (a real       │ Assumed; username "지현" is         │
  │ logged-in user)                          │ hardcoded                           │
  └──────────────────────────────────────────┴─────────────────────────────────────┘

  ---
  10. Risks, Ambiguities, and Missing Pieces for Backend Design

  Critical — blocking for any real backend integration

  1. The tag/mint flow has no write path.
  TagPage simulates minting but writes nothing. The backend needs: POST
  /events/:id/steps/:stepId/verify that (a) validates NFC proximity, (b) marks the step
   as done, (c) mints the NFT, (d) checks if the collection is now complete, (e)
  triggers reward issuance. The frontend will need to re-fetch event state after this
  call, or receive a push update.

  2. Step progression is hardcoded.
  stepState (done/current/locked) is baked into event data. In production, the backend
  must own this state per (user, event, step). The frontend will need to receive the
  current step state per user, not just the global event state.

  3. collected count is a hardcoded field.
  event.collected (e.g., paris: 6) is a static number in events.js. The backend must
  compute this from the user's actual verified steps. The API shape needs to include
  per-user collection progress.

  4. Reward issuance is fully disconnected.
  RewardsPage reads from a static rewardCatalog that has no relationship to which
  events the user joined or completed. Backend must provide a user-specific reward
  endpoint, and completing a collection must create a reward record.

  5. The QR code in RewardCodeModal is a CSS placeholder.
  Requires a real QR generator (e.g., qrcode library) encoding the couponCode or a
  backend-signed redemption URL. This is a frontend library gap, not just a backend
  gap.

  ---
  Important — affects data model design

  6. Rewards are not linked to event IDs.
  rewards.js references collectionName (a display string), not collectionId. The
  backend reward schema needs a foreign key to the event/collection, not a text string.

  7. participationState and status are separate fields with overlapping meaning.
  status: "featured" exists only on paris. It's unclear if "featured" is a display
  property (curated by admin) or a lifecycle state. The backend needs to clarify
  whether this is a separate isFeatured: boolean or an actual status.

  8. User identity is 100% hardcoded.
  Username "지현", handle "@jihyeon_travels", avatar "🧑", level "City Explorer" are
  all JSX literals in MyPage.jsx. The backend will need a user profile endpoint, and
  the frontend will need to make these data-driven.

  9. The flag field uses string codes ("FR", "JP", "KR") but renders them as emoji
  flags via CSS.
  This likely means the frontend expects the backend to return an ISO country code and
  the client converts it to a flag emoji. Worth confirming the rendering approach.

  10. TagPage only handles one active collection at a time.
  If a user is simultaneously "ongoing" in paris and tokyo, the TagPage only addresses
  activeCollections[0]. There's no collection selection UI. This may be intentional
  (one landmark at a time) or a gap.

  ---
  Lower priority — UX or future features

  11. The "성과 공유" (share) button in TagPage is a no-op.
  Clicking it does nothing. Backend has no share/social feature implied, but frontend
  has reserved the UI slot.

  12. UpcomingEventCard shows daysUntilOpen but there's no "알림 신청" (notify me)
  functionality.
  SectionHeader shows "알림 신청" action label for the upcoming section but the button
  has no onClick. Backend would need a notification preference endpoint.

  13. The BottomNav "태그" item uses /icon_logo_test.png from the public folder (not an
   imported asset), and the filename contains "test". This is a placeholder that needs
  a real icon before production.

  14. totalDistanceLabel: "8,240 km" implies the backend might track GPS distance or
  travel distance.
  Whether this is a real metric or purely cosmetic is unclear. If real, the backend
  needs a distance calculation pipeline tied to landmark visits.

  15. Achievement thresholds are frontend-only.
  city-explorer (3 cities), collection-master (3 completed), landmark-hunter (30
  landmarks) are computed in profile.js on the frontend. In production, achievements
  should be validated and issued server-side to prevent spoofing.