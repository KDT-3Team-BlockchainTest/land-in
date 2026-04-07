 ---                                                                                 
  1. Overall Structure Summary                                                         
                                                                                       
  src/                                                                                 
  ├── App.jsx + router.jsx       ← clean shell + routing                               
  ├── index.css                  ← reset + design tokens + app-shell                   
  ├── assets/icon/, place_image/ ← PNG-only icons (no SVG)
  ├── components/
  │   ├── common/                ← 25 components, all flat in one folder
  │   └── layout/                ← Header, BottomNav
  ├── data/                      ← dummy data + derived logic (6 files)
  ├── hooks/                     ← useJoinedEventIds only
  └── pages/                     ← 8 pages, each with .jsx + .css

  Mobile-first app (max-width 420px), router-based, no state manager. The structure is
  logical for its size but shows several patterns that will create friction as the
  project grows.

  ---
  2. Strengths

  - App shell is clean — App.jsx uses <Outlet /> properly; router.jsx is separate from
  main.jsx
  - Data layer is well designed — data/events.js holds the source of truth;
  data/collections.js, data/dashboard.js derive views from it without duplicating raw
  data
  - Good shared atoms extracted — IconImage, PlaceImage, ProgressBar, SectionHeader,
  GradientActionButton, EventTagBadge are genuine reusable components
  - BEM-like CSS naming is consistent — .active-event-card__image-wrap,
  .home-page__content etc. are predictable and easy to trace
  - useJoinedEventIds is a proper custom hook — localStorage persistence is isolated
  from UI
  - Design tokens declared in index.css — --color-primary, --radius-md, --shadow-card
  etc. are defined (even if not used — see Problems #1)
  - eventCatalog in events.js is a single source of truth — filtered views
  (featuredEvent, activeEvents, upcomingEvents) are derived there

  ---
  3. Problems

  HIGH

  H1 — Design tokens declared but never used in CSS files

  Files: Home.css, MyPage.css, MyProgressPage.css, CollectionPage.css, RewardsPage.css,
   and all component CSS files

  index.css defines --color-primary: #fe6b70, --color-bg: #f7f5f3, --color-gray-400:
  #9ca3af etc. but every CSS file ignores them and writes raw hex values directly.

  /* Home.css:4 — uses raw value */
  .home-page { background: #f7f5f3; }

  /* MyPage.css:28 — uses raw value */
  background: linear-gradient(160deg, #ffffff 0%, #fff8f8 100%);
  box-shadow: 0 4px 24px rgba(254, 107, 112, 0.12);

  The token system provides zero value today. If the primary color ever changes, every
  CSS file must be hunted individually.

  ---
  H2 — Page container layout is copy-pasted 5 times

  Files: Home.css, MyPage.css, MyProgressPage.css, CollectionPage.css, RewardsPage.css

  Every page independently declares an identical layout shell:

  /* Appears in 4 files with almost identical values */
  .xxx-page {
    min-height: 100%;
    background: #f7f5f3;
  }
  .xxx-page__content {
    max-width: 420px;
    margin: 0 auto;
    padding: 22px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  Home.css is the only variation (padding-top: 80px, gap: 20px). The other four are
  essentially identical.

  ---
  H3 — Hardcoded colors in JavaScript data arrays

  Files: MyProgressPage.jsx:18-40, RewardsPage.jsx:17-39, MyPage.jsx:8-41

  // MyProgressPage.jsx — hardcoded in component body
  const stats = [
    { color: "#fe6b70", backgroundColor: "rgba(254, 107, 112, 0.08)" },
    { color: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.08)" },
    { color: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.08)" },
  ];

  The same color values appear in profile.js, collections.js (collectionStatusConfig),
  and multiple CSS files. A color change requires updating at minimum 5-6 separate
  locations.

  ---
  MEDIUM

  M1 — homeData.js is a useless pass-through

  File: pages/home/homeData.js

  // homeData.js — lines 1-3
  import { activeEvents, featuredEvent, upcomingEvents } from "../../data/events";
  export { activeEvents, featuredEvent, upcomingEvents }; // ← pure re-export, zero
  transformation

  Home.jsx imports from homeData.js thinking it's a local page concern, but homeData.js
   adds nothing. It creates a confusing detour. The UI copy (homeIntro, sectionCopy)
  could simply live in Home.jsx directly since it's only used there.

  ---
  M2 — All 25 components dumped flat into components/common/

  Directory: src/components/common/

  With 25 components, this folder is hard to scan. There is no visual grouping by
  domain. A new team member opening this folder sees ActiveEventCard next to
  CollectionFilterTabs next to NftGalleryTokenCard next to RewardCodeModal.

  ---
  M3 — Page folder naming is inconsistent

  Directory: src/pages/

  ┌─────────────┬────────────┐
  │   Folder    │ Convention │
  ├─────────────┼────────────┤
  │ home/       │ lowercase  │
  ├─────────────┼────────────┤
  │ mypage/     │ lowercase  │
  ├─────────────┼────────────┤
  │ event/      │ lowercase  │
  ├─────────────┼────────────┤
  │ collection/ │ lowercase  │
  ├─────────────┼────────────┤
  │ myProgress/ │ camelCase  │
  ├─────────────┼────────────┤
  │ nftGallery/ │ camelCase  │
  ├─────────────┼────────────┤
  │ rewards/    │ lowercase  │
  ├─────────────┼────────────┤
  │ tag/        │ lowercase  │
  └─────────────┴────────────┘

  Two pages break the convention. Inconsistent casing causes issues on case-sensitive
  file systems (Linux CI).

  ---
  M4 — Empty state markup is duplicated across pages

  Files: CollectionPage.jsx:62-76, RewardsPage.jsx:71-80, MyProgressPage.jsx:77-89,
  TagPage.jsx:172-188

  Each page independently writes an icon + h2 + p empty state. The structure is
  identical; only copy differs.

  ---
  M5 — Header.jsx accepts onLocaleClick that is never passed

  Files: Header.jsx:6, App.jsx:8

  // Header.jsx:6 — expects prop
  export default function Header({ onLocaleClick }) { ... }

  // App.jsx:8 — never passes it
  <Header />

  The globe button in Header has no click handler. This is a dead prop — either wire it
   up or remove it.

  ---
  M6 — TagPage.jsx defines 4 inline SVG icon components in the page file

  File: pages/tag/TagPage.jsx:12-48

  PhoneIcon, CheckIcon, SparklesIcon, ShareIcon are defined inline at the top of the
  page. They are small but belong in a shared icons file or components/ui/icons/, not
  inside a page.

  ---
  LOW

  L1 — StatSummaryGrid uses item.label as the React key

  File: StatSummaryGrid.jsx:22

  <StatCard key={item.label} item={item} />

  Labels happen to be unique now, but this is fragile. If an id field is added to stat
  items (it already exists in some usages), prefer that.

  ---
  L2 — BottomNav.jsx has a hardcoded public path for the tag icon

  File: BottomNav.jsx:23

  { key: "tag", label: "태그", path: "/tag", icon: "/icon_logo_test.png", primary: true
   },

  All other icons are proper ES module imports. This one is a bare public-folder
  string. The filename also contains test — suggesting it's placeholder.

  ---
  L3 — RewardsPage.jsx triple-scans rewardCatalog for stats

  File: RewardsPage.jsx:17-39

  rewardCatalog.filter((r) => r.status === "available").length,
  rewardCatalog.filter((r) => r.status === "used").length,
  rewardCatalog.filter((r) => r.status === "expired").length,

  Three separate .filter() passes over the same array. Fine for small data, but a
  useMemo with a single .reduce() would be cleaner and consistent with how the same
  page already uses useMemo for filteredRewards.

  ---
  4. Duplicated / Unnecessary Code

  Item: background: #f7f5f3
  Where: 5 page CSS files
  Duplicated In: Should be var(--color-bg) once
  ────────────────────────────────────────
  Item: max-width: 420px; margin: 0 auto
  Where: 5 page CSS files
  Duplicated In: Shared .page-layout
  ────────────────────────────────────────
  Item: padding: 22px 16px 32px; display: flex; flex-direction: column; gap: 16px
  Where: 4 page CSS files
  Duplicated In: Shared .page-layout__content
  ────────────────────────────────────────
  Item: color: "#fe6b70" hardcoded
  Where: MyProgressPage.jsx, MyPage.jsx, RewardsPage.jsx, collections.js, profile.js
  Duplicated In: CSS vars or token constants
  ────────────────────────────────────────
  Item: Empty state block (icon+h2+p)
  Where: Collection, Rewards, MyProgress, Tag pages
  Duplicated In: <EmptyState /> component
  ────────────────────────────────────────
  Item: activeEvents / featuredEvent / upcomingEvents re-exported
  Where: homeData.js
  Duplicated In: Just remove; import from data/events.js
  ────────────────────────────────────────
  Item: rewardCatalog.filter(...) × 3
  Where: RewardsPage.jsx
  Duplicated In: Single reduce pass

  ---
  5. Refactoring Priorities

  1. Use CSS variables everywhere — replace all raw #fe6b70, #111827, #9ca3af, #f7f5f3
  occurrences in CSS with the tokens already defined in index.css
  2. Create a shared page layout utility — one .page-layout + .page-layout__content
  class used by all pages
  3. Delete homeData.js passthrough — import data/events.js directly from Home.jsx;
  keep homeIntro/sectionCopy inline
  4. Sub-group components/common/ into ui/, event/, collection/, nft/ subfolders
  5. Standardize page folder naming — all lowercase or all kebab-case (my-progress/,
  nft-gallery/)
  6. Extract <EmptyState /> component to eliminate 4 repeated empty blocks
  7. Fix dead onLocaleClick prop in Header or remove it
  8. Move SVG icons out of TagPage into shared files

  ---
  6. Recommended Directory Structure

  src/
  ├── App.jsx
  ├── router.jsx
  ├── index.css
  ├── main.jsx
  │
  ├── assets/
  │   ├── icons/
  │   └── images/
  │
  ├── components/
  │   ├── layout/
  │   │   ├── Header/
  │   │   └── BottomNav/
  │   │
  │   ├── ui/                      ← generic, domain-agnostic
  │   │   ├── EmptyState/          ← NEW: replaces 4 duplicates
  │   │   ├── EventTagBadge/
  │   │   ├── GradientActionButton/
  │   │   ├── IconImage/
  │   │   ├── PlaceImage/
  │   │   ├── ProgressBar/
  │   │   ├── SectionHeader/
  │   │   └── StatSummaryGrid/
  │   │
  │   ├── event/                   ← event-domain components
  │   │   ├── ActiveEventCard/
  │   │   ├── EventDetailHero/
  │   │   ├── EventHighlightsCard/
  │   │   ├── EventProgressCard/
  │   │   ├── EventRewardCard/
  │   │   ├── EventRouteTimeline/
  │   │   ├── FeaturedEventCard/
  │   │   ├── MoreEventsCard/
  │   │   └── UpcomingEventCard/
  │   │
  │   ├── collection/              ← collection-domain
  │   │   ├── CollectionFilterTabs/
  │   │   ├── CollectionNftCard/
  │   │   ├── CollectionOverviewCard/
  │   │   ├── CollectionSummaryPanel/
  │   │   └── RouteMapTeaser/
  │   │
  │   └── nft/                     ← NFT/tag-domain
  │       ├── NftGalleryTokenCard/
  │       ├── NftTipCard/
  │       ├── TagCampaignCard/
  │       ├── ProgressBanner/
  │       ├── ProfileAchievementCard/
  │       └── ProfileMenuCard/
  │
  ├── data/
  │   ├── events.js
  │   ├── collections.js
  │   ├── dashboard.js
  │   ├── eventParticipation.js
  │   ├── profile.js
  │   └── rewards.js
  │
  ├── hooks/
  │   └── useJoinedEventIds.js
  │
  └── pages/
      ├── home/
      ├── event/
      ├── collection/
      ├── nft-gallery/             ← was nftGallery/
      ├── rewards/
      ├── my-page/                 ← was mypage/
      ├── my-progress/             ← was myProgress/
      └── tag/

  ---
  7. Top 5 Things to Fix Immediately

  #1 — Stop writing raw hex values; use the CSS tokens you already defined

  Every page CSS file. Example from Home.css:
  /* BEFORE */
  .home-page { background: #f7f5f3; }
  .home-page__greeting span { color: #fe6b70; }

  /* AFTER */
  .home-page { background: var(--color-bg); }
  .home-page__greeting span { color: var(--color-primary); }

  ---
  #2 — Extract the repeated page-layout shell into index.css

  Files: Home.css, MyPage.css, MyProgressPage.css, CollectionPage.css, RewardsPage.css

  /* ADD to index.css */
  .page-layout {
    min-height: 100%;
    background: var(--color-bg);
  }

  .page-layout__content {
    max-width: 420px;
    margin: 0 auto;
    padding: 22px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* BEFORE — MyPage.jsx */
  <div className="my-page">
    <main className="my-page__content">...</main>
  </div>

  /* AFTER */
  <div className="page-layout">
    <main className="page-layout__content">...</main>
  </div>

  Then delete the .xxx-page + .xxx-page__content blocks from 4 CSS files (Home.css
  keeps its variant for the larger padding-top).

  ---
  #3 — Delete homeData.js and import directly

  File: pages/home/homeData.js lines 1-3 are a pure re-export. Home.jsx should import
  from data/events.js directly.

  /* BEFORE — homeData.js */
  import { activeEvents, featuredEvent, upcomingEvents } from "../../data/events";
  export { activeEvents, featuredEvent, upcomingEvents }; // ← pointless

  /* AFTER — Home.jsx imports */
  import { activeEvents, featuredEvent, upcomingEvents } from "../../data/events";
  // homeIntro and sectionCopy move directly into Home.jsx as constants

  ---
  #4 — Fix dead onLocaleClick prop in Header

  Files: Header.jsx:6, App.jsx:8

  /* BEFORE — Header.jsx */
  export default function Header({ onLocaleClick }) {
    ...
    <button onClick={onLocaleClick}>  {/* never fires */}

  /* AFTER — either wire it */
  // App.jsx
  <Header onLocaleClick={() => console.log('locale')} />

  // or remove it from Header entirely
  export default function Header() {
    // remove the globe button or handle locally
  }

  ---
  #5 — Extract <EmptyState /> component

  Files: CollectionPage.jsx:62-76, RewardsPage.jsx:71-80, MyProgressPage.jsx:77-89,
  TagPage.jsx:172-188

  /* NEW: components/ui/EmptyState/EmptyState.jsx */
  export default function EmptyState({ icon, title, description, children }) {
    return (
      <section className="empty-state">
        <div className="empty-state__icon" aria-hidden="true">{icon}</div>
        <h2 className="empty-state__title">{title}</h2>
        <p className="empty-state__description">{description}</p>
        {children}
      </section>
    );
  }

  /* BEFORE — CollectionPage.jsx */
  <section className="collection-page__empty">
    <div className="collection-page__empty-icon" aria-hidden="true">✦</div>
    <h2 className="collection-page__empty-title">아직 컬렉션이 없어요</h2>
    <p className="collection-page__empty-description">탐험을 시작해...</p>
  </section>

  /* AFTER */
  <EmptyState icon="✦" title="아직 컬렉션이 없어요" description="탐험을 시작해..." />

  ---
  Summary for the team

  The data architecture is genuinely good — single source of truth in events.js, clean
  derived queries, proper hook isolation. The main problems are all CSS/style hygiene
  issues and a flat folder structure that will become harder to navigate as the
  component count grows. None of the problems are architectural blockers; they are all
  mechanical fixes that can be done incrementally without touching business logic.