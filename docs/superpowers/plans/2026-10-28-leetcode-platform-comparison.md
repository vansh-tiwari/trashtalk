# LeetCode Platform Comparison Implementation Plan (Revised v2.0.0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full LeetCode platform showdowns and comparison in TrashTalk 2.0, including single-query GraphQL ingestion with Cloudflare-safe headers, 20-item recent AC deduplication, 180-day submission calendar velocity, attended-only contest peak extraction, calibrated non-penalizing 5-axis scoring, tag cosine similarity fallback, platform-aware ScoreBreakdown, LeetCode problem URL generator, and unrated scoreboard/social card presentation.

**Architecture:** Extend the existing platform adapter and battle flow patterns to LeetCode by implementing `fetchLeetcodeEvidence`, calibrated `scoreLeetcodeBattle` (preserving the strict 30/25/20/15/10 weight system), `lc-*` snapshot persistence, dynamic social card rendering, and enabling the LeetCode chip in `CompareForm`.

**Tech Stack:** Next.js 15, TypeScript (strict), Zod, Vitest, Satori / Resvg (`next/og`), Tailwind CSS.

---

## Global Constraints
- Deterministic 5-axis weights ($30\%$ Grit, $25\%$ Contest Peak, $20\%$ Volume, $15\%$ Velocity, $10\%$ Breadth) MUST NOT change.
- Battles are write-once, read-many; snapshots in `.data/battles/` are immutable.
- Contradiction guard: commentary prose MUST NOT declare the loser as the winner.
- Offline & sandboxed safety: unit and integration tests must run hermetically with zero unmocked network calls.
- Full test suite (`node node_modules/vitest/vitest.mjs run`) and Next.js build must pass without errors.

---

## Review Focus
1. Non-existent LeetCode handles return 404 / `status: "not_found"` without crashing the server.
2. Unrated LeetCode users (zero attended contests) compute a sensible estimated contest baseline (capped at 40) without NaN or zero division, and render cleanly on Scoreboard and share cards without `undefined rating` or `0 rating`.
3. Mirror matches (`p1.toLowerCase() === p2.toLowerCase()`) or identical scores declare an honorable draw.
4. Problem overlap safely handles truncated recent history without claiming false definitive lifetime exclusives (`isDefinitive: false`), with Tag Cosine Similarity fallback when recent AC overlap is 0.
5. Social share cards (OG, Square, Story) dynamically display "LeetCode" branding instead of hardcoded "Codeforces".

---

### Task 1: Contracts, Types & LeetCode Single-Query Evidence Adapter

**Files:**
- Modify: `src/lib/platforms/contracts.ts`
- Modify: `src/lib/platforms/http.ts`
- Modify: `src/lib/platforms/leetcode.ts`
- Test: `tests/unit/platforms/leetcode.test.ts`

- [ ] **Step 1: Write unit tests for LeetCode adapter**
  Create `tests/unit/platforms/leetcode.test.ts` testing:
  - Single combined GraphQL POST request with `Origin`, `Referer`, and browser `User-Agent`.
  - Profile, `submitStatsGlobal`, `tagProblemCounts`, `userCalendar`, `userContestRanking`, `userContestRankingHistory`, and `recentAcSubmissionList` parsing.
  - Strict filtering of `userContestRankingHistory` by `attended === true` (verifies unrated user does not inherit default 1500 rating).
  - 180-day calendar calculation parsing Unix timestamps, summing submissions and distinct active days.
  - Recent AC submission deduplication by `titleSlug` (clamped to 20).
  - 404 user not found handling (`data.matchedUser === null` -> `status: "not_found"`).
  - 429 rate limit and timeout handling.

- [ ] **Step 2: Run tests to verify they fail**
  Run: `node node_modules/vitest/vitest.mjs run tests/unit/platforms/leetcode.test.ts`
  Expected: FAIL

- [ ] **Step 3: Update `contracts.ts` and `http.ts`**
  - Add `EvidenceCoverage`, `LeetcodeTagStat`, `LeetcodeProfile`, `LeetcodeEvidence`, and update `PlatformEvidence`.
  - Add `leetcodeThrottler` and `LEETCODE_GRAPHQL_HEADERS` in `http.ts`.

- [ ] **Step 4: Implement `fetchLeetcodeEvidence` in `src/lib/platforms/leetcode.ts`**
  Implement single-query GraphQL fetcher with Cloudflare headers, calendar velocity extraction, attended-only contest filtering, and recent AC deduplication.

- [ ] **Step 5: Run tests to verify they pass**
  Run: `node node_modules/vitest/vitest.mjs run tests/unit/platforms/leetcode.test.ts`
  Expected: PASS

---

### Task 2: Calibrated 5-Axis Algorithmic Scoring & Overlap Engine

**Files:**
- Modify: `src/lib/battle/scoring.ts`
- Modify: `src/lib/battle/overlap.ts`
- Test: `tests/unit/battle/leetcode-scoring.test.ts`
- Test: `tests/unit/battle/overlap.test.ts`

- [ ] **Step 1: Write unit tests for LeetCode scoring and overlap**
  Create `tests/unit/battle/leetcode-scoring.test.ts` testing:
  - Grit: Solving extra Easies does NOT reduce points; Hard depth (up to 75 = 55 pts), Medium depth (up to 250 = 30 pts), Hard density against non-easy solves (up to 15 pts).
  - Contest Peak: Rated users scale from 1,000 to 3,200 with 25 pt floor; unrated users strictly capped at $\le 40$ pts.
  - Solve Volume: /1000 scale.
  - Recent Velocity: 180-day calendar blend (60 pts active days + 40 pts submissions).
  - Topic Breadth: Qualified tags where `problemsSolved >= 3` scaled against 25 tags.
  - Exact composite score formula ($30\%, 25\%, 20\%, 15\%, 10\%$).
  - Mirror match and draw handling.
  Update `tests/unit/battle/overlap.test.ts` testing:
  - `isDefinitive: false` for LeetCode.
  - Tag Cosine Similarity fallback when recent AC overlap is 0.

- [ ] **Step 2: Run tests to verify they fail**
  Run: `node node_modules/vitest/vitest.mjs run tests/unit/battle/leetcode-scoring.test.ts tests/unit/battle/overlap.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `computeLeetcodePlayerAxes`, `scoreLeetcodeBattle`, and Tag Cosine Similarity**
  In `scoring.ts` and `overlap.ts`, implement the calibrated scoring engine and overlap math.

- [ ] **Step 4: Run tests to verify they pass**
  Run: `node node_modules/vitest/vitest.mjs run tests/unit/battle/leetcode-scoring.test.ts tests/unit/battle/overlap.test.ts`
  Expected: PASS

---

### Task 3: Problem URLs, Presentation & ScoreBreakdown

**Files:**
- Modify: `src/lib/problems/presentation.ts`
- Modify: `src/components/problems/ProblemTable.tsx`
- Modify: `src/components/battle/ScoreBreakdown.tsx`
- Modify: `src/lib/battle/presentation.ts`
- Modify: `src/components/battle/Scoreboard.tsx`
- Test: `tests/unit/problems/presentation.test.ts`
- Test: `tests/unit/battle/presentation.test.ts`

- [ ] **Step 1: Write tests for LeetCode problem URLs and presentation**
  Update `tests/unit/problems/presentation.test.ts` to verify `getProblemStatementUrl` accepts `https://leetcode.com/...` and `LC:...` IDs.
  Update `tests/unit/battle/presentation.test.ts` to test unrated LeetCode formatting (`Unrated · 412 Solved (68 Hard)`).

- [ ] **Step 2: Run tests to verify they fail**
  Run: `node node_modules/vitest/vitest.mjs run tests/unit/problems/presentation.test.ts tests/unit/battle/presentation.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement URL helpers, ScoreBreakdown descriptions, and unrated presentation**
  - Update `getProblemStatementUrl` in `src/lib/problems/presentation.ts` for LeetCode URLs.
  - Update `ProblemTable.tsx` display ID formatting (`LC / ${slug}`).
  - Update `ScoreBreakdown.tsx` with platform-aware metric descriptions (Codeforces vs LeetCode).
  - Update `toBattleViewModel` and `Scoreboard.tsx` to cleanly handle unrated profiles.

- [ ] **Step 4: Run tests to verify they pass**
  Run: `node node_modules/vitest/vitest.mjs run tests/unit/problems/presentation.test.ts tests/unit/battle/presentation.test.ts`
  Expected: PASS

---

### Task 4: Roasting Archetypes, Prepared Battle & Service Lifecycle

**Files:**
- Modify: `src/lib/ai/roast-engine.ts`
- Modify: `src/lib/ai/local-roaster.ts`
- Modify: `src/lib/demo/prepared-battles.ts`
- Modify: `src/lib/battle/validation.ts`
- Modify: `src/lib/battle/service.ts`
- Modify: `src/app/api/battles/route.ts`
- Test: `tests/integration/leetcode-battle.test.ts`

- [ ] **Step 1: Write integration tests for LeetCode battle lifecycle**
  Create `tests/integration/leetcode-battle.test.ts` testing:
  - `executeBattleFlow({ platform: "leetcode", u1: "neetcode", u2: "larryny" })` produces valid snapshot with `id: lc-*`.
  - Local roaster generates archetype-specific copy without contrary winner claims.
  - Storage persistence and retrieval.
  - Idempotency reserve and replay.

- [ ] **Step 2: Run tests to verify they fail**
  Run: `node node_modules/vitest/vitest.mjs run tests/integration/leetcode-battle.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement LeetCode roasts, prepared battle, validation, and battle service**
  - Add LeetCode context to `roast-engine.ts` Gemini prompt and archetype templates in `local-roaster.ts`.
  - Add `PREPARED_NEETCODE_VS_LARRYNY` in `prepared-battles.ts`.
  - Update `validation.ts` for `platform: z.enum(["codeforces", "leetcode"])`.
  - Update `service.ts` to branch on `platform === "leetcode"`.
  - Pass `platform` through `route.ts`.

- [ ] **Step 4: Run integration tests to verify they pass**
  Run: `node node_modules/vitest/vitest.mjs run tests/integration/leetcode-battle.test.ts`
  Expected: PASS

---

### Task 5: Social Share Cards & UI Form Activation

**Files:**
- Modify: `src/lib/platforms/registry.ts`
- Modify: `src/lib/share/card-renderer.tsx`
- Modify: `src/components/compare/CompareForm.tsx`
- Modify: `src/components/compare/BattleEntry.tsx`
- Modify: `src/app/roast/page.tsx`
- Modify: `src/components/battle/BattleResult.tsx`
- Test: `tests/unit/platforms/registry.test.ts`
- Test: `tests/unit/battle/entry.test.ts`
- Test: `tests/integration/battle-inputs.test.ts`
- Test: `tests/integration/card-rendering.test.tsx`

- [ ] **Step 1: Update registry and entry tests**
  - Update `tests/unit/platforms/registry.test.ts`: `isBattleEnabled("leetcode") === true`.
  - Update `tests/unit/battle/entry.test.ts`: allow LeetCode, reject GitHub/CodeChef.
  - Update `tests/integration/battle-inputs.test.ts`: verify LeetCode POST accepts valid requests.

- [ ] **Step 2: Update `registry.ts` and `card-renderer.tsx`**
  - Set `status: "live"` and `availabilityLabel: "live"` for LeetCode in `registry.ts`.
  - Make card headers dynamic (`${model.platform.label} · Story`, etc.) and format unrated subtitles cleanly without `undefined` or `0 rating`.

- [ ] **Step 3: Update `CompareForm.tsx`, `BattleEntry.tsx`, `roast/page.tsx`**
  - Support `?platform=leetcode` URL parameter.
  - Enable input bar when `isBattleEnabled(selectedPlatform)`.
  - Add demo shortcuts (`tourist vs Petr` for CF, `neetcode vs larryny` for LC).
  - Pass platform to mirror roast page.

- [ ] **Step 4: Run full test suite and build verification**
  Run: `node node_modules/vitest/vitest.mjs run`
  Run: `node ./node_modules/.bin/next build`
  Expected: ALL test suites pass (100% green), zero TypeScript or lint errors.
