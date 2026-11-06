# GitHub Platform Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate GitHub as a first-class battle platform in TrashTalk 2.0, enabling public profile comparisons across open-source impact, shipping velocity, and tech stack DNA with zero external spend, deterministic 5-axis scoring, and brutalist social cards.

**Architecture:**
- **Evidence Ingestion:** Resilient, rate-paced REST adapter (`src/lib/platforms/github.ts`) querying `/users`, `/repos`, and `/events/public` with 1-hour in-memory cache and optional `GITHUB_TOKEN` support.
- **Trophy Model:** Maps public non-fork repositories to `SolvedProblem` with star counts as difficulty ratings and primary languages as tags.
- **Deterministic 5-Axis Scoring:** Mathematical formula in `src/lib/battle/github-scoring.ts` weighting Star Gravity (30%), Shipping Cadence (25%), Repo Depth (20%), Community Footprint (15%), and Tech Stack Breadth (10%).
- **Stack DNA Overlap:** Calculates Jaccard similarity across both developers' languages and compares their top starred projects in `src/lib/battle/github-overlap.ts`.
- **Roast Engine:** Gemini AI prompt extension and local brutalist fallback roaster in `src/lib/ai/github-roaster.ts` with strict contradiction protection.
- **Offline Legendary Matchup:** Pre-baked `PREPARED_TORVALDS_VS_ANTIREZ` (Linus Torvalds vs Salvatore Sanfilippo) in `src/lib/demo/prepared-battles.ts`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, Tailwind CSS, Satori + Resvg, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-06-github-platform-integration-design.md`](file:///Users/rtiwar36/Documents/PP/trashtalk/docs/superpowers/specs/2026-11-06-github-platform-integration-design.md)

---

## Global Constraints

- **Hermetic & Offline Testing:** Never make live external HTTP calls to `api.github.com` inside test suites (`tests/`). All unit and integration tests must run offline with fixtures.
- **Formula Invariance:** Never mutate scoring formula weights ($30\%, 25\%, 20\%, 15\%, 10\%$) without updating tests and documentation.
- **Contradiction Guard:** Roasts and commentary must never declare the loser as the winner.
- **Snapshot Immutability:** Battles are write-once, read-many JSON snapshots stored in `.data/battles/`.
- **Zero External Spend:** $0.00 mandatory spend. Unauthenticated access must work gracefully under standard GitHub limits.

---

## Review Focus

1. **Rate Limit & Error Handling:** Handle GitHub 404 (user not found), 403 (rate limited), and network failures gracefully with descriptive user errors.
2. **Fork Exclusion:** Ensure stars on forked repositories do NOT inflate a player's Star Gravity score.
3. **Empty / Inactive Profiles:** Gracefully handle brand new GitHub accounts with 0 repos, 0 stars, and 0 events without `NaN` or dividing by zero.
4. **Trophy Mapping Parity:** Verify that repositories mapped to `SolvedProblem` correctly integrate into `ProblemExplorer`, `ProblemTable`, and radar charts without breaking types.
5. **Card Rendering Parity:** Verify that Satori card renderer generates OG (1200x630), Square (1080x1080), and Story (1080x1920) share cards for GitHub battles with `#91F5C2` platform accent.

---

## Task Decomposition

### Task 1: GitHub Contracts & Ingestion Adapter

**Files:**
- Modify: `src/lib/platforms/contracts.ts`
- Modify: `src/lib/platforms/github.ts`
- Test: `tests/unit/platforms/github.test.ts`

**Interfaces:**
- Consumes: `FetchContext`, `PlatformStats`, `SolvedProblem`
- Produces: `GithubEvidence`, `GithubProfile`, `GithubRepo`, and `fetchGithubEvidence(username, context)`

- [x] **Step 1: Write failing unit test for GitHub evidence fetcher**
Create `tests/unit/platforms/github.test.ts` testing successful evidence extraction, repo-to-trophy conversion, 404 handling, and fork star exclusion using mocked responses.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/platforms/github.test.ts`
Expected: FAIL (missing types and functions).
- [x] **Step 3: Define GitHub contracts in `src/lib/platforms/contracts.ts`**
Add `GithubRepo`, `GithubProfile`, `GithubEvidence`, and update `PlatformEvidence` union.
- [x] **Step 4: Implement `fetchGithubEvidence` in `src/lib/platforms/github.ts`**
Implement rate-paced fetcher with caching, fetching `/users/{username}`, `/users/{username}/repos`, and `/users/{username}/events/public`. Map original repos to `SolvedProblem[]` with stars as `rating` and language as `tags`.
- [x] **Step 5: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/platforms/github.test.ts`
Expected: PASS.

---

### Task 2: Deterministic 5-Axis GitHub Scoring Engine

**Files:**
- Create: `src/lib/battle/github-scoring.ts`
- Modify: `src/lib/battle/scoring.ts`
- Test: `tests/unit/battle/github-scoring.test.ts`

**Interfaces:**
- Consumes: `GithubEvidence`, `PlayerAxes`, `PlayerScore`, `BattleVerdict`
- Produces: `computeGithubPlayerAxes(evidence): PlayerAxes`, `scoreGithubBattle(e1, e2): BattleVerdict`

- [x] **Step 1: Write failing unit test for GitHub scoring**
Create `tests/unit/battle/github-scoring.test.ts` testing 5-axis calculations: Star Gravity ($30\%$), Shipping Cadence ($25\%$), Repo Depth ($20\%$), Community Footprint ($15\%$), and Tech Stack Breadth ($10\%$), including tie, blowout, and 0-score edge cases.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/battle/github-scoring.test.ts`
Expected: FAIL.
- [x] **Step 3: Implement `github-scoring.ts`**
Implement the mathematical scoring formula from Section 5.2 of the spec. Re-export `scoreGithubBattle` from `src/lib/battle/scoring.ts`.
- [x] **Step 4: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/battle/github-scoring.test.ts`
Expected: PASS.

---

### Task 3: GitHub Tech Stack DNA Overlap

**Files:**
- Create: `src/lib/battle/github-overlap.ts`
- Modify: `src/lib/battle/overlap.ts`
- Test: `tests/unit/battle/github-overlap.test.ts`

**Interfaces:**
- Consumes: `GithubEvidence`, `SolvedProblem`
- Produces: `computeGithubOverlap(p1Evidence, p2Evidence): ProblemOverlap`

- [x] **Step 1: Write failing unit test for GitHub overlap**
Create `tests/unit/battle/github-overlap.test.ts` verifying language Jaccard similarity, mutual vs. exclusive languages, and top repository matchup.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/battle/github-overlap.test.ts`
Expected: FAIL.
- [x] **Step 3: Implement `computeGithubOverlap` in `src/lib/battle/github-overlap.ts`**
Compute language intersection and exclusive sets, Jaccard similarity index, and top starred repository comparison.
- [x] **Step 4: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/battle/github-overlap.test.ts`
Expected: PASS.

---

### Task 4: GitHub Brutalist AI Roaster & Contradiction Guard

**Files:**
- Create: `src/lib/ai/github-roaster.ts`
- Modify: `src/lib/ai/roast-engine.ts`
- Test: `tests/unit/ai/github-roaster.test.ts`

**Interfaces:**
- Consumes: `BattleVerdict`, `GithubEvidence`, `RoastPersona`
- Produces: `generateGithubLocalRoast(params): CommentaryResult`, `buildGithubRoastPrompt(params): string`

- [x] **Step 1: Write failing unit test for GitHub roaster**
Create `tests/unit/ai/github-roaster.test.ts` testing winner-to-loser perspective, contradiction rejection, and GitHub tropes across personas.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/ai/github-roaster.test.ts`
Expected: FAIL.
- [x] **Step 3: Implement `src/lib/ai/github-roaster.ts` & wire into `roast-engine.ts`**
Implement brutalist local roaster templates with contradiction guard and Gemini prompt builder.
- [x] **Step 4: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/ai/github-roaster.test.ts`
Expected: PASS.

---

### Task 5: Legendary Offline Demo Battle (`torvalds` vs `antirez`)

**Files:**
- Modify: `src/lib/demo/prepared-battles.ts`
- Test: `tests/unit/demo/prepared-battles.test.ts`

**Interfaces:**
- Produces: `PREPARED_TORVALDS_VS_ANTIREZ: BattleSnapshot`

- [x] **Step 1: Write failing test verifying GitHub demo battle fixture**
Update `tests/unit/demo/prepared-battles.test.ts` to assert `PREPARED_TORVALDS_VS_ANTIREZ` exists, has platform `"github"`, valid 5-axis scores, trophies, and valid commentary.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/demo/prepared-battles.test.ts`
Expected: FAIL.
- [x] **Step 3: Author `PREPARED_TORVALDS_VS_ANTIREZ` in `prepared-battles.ts`**
Create the canonical fixture with realistic stars, repositories (`linux`, `git`, `redis`), language overlap (C, Makefile, Tcl), activity levels, and savage roasts.
- [x] **Step 4: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/demo/prepared-battles.test.ts`
Expected: PASS.

---

### Task 6: Battle Service Flow & Integration

**Files:**
- Modify: `src/lib/battle/service.ts`
- Test: `tests/integration/github-battle.test.ts`

**Interfaces:**
- Consumes: `executeBattleFlow({ platform: "github", u1, u2 })`
- Produces: Stored `BattleSnapshot` with canonical ID `gh-<u1>-vs-<u2>-<uuid>`

- [x] **Step 1: Write failing integration test for GitHub battle flow**
Create `tests/integration/github-battle.test.ts` executing the full flow with mock evidence and asserting snapshot creation, scoring, and storage.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/integration/github-battle.test.ts`
Expected: FAIL.
- [x] **Step 3: Wire GitHub execution branch into `src/lib/battle/service.ts`**
Add `platform === "github"` handling in `executeBattleFlow`.
- [x] **Step 4: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/integration/github-battle.test.ts`
Expected: PASS.

---

### Task 7: UI Controls, Platform Registry, & Social Share Cards

**Files:**
- Modify: `src/lib/platforms/registry.ts`
- Modify: `src/components/compare/CompareForm.tsx`
- Modify: `src/lib/share/card-renderer.tsx`
- Test: `tests/integration/card-rendering.test.tsx`

**Interfaces:**
- Produces: Live GitHub tab in UI, 1-click quick demo buttons, and Satori social cards in OG, Square, and Story formats.

- [x] **Step 1: Write test assertion for GitHub social card rendering**
Update `tests/integration/card-rendering.test.tsx` to assert rendering of `PREPARED_TORVALDS_VS_ANTIREZ` in all 3 card formats.
- [x] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/integration/card-rendering.test.tsx`
Expected: FAIL.
- [x] **Step 3: Update platform registry, CompareForm, and Card Renderer**
Set `github.status = "live"` in `registry.ts`. Add GitHub placeholders and demo buttons in `CompareForm.tsx`. Handle GitHub badge and colors in `card-renderer.tsx`.
- [x] **Step 4: Run card rendering tests to verify they pass**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/integration/card-rendering.test.tsx`
Expected: PASS.

---

### Task 8: End-to-End Build & Quality Verification

- [x] **Step 1: Run TypeScript typecheck**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/typescript/bin/tsc --noEmit`
Expected: 0 errors.
- [x] **Step 2: Run all Vitest automated test suites**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run`
Expected: 100% passing across all 40+ test suites.
- [x] **Step 3: Run Next.js production build**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/next/dist/bin/next build`
Expected: Successful compilation of all static and dynamic pages.
