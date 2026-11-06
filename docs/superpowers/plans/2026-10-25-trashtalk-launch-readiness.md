# TrashTalk Launch Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Codeforces battle → saved link → social preview/export loop safe, credible, and reliable enough for public launch.

**Architecture:** Retain the current Next.js application and domain separation. Enforce validated identities and evidence at boundaries; make storage create-only and durable; derive all presentation from versioned snapshots with coverage. Keep optional AI behind admission limits and a local fallback.

**Tech Stack:** Current Next.js/React/TypeScript, Zod, Vitest, proposed Playwright, maintained Google GenAI SDK; deployment-supported durable storage and atomic coordination selected in Task 2.

**Spec:** `docs/superpowers/specs/2026-10-25-gemini-implementation-review.md`, especially R1–R10; retain the full product intent in `docs/superpowers/specs/2026-10-25-trashtalk-2-vision-analysis.md`.

**Status:** Proposed follow-up plan. This planning/review turn makes no application changes. Exact deployment account/provider remains a real dependency, not an assumed installed service.

## Global Constraints

- The user's confirmed priority is **public launch and shareability**.
- Do not edit `legacy/` or disturb the existing staged migration and other working changes.
- Page, OG preview, and downloadable card all consume the same snapshot.
- No profile refetching or AI invocation from crawler-facing metadata/image routes.
- Incomplete history cannot prove exclusivity.
- Score missing data as unavailable, not zero; never penalize an outage, a private activity history, or an absent optional profile.
- No external account provisioning, paid billing, or production deployment without user authorization.
- Keep scope to the existing Codeforces experience; additional platforms and deeper solo/community features follow launch readiness.

## Review Focus

1. Encoded path separators, dot segments, malformed IDs, and unrelated on-disk JSON must never escape snapshot lookup (Task 1).
2. Read-only disk, process restart, independent server instances, duplicate IDs, and concurrent retries must never acknowledge a lost or overwritten snapshot (Task 2).
3. HTTP/API/JSON failures and truncated or moving submission pages must never masquerade as complete empty history or decide a false winner (Task 3).
4. Concurrent anonymous requests and AI timeouts must remain bounded across instances, with no duplicate quota consumption or contradictory winner text (Task 4).
5. Draws, unavailable snapshots, long text, missing avatars, and all export sizes must render correctly in actual image/browser requests (Task 5).

## Task 1: close snapshot lookup and request-validation holes

**Files:** Create `src/lib/battle/validation.ts`; modify `src/lib/storage/battle-store.ts`, `src/lib/storage/contracts.ts`, both battle API routes, `src/app/api/og/route.tsx`; add `tests/unit/storage/battle-store.test.ts` and `tests/integration/battle-inputs.test.ts`.

**Interfaces:** `parseBattleId(value: unknown): BattleId`; `CreateBattleRequestSchema`; a runtime `BattleSnapshotSchema` for the current version, expanded in Task 3. New IDs will use `cf-` plus UUID in Task 2; existing safe alphanumeric/hyphen/underscore demo IDs remain readable. Enforce an ID maximum of 160 characters and reject all slashes, backslashes, dots, whitespace, and encoded separator text at the shared boundary. The local adapter also enforces resolved-path containment.

- [ ] Add failing tests for direct storage and actual GET handling of `../../package`, encoded separators, backslashes, overlong IDs, invalid snapshot JSON, valid demo IDs, missing/non-string handles, and invalid personas. The traversal test must assert no file read outside the designated directory; use harmless temporary fixtures.
- [ ] Run the new tests and confirm the vulnerable cases fail against the existing code.
- [ ] Implement shared ID/request/snapshot validation and local path containment. Reject malformed requests with 400 and valid unknown IDs with 404. Do not coerce objects/arrays into handles. Derive handle syntax/length from provider documentation and record the exact rule before implementing it.
- [ ] Ensure HTML, JSON, and image reads all use this lookup. Image misses must not produce invented metrics.
- [ ] Run targeted tests, typecheck, and production build in an output directory separate from any active dev server. Review the task diff before committing only task-owned files.

**Exit:** The reproduced encoded traversal no longer returns project JSON, and valid saved/demo results still load.

## Task 2: make creation durable, create-only, and idempotent

**Files:** Modify `src/lib/storage/contracts.ts`, `battle-store.ts`, `src/lib/battle/service.ts`, creation route; create the selected durable adapter and `tests/integration/storage-contract.test.ts`. Update `docs/decisions/0001-battle-data-and-storage.md` to reflect the actual deployment.

**Interfaces:** `BattleStore.create(snapshot: BattleSnapshot): Promise<void>` rejects an existing ID; `get(id: BattleId): Promise<BattleSnapshot | null>` returns validated data. Generate new IDs using `crypto.randomUUID()`. `BattleCreationRepository` must atomically reserve an idempotency key/request digest, finish it with a snapshot ID, and distinguish pending, completed, conflicting, and failed attempts. Replaying the same key/body returns the same result; conflicting body returns 409.

- [ ] Confirm intended hosting and select storage with durable cross-instance reads, create-only writes, and atomic reservation capability. If the deployment is Vercel/serverless, local JSON is a development adapter only. Document retention/removal policy and capacity failure behavior; do not invent an external adapter in the ADR before implementing it.
- [ ] Add failing contract tests for unwritable disk, process-independent retrieval, duplicate IDs, simultaneous retries with the same key, changed body under the same key, storage outage, and completed replay without new provider/AI calls.
- [ ] Implement production store selection, explicit persistence errors, create-only writes, and idempotent service flow. Store the completed snapshot before acknowledging successful creation. Pending creation records are distinct from immutable snapshots.
- [ ] Bound any local cache; do not expose mutable cached references as immutable records. Decide how existing unversioned local results are read or marked unsupported.
- [ ] Run storage/lifecycle contracts against the local adapter and selected durable test environment. Verify a second process/instance can load a created result before declaring public sharing complete.

**Exit:** A returned canonical URL survives restart and cross-instance reads; failed persistence returns failure, never a successful but temporary link.

## Task 3: restore trustworthy evidence, scoring, and prepared demos

**Files:** Modify `src/lib/platforms/contracts.ts`, `codeforces.ts`, `src/lib/battle/types.ts`, `scoring.ts`, `overlap.ts`, snapshot contracts, `src/lib/demo/prepared-battles.ts`, saved result page, radar and trophy room. Extend unit fixtures/tests and add `tests/integration/evidence-to-snapshot.test.ts`.

**Interfaces:** Introduce explicit history availability (`complete`, `partial`, `unavailable`) with fetched time, accepted/submission counts, and oldest observed timestamp. `RadarAxes` supports unavailable values. `scoreCodeforcesBattle(p1, p2, config, referenceTime)` consumes a saved scoring configuration/version and explicit reference time. `compareSolved` never returns definitive exclusives when coverage is incomplete. Snapshot version 2 retains evidence coverage, fetched times, scoring reference/configuration version, and provenance (`captured` or `sample`).

- [ ] Write regressions for `user.status` HTTP 429/500, API `FAILED`, invalid JSON/schema, transport timeout, complete empty history, exactly-full/truncated pages, duplicated accepts, and an earlier acceptance outside the sample. Every failure must remain distinct from a successful empty history.
- [ ] Write regressions asserting no authoritative aggregate winner or definitive exclusive lists with required incomplete evidence; observed common problems remain visible. Test explicit unavailable axes and page/image presentation of insufficient data.
- [ ] Establish the supported comparison scope using representative large-history profiles with documented provider pacing. Implement bounded pagination and conservative completion detection. If the agreed request budget cannot establish the required scope, return an honest partial result without an aggregate winner; do not start detached serverless work. A resumable job is a separate deployment-backed decision.
- [ ] Implement provider response schemas, correct status transitions, coverage propagation, and timestamp handling. Distinguish first-time solves from repeat acceptances where the metric claims new solves.
- [ ] Define Algorithmic Grit from rated solved-problem difficulty rather than duplicating Contest Peak. Calibrate normalization/weights with novice, unrated, specialist, inactive, and elite fixtures, then publish a new scoring version. Tests must prove the axes can differ and swapping players preserves the same underlying winner.
- [ ] Generate the prepared demo using captured evidence and the real scoring/overlap functions. If only sample data is available, label it explicitly throughout the hero/result/exports. Assert DNA equals rounded intersection/union, stored scores match the declared configuration, avatars differ or fall back safely, and no unsupported “verified” claims appear.
- [ ] Run domain/adapter/integration tests and review raw metric/source/coverage labels in the browser. Preserve old snapshots as old versions rather than silently rescoring shared results.

**Exit:** An outage or truncated history cannot fabricate an advantage, and the first demo agrees with its own evidence and scoring version.

## Task 4: bound creation traffic and optional AI

**Files:** Modify `src/lib/platforms/http.ts`, battle service/creation route, AI engine/schema/personas; add shared coordination/cache adapters under `src/lib/storage/`; add `tests/integration/admission.test.ts`, `tests/unit/platforms/http.test.ts`, and mocked AI-path tests.

**Interfaces:** `AdmissionGate`, `ProviderScheduler`, and `EvidenceCache` share deployment-wide coordination from Task 2. The scheduler enforces documented minimum spacing and counts queue wait within an end-to-end deadline. AI results remain optional; result identity and authoritative victory line are rendered from `BattleVerdict`.

- [ ] Set and document anonymous/global admission limits, bounded queue capacity, total creation deadline, evidence TTL, AI deadline/output limit, and retry policy from the deployment/provider quota evidence. Limits are configuration with safe defaults, not “unlimited free.”
- [ ] Add fake-clock/concurrent-instance tests for provider spacing, queue full/deadline expiry, cache hits, retry-after behavior, idempotent replay, and no AI/provider invocation on GET. Assert local fallback after AI capacity exhaustion.
- [ ] Implement admission before expensive work, shared pacing, bounded cache reuse, and caller idempotency keys in the UI. Deduplicate mirror-player retrieval and batch profile fetches where supported. Return typed 429/503 responses rather than raw internal exception strings.
- [ ] Migrate Gemini to the maintained SDK, verify a deployment-available model, and abort/clean up timed-out requests. Default to local mode without a key; never automatically switch to a paid provider.
- [ ] Add mocked AI tests for 429, network error, refusal, malformed/oversized output, cancellation, and valid JSON that announces the wrong winner. Keep the verdict/winner title deterministic; use constrained generated banter and fallback for explicit contradictions. A string schema alone is not a factuality check.
- [ ] Run targeted tests and a credential-free end-to-end smoke test. Review configurations and actual queue/limit behavior before enabling anonymous AI generation.

**Exit:** Concurrent traffic has bounded work and quota consumption, and commentary cannot override the result displayed or exported.

## Task 5: repair and complete the sharing experience

**Files:** Refactor `src/app/api/og/route.tsx` into focused card renderer/helpers under `src/lib/share/`; modify saved page metadata/share actions, global metadata, and result components; add `tests/integration/card-rendering.test.tsx` and `tests/e2e/share.spec.ts`.

**Interfaces:** `renderBattleCard(snapshot, format): Promise<Response>` accepts validated format `og`, `story`, or `square`; output dimensions are 1200×630, 1080×1920, and 1080×1080 respectively. The renderer consumes a shared outcome presentation function with explicit `win`, `draw`, and `insufficient_data` cases. Public origin is configured and validated separately from request user input.

- [ ] Write failing rendering checks that consume the complete PNG response body, decode its dimensions, and assert content type/download disposition for all formats. Cover the saved demo, draw, insufficient result, missing/removed ID, long handles/punchline, and broken avatar. Mock/deny network calls to prove rendering is self-contained.
- [ ] Fix Satori-incompatible multi-child div layouts and bundle required font assets locally. Avoid dynamic font/glyph fetches. Implement responsive compositions for the three aspect ratios rather than only resizing the canvas.
- [ ] Remove player-1 winner and invented-stat fallbacks. Add visible draw/unavailable states. Supply canonical URLs/timestamps and a robust initials fallback if avatars are included.
- [ ] Configure absolute canonical/OG metadata from the public origin, expose story/square download choices, and await clipboard success before showing “Copied.”
- [ ] Add browser journeys for creating/opening/reloading a saved battle, copying its URL, downloading each format, draft/rematch query inputs, and unavailable states. Check 375px/390px mobile layouts, keyboard operation, reduced motion, and radar numeric alternatives.
- [ ] Visually inspect the actual generated images and desktop/mobile pages. Verify on preview that crawlers obtain public image URLs, complete PNG bytes, and the same verdict as the page, with zero AI calls.

**Exit:** The current Battle Card button works; all formats and outcomes are consistent, readable, and independently shareable.

## Task 6: establish the release gate and correct claims

**Files:** `package.json`, ESLint/Playwright configuration, `.github/workflows/ci.yml`, README, evolution page, and ADR.

- [ ] Add configured noninteractive lint/typecheck commands and CI for lint, types, Vitest, critical browser/image checks, and production build. Separate build outputs from any running development server.
- [ ] Correct license attribution to Apache-2.0 and remove unsupported claims of durable KV readiness, comprehensive verification, or infallible/guaranteed-free infrastructure. Describe the actual public snapshot scope/retention and current platform support.
- [ ] Run the release checks and rehearse traversal rejection, missing player, provider outage, throttled/partial evidence, failed persistence, AI disabled/exhausted, draw, and export failure on a deployed preview.
- [ ] Record observable launch signals: creation completion/latency, provider errors, cache/local fallback ratio, storage failures, export success, and share intent. Keep logs minimal and free of credentials/raw profiles.

**Exit:** The public Codeforces loop passes real browser/image/storage checks and documentation accurately states its limits. Deployment remains a separately authorized action.

## Execution recommendation

Implement the security validation fix first, then durable creation and evidence correctness, then admission/AI and sharing. Preserve Gemini's useful UI/domain work. Avoid another broad feature pass until this release gate passes. Account/provider selection is the only expected external dependency; do not let it block the independent validation, evidence regressions, and renderer fixes.
