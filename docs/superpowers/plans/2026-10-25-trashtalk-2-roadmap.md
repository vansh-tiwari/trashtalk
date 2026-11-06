# TrashTalk 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch a shareable Codeforces battle arena with credible evidence, four commentary personas, saved results, and social exports, then expand to other platforms.

**Architecture:** Evolve the existing Next.js application. Separate provider evidence, pure scoring/overlap, commentary, and immutable battle storage; render the result page and every export from the same saved snapshot.

**Tech Stack:** Existing Next.js/React/TypeScript/Tailwind; Zod at external boundaries; proposed Vitest for domain/adapter tests and Playwright for critical browser journeys; maintained Google GenAI SDK for optional generation. Durable storage/coordination provider is selected in Milestone 0.

**Spec:** `docs/superpowers/specs/2026-10-25-trashtalk-2-vision-analysis.md`.

**Status:** Proposed milestone plan for review. Milestone 0 must resolve infrastructure and evidence feasibility before later milestones become file-by-file execution tickets. This is not an approved implementation instruction or a claim that every interface below already exists.

## Global Constraints

- The user's confirmed priority is **public launch and shareability**.
- Do not rewrite the project from scratch.
- A GitHub bonus must not decide a Codeforces match.
- Score missing data as unavailable, not zero; never penalize an outage, a private activity history, or an absent optional profile.
- No direct comparison between Codeforces, CodeChef, and LeetCode rating numbers.
- No profile refetching or AI invocation from crawler-facing metadata/image routes.
- Page, OG preview, and downloadable card all consume the same snapshot.
- Incomplete history cannot prove exclusivity.
- Do not edit `legacy/` or disturb the existing staged migration and other working changes.
- No deployment, account creation, paid billing, or dependency installation is part of this planning turn.

## Review Focus

1. One missing/unavailable primary player must not produce a winner against invented scores (Milestones 1, 2, 4).
2. Truncated or shifting submission history must not generate false exclusives or a definitive DNA percentage (Milestones 1, 2).
3. Simultaneous requests and server instances must respect provider pacing, idempotency, and generation limits (Milestones 0, 1, 4).
4. Invalid/refused AI output and changed persona must preserve the deterministic verdict and give a usable local result (Milestone 3).
5. Crawler/export requests, long handles, missing avatars, draws, and stale snapshots must render the saved result consistently without generation (Milestones 4, 5).

## File responsibility map

Retain existing routes/components where useful. Proposed boundaries, to be refined after Milestone 0:

| Files | Responsibility |
| --- | --- |
| `src/lib/platforms/contracts.ts`, `src/lib/platforms/http.ts`, `src/lib/platforms/codeforces.ts` | Validated provider outcomes, deadlines, scheduling, normalization |
| `src/lib/battle/types.ts`, `scoring.ts`, `overlap.ts`, `service.ts` | Evidence types, versioned pure scoring/sets, orchestration |
| `src/lib/ai/roast-engine.ts`, `personas.ts`, `local-roaster.ts`, `schemas.ts` | Bounded optional generation and evidence-based fallback |
| `src/lib/storage/contracts.ts`, provider implementation chosen in Milestone 0 | Saved snapshots, profile caching, idempotency, atomic coordination |
| `src/app/api/battles/route.ts`, `src/app/api/battles/[id]/route.ts` | Explicit creation and read-only retrieval |
| `src/app/battle/page.tsx`, `src/app/battle/[id]/page.tsx` | Draft/challenge entry and canonical saved result |
| `src/components/battle/*`, existing `BattleCard.tsx`, `RadarChart.tsx`, `RoastBox.tsx` | Arena, status, coverage, trophy-room and commentary UI |
| `src/lib/share/*`, `src/app/battle/[id]/opengraph-image.tsx`, `src/app/api/battles/[id]/card/route.ts` | Snapshot-based images and PNG downloads |
| `src/app/page.tsx`, `src/lib/demo/*` | Prepared featured matches and hook |
| `tests/unit/*`, `tests/integration/*`, `tests/e2e/*` | Domain, provider/storage contracts, critical user journeys |
| `README.md`, `src/app/evolution/page.tsx`, `.github/workflows/ci.yml` | Accurate documentation and repeatable quality checks |

## Milestone 0: establish provider and deployment feasibility

**Deliverable:** A recorded architecture decision and representative public-data fixtures that remove the principal unknowns. This is discovery before a broad rewrite.

**Files:** Create `docs/decisions/0001-battle-data-and-storage.md`; fixture directory `tests/fixtures/codeforces/`. Read existing adapters and deployment configuration; introduce a spike script only during implementation.

- [ ] Fetch public Codeforces profile, rating history, and paginated accepted submissions for a novice/unrated profile, ordinary active profile, and large-history profile. Respect documented pacing. Record payload size, elapsed time, missing tags/ratings, canonical IDs, and how completion is established. Do not fetch source code.
- [ ] Decide snapshot/history scope, resumable pagination and concurrency behavior. Record handling of a new submission appearing between page reads: deduplicate submission IDs, use a fixed cutoff/cursor where supported, and withhold completeness if reconciliation fails.
- [ ] Select a durable store and atomic request coordinator, with explicit free-capacity behavior. Record deployment availability, quotas, credential names, expiry/removal policy, and whether one service satisfies both needs. Do not provision paid services implicitly.
- [ ] Decide the actual long-history mechanism: deployable resumable work with bounded polling, or a bounded partial result. Document concrete request/page/time budgets from the spike, rather than starting detached serverless tasks.
- [ ] Verify available Gemini model/free-tier settings with the deployment project when credentials exist; default to local mode otherwise. Keep model selection configurable and record billing state separately from application limits.
- [ ] Turn findings into exact contracts/values for Milestones 1–5. Later implementation waits on this evidence; storage choice is a real dependency.

**Acceptance:** A new implementer can identify provider request budgets, persistence/coordination mechanisms, job/partial-result strategy, and the supported first-release evidence scope without guessing. If complete overlap is impractical for large histories, the UI plan explicitly distinguishes complete and partial cases.

## Milestone 1: trusted evidence and repeatable checks

**Files:** `package.json`, ESLint/Vitest configuration, `src/lib/platforms/contracts.ts`, `http.ts`, existing `codeforces.ts`, new `tests/unit/platforms/codeforces.test.ts`, `tests/integration/provider-scheduling.test.ts`.

**Proposed interface:** `fetchCodeforcesEvidence(handle: string, context: FetchContext): Promise<PlatformEvidenceResult>`; the context carries deadline, scheduler, cache, and cutoff. Final field schemas come from Milestone 0. Outcomes distinguish `ok`, `not_found`, `rate_limited`, `unavailable`, and `partial`, with fetched time and coverage.

- [ ] Add a noninteractive lint command, typecheck command, Vitest runner, and provider fixtures as part of the adapter deliverable.
- [ ] Write failing tests for accepted-submission deduplication, rejected submissions, unrated/new users, malformed data, unknown handles, HTTP/API-level throttling, deadline expiration, partial pages, and a shifted page boundary. Tests must assert data status and completeness, not merely that fetch was called.
- [ ] Run `npm run test -- tests/unit/platforms/codeforces.test.ts`; verify the new behavior fails before implementation.
- [ ] Implement validated evidence, normalizing handles through provider responses, batched profile lookup where supported, bounded pagination, explicit cutoff and completion metadata. Prevent raw profile fields from leaking into public snapshots.
- [ ] Test shared pacing under concurrent clients with a fake clock and the selected production coordination contract; a process-local delay alone is insufficient. Ensure retries respect the same budget and do not create storms.
- [ ] Run the targeted tests, typecheck, and lint; review the diff and commit only this milestone's files.

**Acceptance:** No “not found” result hides a network failure; no incomplete history claims completion; concurrent requests obey the documented provider limit.

## Milestone 2: scoring, trophy room, and DNA

**Files:** `src/lib/battle/types.ts`, `scoring.ts`, `overlap.ts`, `tests/unit/battle/scoring.test.ts`, `overlap.test.ts`; replace relevant logic currently in `src/lib/platforms/aggregator.ts`.

**Proposed interfaces:** `scoreBattle(p1: BattleEvidence, p2: BattleEvidence, config: ScoringConfig): BattleVerdict`; `compareSolved(p1: SolvedHistory, p2: SolvedHistory): OverlapResult`. A verdict identifies player ID or draw/insufficient-data, with evidence reasons and scoring version. The overlap result carries coverage and optional definitive DNA/exclusives.

- [ ] Calibrate and record all five axis formulas, the recent-activity time window, weights, tie rule, required evidence, and incomplete-evidence behavior. Check novice, inactive, specialist, elite, and unrated fixtures. Keep this configuration reviewable before encoding it.
- [ ] Write failing invariant tests: swapping players swaps the winner ID/position without changing its meaning; equal evidence draws; absent optional GitHub changes nothing; missing primary evidence cannot win/lose; scores stay bounded; same-user mirror matches are explicit.
- [ ] Write failing overlap examples: A={x,y}, B={y,z} yields common={y}, exclusives={x}/{z}, DNA=100/3; duplicate accepted submissions do not affect results; both empty yields N/A; one complete empty set versus a nonempty complete set yields 0%; partial history suppresses definitive DNA/exclusives. Test native difficulty ordering and unrated items.
- [ ] Run `npm run test -- tests/unit/battle`; confirm failures, then implement the pure functions and versioned configuration.
- [ ] Verify targeted tests and typecheck; review and commit the milestone.

**Acceptance:** Scores and problem comparisons can be explained without an LLM; no fake score floors or cross-platform rating equivalence; raw evidence remains visible.

## Milestone 3: reliable persona commentary

**Files:** Existing `src/lib/ai/roast-engine.ts`, new `personas.ts`, `local-roaster.ts`, `schemas.ts`, `tests/unit/ai/roast-engine.test.ts`; replace the legacy Gemini SDK dependency after verification.

**Proposed interface:** `generateCommentary(input: CommentaryInput, deps: CommentaryDeps): Promise<CommentaryResult>`. Input contains bounded facts, player IDs, locked verdict, and persona. Output includes source (`ai` or `local`), persona, validated text, and prompt version; winner identity is read from the scoring domain.

- [ ] Write failing tests for all four distinct local persona styles; no-key behavior; 429, timeout, refusal, malformed/oversized JSON, wrong player IDs, and output contradicting the locked winner. Invalid output must select the local fallback.
- [ ] Add evidence fixtures to ensure absent GitHub is never described as an empty GitHub, recent activity is not inferred from lifetime totals, and no profile biography/HTML instructions enter the evidence prompt. Keep a small human-reviewed persona/evidence evaluation set alongside deterministic tests.
- [ ] Run `npm run test -- tests/unit/ai/roast-engine.test.ts`; verify failures.
- [ ] Implement maintained SDK integration, configurable model, structured schema validation, bounded prompt/output, deadline, and persona-specific fact templates. Use one bounded provider attempt, then local fallback; enforce the global allowance through the shared usage gate before the attempt.
- [ ] Verify targeted tests, typecheck, lint, and a no-key smoke test. Review and commit.

**Acceptance:** Every persona remains usable with AI disabled; changing persona cannot alter the verdict; UI can accurately distinguish local from AI commentary.

## Milestone 4: saved battle lifecycle and canonical URLs

**Files:** `src/lib/storage/*`, `src/lib/battle/service.ts`, new API routes, `src/app/battle/[id]/page.tsx`, `tests/integration/battle-lifecycle.test.ts`, `tests/e2e/battle.spec.ts`.

**Proposed interfaces:** `BattleStore.create(snapshot: BattleSnapshot): Promise<BattleSnapshot>` and `BattleStore.get(id: string): Promise<BattleSnapshot | null>`; `createBattle(request: CreateBattleRequest, deps: BattleDeps): Promise<BattleCreationResult>`. Storage-specific idempotency and atomic usage interfaces are finalized in Milestone 0.

- [ ] Write failing integration tests for validated inputs/enums, one missing player, normalized handles, duplicate idempotency keys, concurrent duplicate submissions, rate-limit exhaustion, storage failure, cached evidence, and pending/partial work. Set explicit response schemas/statuses in the execution ticket.
- [ ] Assert `GET` reads never call adapters or AI; reload returns the same evidence/verdict/roast; expired or removed IDs render an intentional unavailable result; a rematch produces a distinct snapshot. Pending creation IDs must be separate from immutable snapshot IDs; completing deeper evidence after a partial snapshot was shared creates a new snapshot. Assert player-specific roast text remains associated correctly when display order changes.
- [ ] Run `npm run test -- tests/integration/battle-lifecycle.test.ts`; verify failures before implementing.
- [ ] Implement creation, durable reads, idempotency, request coordination, quota/fallback behavior, and canonical server-rendered results. Keep query links as drafts, prefill validated platform/persona/handles, and require explicit custom battle submission. Do not leave the old GET-generation endpoint as an unrestricted bypass.
- [ ] Add browser tests for opening a prepared snapshot directly, creating/reloading/sharing a custom result, retrying an unavailable provider, and preserving the correct result during back navigation or an obsolete request completing.
- [ ] Run integration/browser tests and production build. Review and commit.

**Acceptance:** A friend or social crawler can open the exact saved result independently of the creator's browser and without generating another roast.

## Milestone 5: shareable arcade launch experience

**Files:** `src/app/page.tsx`, `src/app/battle/page.tsx`, `src/components/battle/*`, existing result components, `src/lib/demo/*`, `src/lib/share/*`, OG/card routes, `tests/e2e/share.spec.ts` and `arena.spec.ts`.

**Proposed interfaces:** `renderBattleCard(snapshot: BattleSnapshot, format: CardFormat): Promise<Response>` where formats map to OG 1200×630, story 1080×1920, and square 1080×1080. Both image paths consume the same presentation model as the result page.

- [ ] Write failing browser/integration checks for one-click prepared matchups, mobile trophy tabs/filters, partial-history messaging, source/coverage labels, draw/insufficient states, canonical share URL, and image dimensions. Test long handles, very long punchlines, missing avatars, and removed snapshots.
- [ ] Run the targeted checks to establish failure, then build the split-screen hero, VS and meters, prepared demo playback, progress/error/retry states, radar with numeric alternative, and trophy room. Retain a visible primary action on small screens.
- [ ] Implement metadata, OG and download routes from saved snapshots, local fonts, controlled avatar fetching/fallbacks, story/square export choices, and share actions containing the canonical URL. Assert image/crawler requests perform zero AI calls.
- [ ] Use a curated ticker clearly labeled as examples. Add motion controls/reduced-motion behavior; avoid confetti firing on every hover and support keyboard actions and clipboard failures.
- [ ] Visually inspect desktop/mobile result pages and all exported formats; verify contrast, truncation, focus order, touch targets, and source labels. Test OG crawler access and PNG content type/download disposition on a deployed preview.
- [ ] Measure the saved-demo three-second target under a documented mobile test profile; record actual results instead of assuming animation makes the experience fast. Run targeted checks and build; review and commit.

**Acceptance:** The full public loop is usable: see a battle immediately → create a real battle → inspect evidence → share/download → open the same verdict from another browser.

## Milestone 6: public launch quality and honest documentation

**Files:** `.github/workflows/ci.yml`, `README.md`, `src/app/evolution/page.tsx`, deployment/environment documentation and lightweight analytics event definitions.

- [ ] Add CI for noninteractive lint, typecheck, domain/integration tests, critical browser journeys, and build. External provider fixtures keep CI reproducible; scheduled/live provider checks are a separate later operational decision.
- [ ] Document configuration for durable storage, coordination, optional Gemini, free-capacity limits, public snapshot visibility/retention/removal, and provider limitations. Verify no secrets are bundled into the browser.
- [ ] Correct README/evolution claims to match delivered code, including model/SDK, Node/server runtime, caching, tests, source labels, dynamic metadata, and the existing Apache-2.0 license. Leave all legacy content untouched.
- [ ] Add minimal funnel events and operational signals: completion/latency, provider errors, cache hits, local-vs-AI ratio, storage failures, share/export intent. Exclude raw biographies and unnecessary full handles from operational logs.
- [ ] Run the complete release checks once after final changes. Rehearse missing player, upstream outage, no Gemini key, AI 429, partial history, export failure, and capacity exhaustion on preview.
- [ ] Publish only under the user's deployment authorization, verify canonical URLs/OG behavior, and record baseline funnel metrics. A launch decision includes actual storage/provider quota configuration, not a README cost promise.

**Acceptance:** The release can be demonstrated without credentials for AI, its limitations are visible, sharing survives reloads/crawlers, and the case study describes demonstrated engineering decisions.

## Subsequent plans, after the first sharing loop works

1. **GitHub exhibition and solo:** validate repo/language/activity access, separate scoring and radar, native torvalds-vs-antirez demo, dedicated solo workflow; optional candidate discovery with user confirmation. No universal developer-worth score.
2. **LeetCode and CodeChef:** investigate complete public solved IDs, timestamps, difficulty, API stability, and rate limits independently. Support summaries explicitly when full overlap is unavailable; do not market full trophy-room parity without evidence.
3. **Return visits:** challenge shortlist, persona remix, rematch, opt-in curated community highlights. Add accounts/history/leaderboards only when usage justifies them.
4. **Deeper evolution story:** interactive source comparison and actual measurements/test examples. Its narrative follows delivered features and does not hold up the shareable release.

## Dependency order and scope cuts

`0 → 1 → 2 → 3 → 4 → 5 → 6` is the conservative execution order. Work may be parallelized later where contracts are stable, but provider facts and snapshot semantics come first.

If time is constrained, cut the community feed, extra platforms, custom sound, elaborate animation, challenge recommendations, and deep case-study interactivity. Preserve deterministic evidence, working fallback, prepared demo, immutable sharing, basic exports, and honest partial/error states.

This plan deliberately has no calendar promise: history-fetch feasibility, infrastructure availability, and visual review are unresolved effort drivers. Milestone 0 enables a meaningful implementation estimate.
