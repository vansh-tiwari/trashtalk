# AGENTS.md — TrashTalk Project & Architecture Context

> **Audience:** AI Coding Assistants (Antigravity, Claude Code, Cursor, Copilot) and Human Software Engineers.  
> **Purpose:** Comprehensive source of truth covering the architecture, domain logic, directory layout, key files, exported functions, and development conventions of **TrashTalk 2.0**.

---

## 1. Project Overview & Mission

**TrashTalk** is an AI-powered developer rivalry arena and profile roaster. It allows developers to enter two competitive programming handles (e.g. Codeforces), pulls verified competition and solve histories, evaluates them across a **deterministic 5-axis algorithmic scoring engine (v2.0.0)**, discovers problem overlap ($P_1 \cap P_2$), delivers an authoritative winner-to-loser roast, and generates exportable brutalist social share cards (OG, Square, Story).

### Origin & Heritage
- **2020 Student Era:** Originally built in 2020 as a college Python Flask + Jinja2 app with fragile web scraping and basic CSS table coloring. The original 2020 codebase is preserved untouched in [`legacy/`](file:///Users/rtiwar36/Documents/PP/trashtalk/legacy/).
- **2026 Senior Architecture:** Completely re-engineered from the ground up as a production-grade **Next.js 15 (App Router) + TypeScript** application built on senior engineering principles:
  - Immutable canonical snapshots (`/battle/[id]`)
  - Server-side data fetching with rate pacing and admission limits
  - Pure deterministic 5-axis mathematical scoring
  - Local-first operation ($0.00 external spend) with optional Google Gemini AI
  - Server-rendered multi-format share cards with Satori & Resvg
  - Editorial brutalist design system inspired by classic fight-night broadsheets

---

## 2. Tech Stack & Environment

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server & Client Components) |
| **Language** | TypeScript 5.7+ (Strict mode enabled) |
| **Styling** | Tailwind CSS + Custom CSS Variables in [`globals.css`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/app/globals.css) |
| **Typography** | Big Shoulders Display, Hanken Grotesk, IBM Plex Mono |
| **Card Rendering** | Satori + Resvg (`next/og` / `@vercel/og`) |
| **Icons** | Lucide React |
| **Testing** | Vitest 5.0 (28 suites, 158 tests) + Playwright for e2e |
| **Validation** | Zod (schemas and safe parsing) |
| **AI (Optional)** | Google Generative AI (`gemini-2.5-flash` / `gemini-3.5-flash-lite`) |

---

## 3. Directory Layout

```
trashtalk/
├── .data/                      # Local filesystem storage for battle snapshots & idempotency
│   └── battles/                # JSON snapshot files (<battleId>.json)
├── docs/                       # Architectural decisions, design specs, and historical plans
│   ├── decisions/              # Architecture Decision Records (ADRs)
│   ├── design/                 # High-fidelity mockups and visual references
│   └── superpowers/            # Implementation plans and design specs
├── legacy/                     # Untouched 2020 student Flask project (historical reference)
├── public/                     # Static public assets
├── src/
│   ├── app/                    # Next.js 15 App Router routes & layouts
│   │   ├── api/                # Serverless API routes (POST /api/battles, GET /api/og, etc.)
│   │   ├── battle/             # Battle views (/battle and /battle/[id])
│   │   ├── evolution/          # Lore & origin story comparison
│   │   ├── roast/              # Solo profile roaster route
│   │   ├── globals.css         # Design tokens, brutalist rules, and keyframe animations
│   │   └── layout.tsx          # Root layout and metadata configuration
│   ├── components/             # Reusable UI component hierarchy
│   │   ├── battle/             # Scoreboard, ScoreBreakdown, RoastMoment, MatchHeader, etc.
│   │   ├── compare/            # CompareForm, MatchStatus, PlatformChips, etc.
│   │   ├── landing/            # LandingExperience, Hero, DemoMatchTicket, Marquee
│   │   ├── motion/             # OdometerValue, MarqueeTicker, Reveal animations
│   │   ├── platforms/          # Platform availability badges and theme helpers
│   │   ├── problems/           # ProblemExplorer, ProblemTable, difficulty filters
│   │   ├── share/              # ShareDialog, ShareMenu, copy helpers
│   │   └── ui/                 # UserAvatar, core primitives
│   ├── lib/                    # Domain logic and services
│   │   ├── ai/                 # Roast engine, personas, and local template roaster
│   │   ├── battle/             # 5-axis scoring, overlap math, copy builder, service
│   │   ├── demo/               # Offline legendary prepared battles (tourist vs Petr)
│   │   ├── platforms/          # Codeforces adapter, HTTP rate-pacer, registry
│   │   ├── problems/           # Problem presentation and URL generators
│   │   ├── share/              # Satori card renderer, card models, font loader
│   │   └── storage/            # FileBattleStore, MemoryBattleStore, idempotency contracts
│   └── types/                  # Global shared TypeScript contracts
└── tests/                      # Automated Vitest test suites
    ├── integration/            # API, card rendering, and storage integration tests
    └── unit/                   # Scoring, overlap, roaster, and component tests
```

---

## 4. Key Files & Exported Functions Catalog

### 4.1. Core Battle & Scoring Domain (`src/lib/battle/`)

#### `scoring.ts` — Deterministic 5-Axis Scoring Engine
- `computePlayerAxes(evidence: PlatformEvidence): PlayerAxes`
  - Calculates the 5 core axes for a player on a 0–100 scale:
    1. **Algorithmic Grit (30% weight):** Median difficulty rating of hardest 10% solves. Rating 3,200+ = 100 pts.
    2. **Contest Peak (25% weight):** All-time peak rating relative to 3,500 ceiling ($maxRating / 3500 \times 100$).
    3. **Solve Volume (20% weight):** Total unique problems solved (1,000 solves = 100 pts).
    4. **Recent Velocity (15% weight):** Solves in the most recent competition window (150 recent solves = 100 pts).
    5. **Topic Breadth (10% weight):** Unique tags solved across algorithm domains (30 tags = 100 pts).
- `calculateCompositeScore(axes: PlayerAxes): number`
  - Returns the weighted composite score: $0.30 \times Grit + 0.25 \times Peak + 0.20 \times Volume + 0.15 \times Velocity + 0.10 \times Breadth$, rounded to an integer.
- `determineOutcome(p1Score: PlayerScore, p2Score: PlayerScore, p1Handle: string, p2Handle: string): BattleVerdict`
  - Evaluates whether the match is a `win`, `draw`, or `insufficient_data`, assigns `winnerHandle`, `loserHandle`, and margin.
- `scoreBattle(p1Evidence, p2Evidence, p1Handle, p2Handle): BattleVerdict`
  - Pure end-to-end scoring function.

#### `overlap.ts` — Problem Overlap ($P_1 \cap P_2$) & Algorithmic DNA
- `computeProblemOverlap(p1Solves: SolvedProblem[], p2Solves: SolvedProblem[], p1Handle: string, p2Handle: string): ProblemOverlap`
  - Computes the intersection set ($P_1 \cap P_2$) of mutually solved problems.
  - Computes exclusive sets ($P_1 \setminus P_2$ and $P_2 \setminus P_1$) sorted by problem difficulty descending.
  - Calculates Jaccard similarity index: $\text{DNA} = \frac{|P_1 \cap P_2|}{|P_1 \cup P_2|} \times 100\%$.
  - Guarded by coverage: if historical solve history was truncated, exclusives are safely suppressed (`isDefinitive: false`).

#### `service.ts` — Battle Creation Orchestrator
- `createBattle(request: CreateBattleRequest): Promise<BattleSnapshot>`
  - Coordinates fetcher $\rightarrow$ scoring $\rightarrow$ overlap $\rightarrow$ roast generation $\rightarrow$ atomic snapshot storage.
  - Implements atomic idempotency: identical matchups return the existing snapshot rather than re-querying external APIs.

#### `copy.ts` & `short-roast.ts` — Editorial Copy & Roasting
- `buildBattleCopy(snapshot: BattleSnapshot): BattleCopy`
  - Generates the outcome line (e.g. `@tourist takes it · +7`), canonical link path, and short roast.
- `selectShortRoast(snapshot: BattleSnapshot): string`
  - Delivers a single winner-to-loser punchline with strict contradiction protection (rejects any commentary that contradicts the scoreboard verdict).

#### `presentation.ts` — View Model Normalizer
- `toBattleViewModel(snapshot: BattleSnapshot): BattleViewModel`
  - Normalizes snapshot data for UI rendering: handles, scores, ranks, active ratings, peak ratings, and formatters.

---

### 4.2. Platform & Data Ingestion (`src/lib/platforms/`)

#### `codeforces.ts` — Codeforces API Adapter
- `CodeforcesAdapter` implementing `PlatformAdapter`:
  - `fetchEvidence(handle: string): Promise<PlatformEvidence>`
  - Queries `user.info`, `user.rating`, and `user.status` via rate-paced fetcher.
  - Extracts accepted submissions, unique problem set, difficulty ratings, and tags.

#### `http.ts` — Resilient Rate-Paced HTTP Client
- `ratePacedFetch(url: string, options?: RequestInit): Promise<Response>`
  - Enforces minimum delay between outbound calls (e.g., Codeforces 1 call / 2s policy).
  - Handles timeouts, JSON extraction, and transient network errors gracefully.

#### `registry.ts` — Platform Registry
- `getPlatformConfig(platform: Platform): PlatformConfig`
  - Holds configurations for `codeforces` (active), `leetcode` (upcoming), `codechef` (planned), and `github` (planned).

---

### 4.3. Social Share Card Pipeline (`src/lib/share/`)

#### `card-renderer.tsx` — Server-Side Social Card Generator
- `renderBattleCard(snapshot: BattleSnapshot, format: CardFormat, options?: RenderCardOptions): Promise<ImageResponse>`
  - Renders pixel-perfect brutalist cards via Satori and Resvg:
    - **`og` (1200×630):** Horizontal card for Twitter, LinkedIn, Discord.
    - **`square` (1080×1080):** 1:1 format for Instagram & feed posts.
    - **`story` (1080×1920):** 9:16 vertical clash poster for Stories & TikTok.
  - Shares design tokens with web UI: off-white card, black `#111214` borders, punch-red `#D82A26` accents, winner stamps, and peak ratings.

#### `card-model.ts`
- `buildBattleCardModel(snapshot, origin): BattleCardModel`
  - Converts snapshot data into static card layout models.

---

### 4.4. Storage & Persistence (`src/lib/storage/`)

#### `battle-store.ts` — Storage Implementations
- `FileBattleStore` implementing `BattleStore`:
  - Persists snapshots to `.data/battles/<id>.json` using atomic `wx` flag (create-only semantics).
  - Maintains in-memory `BoundedCache` (200 entries) to accelerate repeated reads.
- `MemoryBattleStore` implementing `BattleStore`:
  - Fast in-memory map store used during unit testing.
- `FileIdempotencyStore` implementing `IdempotencyStore`:
  - Records in-progress battle reservations to prevent race conditions during concurrent fight requests.

---

### 4.5. Key Components (`src/components/`)

- [`BattleResult.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/battle/BattleResult.tsx): Master view for `/battle/[id]`. Combines dark stage, full-width red verdict banner, unified roast, score breakdown, radar charts, problem trophy room, and 3D share arena.
- [`Scoreboard.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/battle/Scoreboard.tsx): Scoreboard displaying player handles, active ratings, peak ratings (`3,097 rating (peak 3,844)`), and animated odometer score counters.
- [`ScoreBreakdown.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/battle/ScoreBreakdown.tsx): Collapsible table displaying the 5 weights (30%, 25%, 20%, 15%, 10%), metric contributions, net point advantages, and contextual tie/win explanations.
- [`RoastMoment.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/battle/RoastMoment.tsx): High-impact single statement roasting the loser from the winner's perspective with animated keywords and interactive reaction buttons.
- [`MatchHeader.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/battle/MatchHeader.tsx): Dark-stage breadcrumbs (`the arena / @player1 vs @player2`) in crisp high-contrast typography.
- [`CompareForm.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/compare/CompareForm.tsx): The battle entry form featuring platform selector chips, handle inputs, quick demo buttons, and the seismic "crazy" fight animation (`.fb.is-fighting`).
- [`ProblemExplorer.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/problems/ProblemExplorer.tsx) & [`ProblemTable.tsx`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/components/problems/ProblemTable.tsx): Scrollable problem overlap tables with difficulty chips and direct problem statement links.

---

## 5. Design Tokens & Editorial Brutalist System

The visual identity uses an **Editorial Brutalist / Fight Night** design language defined in [`globals.css`](file:///Users/rtiwar36/Documents/PP/trashtalk/src/app/globals.css):

### Core CSS Variables
- `--ink: #111214` (Deep obsidian black for text, borders, and stamps)
- `--bg: #F2F2F0` (Off-white newspaper canvas)
- `--or: #D82A26` (Punch red for winner highlights, verdict banners, and CTA footers)
- `--stroke-red: #FF5A52` (Action red outline on runner-up typography)
- `--mut: #5E6066` (Muted secondary text)
- `--ln: #DADAD6` (Editorial hairline rules)
- `--dk-bg: #15171B` (Dark stage header background)
- `--dk-text: #F4F4F4` (Crisp light text on dark stage)

### Key Layout & Utility Classes
- `.w`: Primary container (`max-width: 1360px; margin: 0 auto; padding: 0 40px; box-sizing: border-box;`)
- `.vband`: Full-width edge-to-edge punch-red verdict banner (`width: 100%; border-bottom: 4px solid var(--ink);`)
- `.split-hero-stage`: Full-screen Split Horizontal VS hero section with dark top half, slanted light bottom half, and central popping orange/red VS badge
- `.big`: Big Shoulders Display font, uppercase, monumental editorial typography
- `.mono`: IBM Plex Mono uppercase monospace labels
- `.fb.is-fighting`: Seismic fight button shake (`fight-crazy-shake`) + flaming crimson strobe (`fight-flame-strobe`)
- `.shr2`: 3D card preview container with `overflow: hidden` to clip confetti particles

---

## 6. Development, Testing & Verification Commands

```bash
# Run development server (default port 3000)
npm run dev

# Run all 28 automated Vitest test suites (158 tests)
npm test

# Run a specific test suite
npx vitest run tests/unit/battle/scoring.test.ts
npx vitest run tests/integration/card-rendering.test.tsx

# Run Next.js production build (compiles and checks TypeScript types)
npm run build

# Run production server
npm start
```

---

## 7. Crucial Rules for AI Agents

1. **Deterministic Scoring Integrity:** Never change the scoring formula weights ($30\%, 25\%, 20\%, 15\%, 10\%$) without updating both `scoring.ts`, `ScoreBreakdown.tsx`, and associated unit tests.
2. **Immutable Snapshot Guarantee:** Battles are write-once, read-many. Never mutate or overwrite an existing snapshot in `.data/battles/`.
3. **Contradiction Guard:** When generating commentary or roasts, the winner claimed in prose MUST match `snapshot.verdict.winnerHandle`. Never allow commentary that claims the loser won.
4. **No Horizontal Scrolling:** Ensure any new UI component respects `max-width: 100%` and handles narrow mobile viewports ($\le 360\text{px}$) cleanly without causing `overflow-x`.
5. **Offline & Sandboxed Safety:** Never make unmocked external network calls in automated test suites (`tests/`). Keep unit and integration tests fast, hermetic, and offline-capable.
6. **Verify Before Completion:** Always run `npm test` and `npm run build` to confirm zero test failures and zero compilation errors before declaring any task complete.
