# Production Readiness (12 Essentials) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform TrashTalk from a "vibe-coded" prototype into a production-grade, battle-hardened web application by implementing the 12 essential production requirements: custom 404, above-the-fold CTA, per-page meta titles & descriptions, dynamic Open Graph image, complete favicon set & PWA manifest, robots.txt, sitemap.xml, comprehensive image alt text, polished brutalist loading states, transparent privacy policy, and privacy-first analytics.

**Architecture:** Implement Next.js 15 native App Router metadata APIs (`robots.ts`, `sitemap.ts`, `icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, `manifest.ts`), dedicated route layouts with granular SEO metadata, a brutalist broadsheet 404 and Privacy Policy page, and integrate `@vercel/analytics` for cookie-less performance telemetry.

**Tech Stack:** Next.js 15 App Router, TypeScript 5.7, Tailwind CSS, `@vercel/analytics`, `next/og` (`ImageResponse`), Lucide React.

---

## Global Constraints

- **Design System Fidelity:** All new pages and components must strictly adhere to the Editorial Brutalist / Fight Night visual identity defined in `globals.css` (`--ink: #111214`, `--bg: #F2F2F0`, `--or: #D82A26`, `--dk-bg: #15171B`, Big Shoulders Display, IBM Plex Mono, Hanken Grotesk).
- **Zero Broken Links & Valid HTML:** All anchors, SVGs, and images must feature valid accessible attributes (`alt`, `aria-label`, `aria-hidden`).
- **Hermetic Testing:** Tests must run offline without external network dependencies.
- **Verification Guarantee:** Every task must compile cleanly (`npm run build`) and pass all Vitest suites (`npm test`).

---

## Review Focus

1. **404 Handling:** Visiting an invalid path (e.g. `/invalid-page` or `/battle/bad-id`) must render the full brutalist 404 experience without throwing an unhandled runtime error.
2. **Metadata Integrity:** Every route (`/`, `/battle`, `/evolution`, `/roast`, `/privacy`, `/battle/[id]`) must emit a distinct `<title>` and `<meta name="description">`.
3. **SEO Asset Generation:** Requesting `/robots.txt`, `/sitemap.xml`, `/icon`, and `/opengraph-image` must return 200 OK with correct MIME types (`text/plain`, `application/xml`, `image/png`).
4. **Above-the-Fold CTA:** Mobile viewports (360px–420px) must feature an instantly actionable, high-contrast CTA above the fold without requiring excessive vertical scrolling.
5. **Privacy & Analytics Non-Intrusiveness:** Analytics and privacy pages must introduce zero tracking cookies or consent banners while clearly detailing public data usage.

---

## Task Decomposition

### Task 1: Comprehensive SEO Metadata, Per-Page Titles & Descriptions (Items 3 & 4)

**Files:**
- Modify: `src/app/layout.tsx` (title template, metadataBase, canonical defaults)
- Modify: `src/app/page.tsx` or layout (home page metadata)
- Create: `src/app/battle/layout.tsx` (battle route title & description)
- Create: `src/app/roast/layout.tsx` (roast route title & description)
- Modify: `src/app/evolution/page.tsx` (evolution route title & description)
- Test: `tests/unit/seo/metadata.test.ts`

- [ ] **Step 1: Write test for route metadata configurations**
  Create `tests/unit/seo/metadata.test.ts` verifying that root layout, battle layout, roast layout, and evolution page define specific titles and descriptions matching the spec.
- [ ] **Step 2: Update `src/app/layout.tsx` with title template and rich metadata**
  Configure `title.default` and `title.template: "%s · TrashTalk"`, add OpenGraph and Twitter card defaults, and specify keywords and authors.
- [ ] **Step 3: Add dedicated server layouts for `/battle` and `/roast`**
  Create `src/app/battle/layout.tsx` and `src/app/roast/layout.tsx` to export metadata for client components without breaking SSR.
- [ ] **Step 4: Export metadata in `src/app/evolution/page.tsx`**
  Export `metadata` with title `"2020 vs 2026 Evolution & Lore"` and a detailed description.
- [ ] **Step 5: Run tests and verify build**
  Run `npx vitest run tests/unit/seo/metadata.test.ts` and `npm run build`.

---

### Task 2: Native Dynamic Open Graph & Twitter Images (Item 5)

**Files:**
- Create: `src/app/opengraph-image.tsx` (1200x630 ImageResponse)
- Create: `src/app/twitter-image.tsx` (1200x630 ImageResponse re-export)
- Test: `tests/integration/og-metadata-image.test.tsx`

- [ ] **Step 1: Write integration test for root OpenGraph image route**
  Create `tests/integration/og-metadata-image.test.tsx` ensuring `GET /opengraph-image` generates a valid 1200x630 image response.
- [ ] **Step 2: Implement `src/app/opengraph-image.tsx` using `next/og`**
  Render an editorial brutalist social card with dark background, punch-red `#D82A26` borders, "TRASHTALK" monumental typography, subtitle "Where developer profiles go to get roasted", platform badges (Codeforces, LeetCode, CodeChef, GitHub), and the 5-axis algorithmic receipts stamp.
- [ ] **Step 3: Implement `src/app/twitter-image.tsx`**
  Re-export or mirror the OG configuration for Twitter summary large cards.
- [ ] **Step 4: Verify test & compilation**
  Run Vitest and Next.js build.

---

### Task 3: Complete Favicon Set & Web App Manifest (Item 6)

**Files:**
- Create: `src/app/icon.tsx` (32x32 dynamic SVG/PNG favicon)
- Create: `src/app/apple-icon.tsx` (180x180 dynamic Apple touch icon)
- Create: `src/app/manifest.ts` (Web App Manifest)
- Test: `tests/unit/seo/icons-manifest.test.ts`

- [ ] **Step 1: Write unit tests for icon and manifest generators**
  Create `tests/unit/seo/icons-manifest.test.ts` to test that `manifest()` returns expected PWA attributes and icon exports have correct size/contentType.
- [ ] **Step 2: Implement `src/app/icon.tsx`**
  Generate a 32x32 brutalist punch-red badge with obsidian "TT" initials via `ImageResponse`.
- [ ] **Step 3: Implement `src/app/apple-icon.tsx`**
  Generate a 180x180 touch icon with high-contrast brutalist styling for iOS devices.
- [ ] **Step 4: Implement `src/app/manifest.ts`**
  Define PWA manifest properties (`name`, `short_name`, `theme_color: "#15171B"`, `background_color: "#F2F2F0"`, icons).
- [ ] **Step 5: Verify tests and run build**
  Confirm icons and manifest compile without errors.

---

### Task 4: Search Engine Directives: `robots.ts` & `sitemap.ts` (Items 7 & 8)

**Files:**
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Test: `tests/unit/seo/robots-sitemap.test.ts`

- [ ] **Step 1: Write tests for robots and sitemap outputs**
  Create `tests/unit/seo/robots-sitemap.test.ts` verifying robots rules (allow public paths, disallow private API paths) and sitemap URLs (static pages + legendary battles).
- [ ] **Step 2: Implement `src/app/robots.ts`**
  Export `MetadataRoute.Robots` allowing `/`, `/battle/*`, `/evolution`, `/roast`, `/privacy`, disallowing `/api/*` (except `/api/og`), and specifying sitemap URL.
- [ ] **Step 3: Implement `src/app/sitemap.ts`**
  Export `MetadataRoute.Sitemap` with all primary routes (`/`, `/battle`, `/evolution`, `/roast`, `/privacy`) and canonical legendary battles (`tourist-vs-petr`, `neetcode-vs-larryny`, `akulsareen-vs-gennady`, `torvalds-vs-antirez`).
- [ ] **Step 4: Verify test execution**
  Confirm tests pass and routes generate valid outputs.

---

### Task 5: Brutalist Fight-Night 404 Page (Item 1)

**Files:**
- Modify: `src/app/not-found.tsx`
- Test: `tests/unit/components/NotFoundPage.test.tsx`

- [ ] **Step 1: Write test for custom 404 page rendering**
  Create `tests/unit/components/NotFoundPage.test.tsx` verifying the 404 page contains the fight-night TKO motif, primary navigation button to the arena, and quick rematch demo links.
- [ ] **Step 2: Implement high-impact brutalist 404 page in `src/app/not-found.tsx`**
  - Section header: `404 · OUT COLD · TKO`
  - Monumental title: `KNOCKED OUT OF THE RING`
  - Subtitle: `The requested matchup doesn't exist, got deleted, or hasn't stepped into the ring yet.`
  - Action cards:
    - Primary Button: "Back to the Arena" (`/`)
    - Quick Match links: "Watch Tourist vs Petr", "NeetCode vs LarryNY", "Torvalds vs Antirez"
- [ ] **Step 3: Verify test and UI render**
  Run Vitest and inspect layout responsiveness.

---

### Task 6: Above-the-Fold Primary CTA & Hero Quick Actions (Item 2)

**Files:**
- Modify: `src/components/landing/LandingExperience.tsx`
- Modify: `src/components/Navbar.tsx`
- Test: `tests/unit/components/HeroCta.test.tsx`

- [ ] **Step 1: Write unit test for hero CTA presence**
  Create `tests/unit/components/HeroCta.test.tsx` confirming that `LandingExperience` renders an explicit above-the-fold call to action and quick rivalry pills.
- [ ] **Step 2: Add quick-launch battle chips and explicit action CTA in hero**
  In `LandingExperience.tsx`, add an above-the-fold CTA strip right under the headline:
  - 1-click popular rivalry chips (`tourist vs Petr`, `neetcode vs larryny`, `torvalds vs antirez`).
  - Clear "Start a Battle" action anchor that auto-scrolls/focuses into the handle inputs on mobile viewports.
- [ ] **Step 3: Polish Navbar CTA visibility**
  Ensure the sticky navbar CTA button is prominent and readable across all viewport sizes.
- [ ] **Step 4: Verify mobile responsiveness & tests**
  Run Vitest and check layout.

---

### Task 7: Image Alt Text & Accessibility Audit (Item 9)

**Files:**
- Modify: `src/components/ui/UserAvatar.tsx`
- Modify: `src/components/share/ShareDialog.tsx`
- Modify: `src/components/landing/LandingExperience.tsx`
- Test: `tests/unit/components/ImageAccessibility.test.tsx`

- [ ] **Step 1: Write accessibility test for images**
  Create `tests/unit/components/ImageAccessibility.test.tsx` verifying that all rendered images have descriptive, non-empty alt text and decorative SVGs have `aria-hidden="true"`.
- [ ] **Step 2: Update `UserAvatar.tsx`**
  Use descriptive `alt={`Profile avatar of @${handle}`}` instead of generic strings.
- [ ] **Step 3: Audit `ShareDialog.tsx` & other components**
  Ensure social card preview images include format-specific alt text (`Social share card preview in ${selectedFormat} format for @${p1} vs @${p2}`).
- [ ] **Step 4: Run accessibility tests**
  Confirm 100% compliance across all image components.

---

### Task 8: Brutalist Loading States (Item 10)

**Files:**
- Modify: `src/app/loading.tsx`
- Create: `src/app/battle/loading.tsx`
- Test: `tests/unit/components/LoadingStates.test.tsx`

- [ ] **Step 1: Write unit test for loading state components**
  Create `tests/unit/components/LoadingStates.test.tsx` asserting loading elements have `role="status"` and accessible labels.
- [ ] **Step 2: Redesign `src/app/loading.tsx` with brutalist tokens**
  Replace the generic blue spinner with an obsidian broadsheet card, punch-red pulse bar, and monospace receipt loading text (`THE ARENA · STANDBY / TALLYING THE RECEIPTS`).
- [ ] **Step 3: Create `src/app/battle/loading.tsx`**
  Provide instant feedback when loading individual battle snapshots.
- [ ] **Step 4: Test & verify build**
  Confirm loading states compile cleanly.

---

### Task 9: Transparent Brutalist Privacy Policy Page (Item 11)

**Files:**
- Create: `src/app/privacy/page.tsx`
- Modify: `src/components/Footer.tsx` (add privacy link)
- Test: `tests/unit/components/PrivacyPage.test.tsx`

- [ ] **Step 1: Write test for Privacy page and Footer link**
  Create `tests/unit/components/PrivacyPage.test.tsx` verifying the Privacy page renders all required transparency disclosures and the footer links to `/privacy`.
- [ ] **Step 2: Implement `src/app/privacy/page.tsx`**
  Write an honest, developer-first, brutalist policy:
  - 1. **Public APIs Only:** Querying only publicly accessible data from Codeforces, LeetCode, CodeChef, and GitHub; no passwords or private OAuth tokens collected.
  - 2. **Zero Tracking Cookies:** No ad trackers, marketing beacons, or tracking cookies.
  - 3. **Immutable Snapshots:** Matchups create permanent cached snapshots for URL sharing.
  - 4. **AI Generation:** Public stats processed via Google Gemini API under zero-retention enterprise terms.
  - 5. **Unlisting / Removal Policy:** Instructions on requesting snapshot removal via GitHub issue.
- [ ] **Step 3: Add Privacy Policy link to `Footer.tsx`**
  Add link in the footer alongside "The lore" and "GitHub".
- [ ] **Step 4: Verify test execution**
  Confirm test passes and route builds cleanly.

---

### Task 10: Privacy-Friendly Analytics Integration (Item 12)

**Files:**
- Modify: `package.json` (add `@vercel/analytics`)
- Modify: `src/app/layout.tsx` (embed `<Analytics />`)
- Test: `tests/unit/analytics/analytics.test.tsx`

- [ ] **Step 1: Install `@vercel/analytics`**
  Run `npm install @vercel/analytics` to add the lightweight, zero-cookie analytics library.
- [ ] **Step 2: Write test verifying Analytics component is mounted**
  Create `tests/unit/analytics/analytics.test.tsx` to verify `<Analytics />` renders safely without crashing in test environments.
- [ ] **Step 3: Add `<Analytics />` to `src/app/layout.tsx`**
  Import `{ Analytics } from "@vercel/analytics/react"` and mount it inside `RootLayout`.
- [ ] **Step 4: Verify build and test suite**
  Run `npm test` and `npm run build` to confirm zero regressions.

---

### Task 11: End-to-End Verification & Git Push

- [ ] **Step 1: Run full Vitest test suite**
  Execute all tests and confirm 100% pass rate.
- [ ] **Step 2: Run Next.js production build**
  Execute `npm run build` and ensure all static/dynamic routes (`/robots.txt`, `/sitemap.xml`, `/icon`, `/opengraph-image`, `/privacy`, `/not-found`) compile successfully.
- [ ] **Step 3: Commit and push to master**
  Commit all changes with clear descriptive message and push to `origin/master` for automatic Vercel deployment.
