# TrashTalk Cool Social / Codeforces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. For the user's selected Gemini executor, implement sequentially using the native equivalent when those skills/tools are unavailable; do not stop because a Codex-specific tool is missing.

**Goal:** Build the approved cool social design with a landing page for all present/future platforms, a complete working Codeforces flow now, and an explicit LeetCode-next boundary.

**Architecture:** A data-only platform registry controls identity, availability, and theme. Existing Codeforces fetch/scoring/storage services remain authoritative; a shared presentation/copy layer supplies the one short roast and result context to the web page and all exports. Reuse focused existing components, adding only the universal landing, availability states, shared copy helpers, and accessible share dialog needed by this design.

**Tech Stack:** Existing Next.js 15 App Router, React 19, TypeScript strict, Tailwind 3, Lucide, Framer Motion, Zod, Vitest; `next/og` PNG rendering. Add Playwright only as development verification tooling. No framework migration, new UI framework, new database, or runtime Python dependency.

**Spec:** `docs/superpowers/specs/2026-10-26-cool-social-codeforces-design.md`

**Target executor:** User-specified **Gemini 3.8 Flash High**, executing this coding plan. This wording does not configure the model inside TrashTalk. Preserve `GEMINI_MODEL`, credentials, and the existing runtime default unless a separate task explicitly authorizes a change.

## Global constraints

- Codeforces is the only `live` battle provider. LeetCode is `next`; GitHub and CodeChef are `planned`.
- The landing page represents all four and can grow through registry data. Its hero is platform-neutral.
- The result has exactly one short roast: at most 24 whitespace-separated words and 160 Unicode code points. Outcome metadata lives inside the same surface.
- No main-flow “AI,” “Gemini,” source/model badge, “AI judge,” separate ruling essay, or individual player roast cards.
- Use the latest cool social references and Hanken Grotesk; do not build the old Matchday or saturated blue/orange direction.
- Body/inputs 16px; essential metadata ≥12px; controls ≥44×44px. Fix mockup accessibility weaknesses instead of copying tiny/faint labels.
- Scoring, canonical snapshot IDs, stored outcomes, and existing saved links remain authoritative and compatible.
- Do not modify `legacy/`, wire old aggregator scoring into the new flow, or implement future provider pipelines in this phase.
- Preserve safe URL/handle validation, idempotency, real data provenance, local operation without an API key, and PNG export contracts.
- Do not deploy, publish, change app runtime model settings, or automatically post a user's card.
- Tests use fixtures/mocked providers. Viewing a saved result or downloading a card must not refetch Codeforces or generate a fresh roast.

## Review focus

1. A form rerender/query change must not erase typed handles, reset a pending attempt, or route a future platform into Codeforces. Tasks 1, 4, 5.
2. 429/error/malformed-success responses must retain inputs and provide a usable retry, rather than leaving the form permanently disabled. Tasks 4 and 12.
3. Draw, mirror, partial, historical, and insufficient snapshots must not render `@null`, fabricated zero completeness, an authoritative winner, or conflicting copy between page and card. Tasks 3, 7, 10.
4. Maximum-length handles, missing avatars, and legacy problems missing URLs/tags must remain readable and operable on phones. Tasks 2, 6, 8, 10, 12.
5. Sharing must work with keyboard-only navigation, clipboard rejection, native-share cancellation, offline renderer fonts, and long/non-ASCII roast text. Tasks 9, 10, 12.

---

## Before writing application code

The design is already approved. Do not reopen a broad style discussion. Read the specification, this plan, and the four reference screenshots. Open the standalone HTML to understand spacing and interaction hierarchy; its buttons are mock behavior, not production implementations.

Check for applicable repository instructions, inspect `git status`, and preserve unrelated work. At planning time the repository was clean at `79ce7cf`; re-check instead of assuming that remains true. At execution time use an existing suitable isolated worktree or the host's supported worktree workflow if needed. A worktree is not created by this planning task.

If locked dependencies are absent, run `npm ci`. Run and record baseline:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The current `lint` script may fall back to TypeScript when ESLint is absent. Report it accurately; do not claim a full ESLint audit. Existing failing checks are baseline findings, not permission to delete tests or rewrite unrelated services.

### Current repository facts that matter

- `/` and `/battle` already use `src/components/compare/CompareForm.tsx`.
- `/battle/[id]` loads `getBattleSnapshot`, then `toBattleViewModel`; it currently renders `MatchHeader`, `Scoreboard`, `MetricComparison`, `ProblemExplorer`, `RadarComparison`, and `Commentary`.
- `Commentary` currently displays four text blocks and a source badge. `Scoreboard` also repeats a punchline. Both must change.
- `BattleSnapshot.platform` and its runtime schema are **Codeforces-only**, despite broad profile fetchers existing elsewhere.
- `CreateBattleRequestSchema` currently accepts no platform field and strips unknown object keys. Explicitly gate provider requests rather than ignoring an unsupported provider.
- `CompareForm` currently includes `busy` in `isPending` forever after a 429 and syncs an object-valued `initialHandles` dependency; do not carry those behaviors into the redesign.
- Runtime parsing of `SolvedProblemSchema` currently drops `url` and `platform`, while `ProblemExplorer` assumes tags exist. Address this narrow display-data loss before polishing the table.
- Export uses `src/lib/share/card-renderer.tsx`; `/api/og` is Node runtime and returns PNG. The existing export tests check bytes/status, not exact dimensions or visual readability.
- Existing tests run in a Node environment. `renderToStaticMarkup` cannot prove click behavior, focus traps, or hydration.
- Old `src/types/index.ts`, `BattleCard`, `ArcadeHero`, and `RoastBox` are not the new architecture. Verify imports before altering/deleting any legacy unused modern component.

## File map and dependencies

Use these boundaries. Avoid a 1000-line page or a framework-sized platform abstraction.

| File | Action and responsibility |
| --- | --- |
| `src/lib/platforms/registry.ts` | New: ordered display/availability/theme metadata; no fetching or React imports |
| `src/lib/platforms/availability.ts` | New: safe query parsing and Codeforces-live checks |
| `src/lib/battle/validation.ts` | Extend request provider gate and preserve problem link/tag fields |
| `src/lib/battle/presentation.ts` | Keep policy; derive platform display from registry and consistent rating access |
| `src/lib/battle/short-roast.ts` | New: pure bounded stored-roast selection/fallback |
| `src/lib/battle/copy.ts` | New: page/export outcome and roast copy source of truth |
| `src/lib/share/card-model.ts` | New: shared card dimensions, formatted content, initials, canonical URL |
| `src/lib/share/fonts.ts` | New: cached server-only local font loading |
| `src/lib/share/card-renderer.tsx` | Restyle existing PNG composition from shared model |
| `src/lib/share/client.ts` | New: copy/native-share helpers; no provider calls |
| `src/lib/problems/presentation.ts` | New: safe statement URL, defensive tags, exact-set availability and filtering |
| `src/components/platforms/PlatformSelector.tsx` | New: accessible selectable provider buttons with visible status |
| `src/components/platforms/PlatformAvailability.tsx` | New: honest upcoming-provider preview |
| `src/components/landing/LandingExperience.tsx` | New: selected provider state, form/demo/availability composition |
| `src/components/landing/DemoMatchTicket.tsx` | New: prepared Codeforces sample preview |
| `src/components/compare/BattleEntry.tsx` | New: provider/query gate wrapping the existing form |
| `src/components/compare/CompareForm.tsx` | Retain/refactor working form, reset rules, error recovery, new appearance |
| `src/components/compare/MatchStatus.tsx` | Short recoverable user-facing states |
| `src/components/compare/PersonaSelect.tsx` | Keep real enum values, shorter friendly labels |
| `src/components/battle/RoastMoment.tsx` | New: exactly one displayed roast/outcome with optional local reactions |
| `src/components/battle/BattleResult.tsx` | New: fixture-testable result composition from one stored snapshot |
| `src/components/battle/MatchHeader.tsx` | Compact metadata/actions, no separate ruling |
| `src/components/battle/Scoreboard.tsx` | Adjacent player identity/score surfaces; no roast |
| `src/components/battle/MetricComparison.tsx` | Exact values and paired bars |
| `src/components/battle/RadarComparison.tsx` | Correct five axes, theme tokens, accessible alternative |
| `src/components/problems/*` | Keep existing filter/table/explorer functions; restyle and fix availability |
| `src/components/share/ShareDialog.tsx` | New: focused modal, actual PNG preview, copy/share/download |
| `src/components/share/ShareMenu.tsx` | Keep existing export name as a thin dialog launcher/adapter if useful |
| `src/components/ui/UserAvatar.tsx` | Reuse fallback, softer shape, reset failed image on identity change |
| `src/app/page.tsx`, `src/app/battle/page.tsx`, `src/app/battle/[id]/page.tsx` | Route composition, server/client boundary, metadata |
| `src/app/layout.tsx`, `globals.css`, `fonts/fonts.ts`, `tailwind.config.ts` | Shared theme/font tokens and shell |
| `src/app/roast/page.tsx`, `src/app/evolution/page.tsx` | Existing-route parity and honest copy |
| `src/app/loading.tsx`, `error.tsx`, `not-found.tsx` | Add if absent: usable loading/error/404 surfaces |
| `src/components/Navbar.tsx`, `Footer.tsx` | Shared brand/navigation/footer |
| `tests/unit/...`, `tests/integration/...`, `tests/e2e/...` | Focused regression tests below |
| `docs/review-evidence/2026-10-26-cool-social/` | Fresh actual-app screenshots and verification notes |

Dependency order: **1 → 2/3 → 4/5/6 → 7/8 → 9/10 → 11 → 12**. Execute sequentially. A notation like `2/3` means independent deliverables, not a request to spawn agents.

---

### Task 1: Define platform identity, availability, and the server gate

**Files:** Create `src/lib/platforms/registry.ts`, `availability.ts`; modify `src/lib/battle/validation.ts`; test `tests/unit/platforms/registry.test.ts`, `tests/integration/battle-inputs.test.ts`.

**Interfaces:**

```ts
import type { Platform } from '@/lib/platforms/contracts';
export type PlatformStatus = 'live' | 'next' | 'planned';
export interface PlatformTheme {
  accent: string; accentHover: string;
  player1Surface: string; player1Ink: string;
  player2Surface: string; player2Ink: string;
}
export interface PlatformConfig {
  id: Platform; label: string; status: PlatformStatus;
  availabilityLabel: string; theme: PlatformTheme;
  emphasis: readonly string[];
  layout: 'contest' | 'solving' | 'repositories';
}
export const PLATFORM_ORDER: readonly Platform[];
export const PLATFORM_REGISTRY: Readonly<Record<Platform, PlatformConfig>>;
export function getPlatformConfig(id: Platform): PlatformConfig;
export function parsePlatform(value: unknown): Platform; // unknown -> codeforces
export function isBattleEnabled(id: Platform): boolean;
```

- [x] Add behavioral tests: ordered labels are Codeforces/LeetCode/GitHub/CodeChef; exactly Codeforces is live; LeetCode is next; all entries have the spec's palette/layout metadata; invalid or array query values resolve to Codeforces.
- [x] Add request tests: omission of `platform` still parses as Codeforces; explicit Codeforces is accepted; LeetCode/GitHub/CodeChef/unknown produce 400 **before** `executeBattleFlow` or idempotency reservation. Spy/mock the service/store; do not hit external providers.
- [x] Run `npm test -- tests/unit/platforms/registry.test.ts tests/integration/battle-inputs.test.ts` and confirm the new behavior tests fail for the intended missing gate/registry.
- [x] Implement the plain-data registry and parsing helper. Add `platform: z.literal('codeforces').default('codeforces')` to the request schema. The route stays Codeforces-specific; preserve the current digest shape while only one provider is accepted. Do not widen `BattleSnapshot.platform` or reuse aggregator scoring.
- [x] Re-run those tests and typecheck. Commit the cohesive registry/gate changes with `feat: define platform identity and availability`.

### Task 2: Preserve problem data across storage and safe presentation

**Files:** Modify `src/lib/battle/validation.ts`; create `src/lib/problems/presentation.ts`; test `tests/unit/problems/presentation.test.ts`, `tests/integration/storage-contract.test.ts`.

**Interfaces:**

```ts
export type ProblemSet = 'common' | 'p1' | 'p2';
export type RatingFilter = 'all' | 'master' | 'hard' | 'easy' | 'unrated';
export type ProblemSort = 'rating-desc' | 'rating-asc' | 'name-asc';
export function getProblemStatementUrl(problem: Partial<SolvedProblem>): string | null;
export function getProblemTags(problem: Partial<SolvedProblem>): string[];
export function isProblemSetAvailable(overlap: OverlapResult, set: ProblemSet): boolean;
export function filterProblems(
  problems: readonly SolvedProblem[],
  options: { query: string; rating: RatingFilter; sort: ProblemSort }
): SolvedProblem[];
```

- [x] Add a round-trip test showing a valid persisted Codeforces problem retains its `url`, `platform`, and tags through `safeParseBattleSnapshot`. Add a legacy item with absent tags/url: no rendering helper throws; tags are an empty list and absent URL is handled honestly.
- [x] Test safe URL behavior: HTTPS official Codeforces URLs are accepted; a valid positive `contestId` plus safe problem index can construct the official statement URL; `javascript:`, foreign hosts, invalid IDs, and missing necessary fields return null. Do not invent a name-search URL as if it were the statement.
- [x] Test filtering for name/ID/tag, rating boundaries 1599/1600/2199/2200, unrated ordering, deterministic tie sort, and source-array immutability. Partial overlap permits `common` but not exclusives.
- [x] Run the focused tests and confirm the new cases fail before implementation.
- [x] Preserve optional `url`/`platform` in the Zod problem schema; default missing tags to `[]`. Keep historical optional fields backward compatible; do not create fake timestamps/ratings. Implement the pure helpers above. Do not alter the scoring/store architecture or existing saved records.
- [x] Run focused tests and existing storage tests. Commit with `fix: preserve problem evidence for result presentation`.

### Task 3: Establish one result/roast copy source for page and exports

**Files:** Create `src/lib/battle/short-roast.ts`, `copy.ts`; modify `src/lib/battle/presentation.ts` only where needed; test `tests/unit/battle/short-roast.test.ts`, `copy.test.ts`, existing `presentation.test.ts`.

**Interfaces:**

```ts
export function selectShortRoast(snapshot: BattleSnapshot): string;
export interface BattleCopy {
  platformId: BattleSnapshot['platform'];
  platformLabel: string;
  outcomeLine: string;
  roastText: string;
  scoreLabel: string;
  coverageNote: string | null;
  isSample: boolean;
  canonicalPath: string;
}
export function buildBattleCopy(snapshot: BattleSnapshot): BattleCopy;
```

Consumes registry, `toBattleViewModel`, and stored snapshots. Produces the only public roast/outcome string used downstream. `isSample` checks an explicit prepared-demo ID allowlist, not an arbitrary ID prefix.

- [x] Add tests for supported win, draw, mirror, insufficient, partial v2, historical v1, empty punchline, >24 words, >160 Unicode code points, and dot/hyphen handles. Assert the exact fallback strings in spec §6; no `Winner:` boilerplate remains in roast text; no `@null`; snapshots are not mutated.
- [x] Test that only a matching known winner prefix is removed. A contrary winner claim in stored text gets a safe fallback rather than being promoted. For non-win/partial cases use the explicit safe outcome fallback; do not trust a stored victory claim.
- [x] Test that demo data remains labeled sample even though the existing prepared fixture passes current supported-policy tests. Do not falsify `isDefinitive` on the stored fixture to match a visual label.
- [x] Run `npm test -- tests/unit/battle/short-roast.test.ts tests/unit/battle/copy.test.ts tests/unit/battle/presentation.test.ts`; confirm new tests initially fail.
- [x] Implement bounded selection, not substring truncation. Strip case-insensitive fixed prefixes for the actual stored winner by escaping the exact handle; do not use a loose username regex. Call `toBattleViewModel` for compatibility policy. Use registry label instead of hardcoding a generic “Codeforces” display in presentation. Keep existing commentary fields/schema and stored provenance intact.
- [x] Re-run tests, including unchanged presentation-policy assertions. Commit with `feat: share concise result copy across views`.

**Optional but in scope:** Update future-generation prompt wording to request a ≤24-word/160-code-point punchline and shorten new local punchlines. Preserve schema backward compatibility, source metadata, verdict guards, local-first operation, and runtime model selection. Rendering must still enforce the bound for old/overlong content even if generation ignores instructions. Add any changed generator cases to existing `tests/unit/ai/roast-engine.test.ts`; do not make an external model call in tests.

### Task 4: Rebuild the entry form with explicit provider and retry state

**Files:** Create `BattleEntry.tsx`; modify `CompareForm.tsx`, `MatchStatus.tsx`, `PersonaSelect.tsx`; create `src/lib/battle/entry.ts`; test `tests/unit/battle/entry.test.ts`. Actual browser cases belong to Task 12.

**Interfaces:**

```ts
export interface BattleEntryProps {
  platform: Platform;
  initialU1?: string; initialU2?: string;
  initialPersona?: RoastPersona;
  mode?: 'battle' | 'mirror';
  onPlatformChange?: (platform: Platform) => void;
}
// Keep CompareForm's existing optional onCreated(battleId) behavior.
// Add platform?: Platform, default codeforces, as a final defensive submit gate.
export function parseRetryAfterMs(value: string | null, nowMs: number): number;
export function parseEntryPersona(value: unknown): RoastPersona;
```

- [x] Test persona enum fallback; numeric/date/malformed `Retry-After`; clamp cooldown to 0–30,000ms with a 5,000ms malformed/missing fallback. Test future-provider submission rejection in a pure request-preparation helper if extracted; no request is constructed for unavailable providers.
- [x] Run the focused test and confirm missing helpers fail.
- [x] `BattleEntry` renders `CompareForm` only for Codeforces; otherwise renders the upcoming preview from Task 5. Parse string query values at the route boundary, not inside every input. Keep the current public `initialHandles` prop backward compatible while using primitive `initialU1`/`initialU2` values internally.
- [x] Fix value reset semantics: initialize once; synchronize only when the actual primitive route-prefill values change. A parent rerender or tone/platform preview change must not erase active Codeforces edits. Swap preserves exact case; Enter submits; trim only at validation/submission.
- [x] Model `idle`, `submitting`, `cooldown`, and `error` explicitly. Preserve existing `MatchStatusState` consumers if renamed. A 429 enters a bounded cooldown, then allows retry. HTTP errors, invalid JSON, and 2xx-without-ID return usable errors. Disable duplicate submit only for an active request/cooldown. Maintain existing idempotency-key behavior; no auto polling loop.
- [x] Make new copy exact: pending `checking the receipts…`; 429 `Codeforces is busy. Try again shortly.`; generic malformed-success `Couldn’t open that match. Try again.`. Preserve useful existing provider error details near the fields without technical rate-pacing narration.
- [x] Render form per mockup, with visible labels, 16px inputs, swap target ≥44px, four actual persona enum values mapped to `savage dev`, `VC energy`, `fight night`, `hype friend`. Set `aria-busy`/live status and focus invalid/error state. Honor reduced motion if retaining Framer Motion.
- [x] Run focused tests + typecheck. Task 12 must cover rerender retention, swap, 429 retry, duplicate suppression, and missing ID before this is accepted. Commit with `feat: rebuild Codeforces entry and recovery states`.

### Task 5: Build the universal landing and availability previews

**Files:** Create `PlatformSelector.tsx`, `PlatformAvailability.tsx`, `LandingExperience.tsx`, `DemoMatchTicket.tsx`; modify `src/app/page.tsx`; create `tests/unit/components/LandingExperience.test.tsx`, `PlatformAvailability.test.tsx`.

**Interfaces:**

```ts
export interface PlatformSelectorProps {
  value: Platform; onChange: (value: Platform) => void;
}
export interface PlatformAvailabilityProps {
  platform: Platform;
  onChooseCodeforces: () => void;
}
export interface DemoMatchTicketProps { snapshot: BattleSnapshot }
export interface LandingExperienceProps {
  demo: BattleSnapshot; initialPlatform?: Platform;
}
```

- [x] Use Node server-render tests to assert the neutral hero text, all four labels/statuses, one real saved demo link, and explicit LeetCode-up-next copy. Do not count server rendering as interactive test coverage.
- [x] Verify no upcoming preview renders a submit button/form or a fake score. The availability view has `try Codeforces` and platform capability labels only. Keep all four entries discoverable at phone width.
- [x] Run the new focused tests and confirm missing components fail.
- [x] Compose the landing with a client state island around provider selection and the working entry; keep static page and demo data server-renderable. Initial platform is Codeforces. On selection, update only provider-specific accents/content and preserve the shared hero.
- [x] Build the Codeforces tilted sample ticket from `PREPARED_TOURIST_VS_PETR` and shared copy; route it to the existing canonical sample. It is labeled `Codeforces demo` / `sample data`; no homepage fetch or randomness. On other platforms, replace the ticket with an availability preview, not a simulated matchup.
- [x] Replace Codeforces-only universal marketing with the spec's compact process and platform availability overview. Registry mapping determines item count/order; use wrapping CSS grid, no fixed four-item indices. Avoid a fake feed, ticker, ratings, users, or release dates.
- [x] Connect selection/tone/form to actual state and routes. Keep primary `settle it` near the hero; do not put an oversized decorative match before the phone's form.
- [x] Run focused tests + typecheck. Commit with `feat: add universal platform-aware landing`.

### Task 6: Apply the shared typography, token system, shell, and resilient avatars

**Files:** Modify `globals.css`, `tailwind.config.ts`, `layout.tsx`, `fonts/fonts.ts`, `Navbar.tsx`, `Footer.tsx`, `UserAvatar.tsx`, `design-system/trashtalk/MASTER.md`; create `src/components/platforms/PlatformTheme.tsx`, `src/lib/platforms/theme.ts`; font assets under `src/app/fonts/`; update `tests/unit/components/UserAvatar.test.tsx`.

**Interfaces:** `PlatformTheme({ platform, children, className? })` applies registry-derived CSS variables; `getPlatformCssVariables(platform: Platform): Record<string,string>` is pure and serializable. Keep platform background/ink roles distinct from winner/error semantics.

- [x] Test failed/empty avatars fall back to deterministic initials, protocol-relative URLs normalize, and a changed handle/URL can attempt a new image. Replace brittle class-name-only assertions with accessible name/content behavior. The image-error transition needs a real browser assertion in Task 12.
- [x] Run affected avatar/theme helper tests and confirm intended new cases fail where appropriate.
- [x] Copy the approved local WOFF2 and license into the app's font assets. Configure `next/font/local` with variable weights and an appropriate fallback. Remove live Barlow imports/class variables from layout. Keep existing font files until verified unused; do not break font references in exports.
- [x] Define base/Codeforces tokens from spec §3, future provider tokens from §4. Make Tailwind colors point to CSS variables. Include missing used aliases such as `positive-bg` only if retained; otherwise migrate their call sites. No runtime Tailwind string construction like `bg-[${theme.color}]`.
- [x] Implement lowercase brand, compact nav, softer footer, container/gutters/radii/spacing. Header `pick a rival` goes to working entry. No fictional nav pages or inaccessible mobile hamburger. Use an actual menu if links are collapsed; otherwise retain a concise visible action.
- [x] Make avatar failure reset when identity/image URL changes. Keep real avatar loading with monogram fallback; do not request a random third-party avatar as the only fallback. Name/score content must not depend on avatar success.
- [x] Update the active design-system document to the approved cool social direction, explicitly superseding old uppercase/blue-orange rules and source badges. Global 44px controls, readable metadata, reduced motion, and focus rules apply throughout.
- [x] Run typecheck and affected tests. Visually inspect homepage at desktop and phone before committing `style: adopt cool social design system`.

### Task 7: Replace duplicate result narratives with scoreboard plus one RoastMoment

**Files:** Modify `src/app/battle/[id]/page.tsx`, `MatchHeader.tsx`, `Scoreboard.tsx`, `MetricComparison.tsx`, `RadarComparison.tsx`; create `RoastMoment.tsx`, `BattleResult.tsx`; remove `Commentary` from active result composition; test `tests/unit/components/BattleResult.test.tsx`.

**Interfaces:**

```ts
export interface RoastMomentProps {
  copy: BattleCopy;
  persona: RoastPersona;
  rematchHref: string;
}
export interface BattleResultProps { snapshot: BattleSnapshot }
// Scoreboard remains Scoreboard({ vm: BattleViewModel }).
// MatchHeader remains a metadata/actions component, no winner essay.
```

- [x] Render a result composition with fixture props in Node tests. Assert one semantic roast region, one roast string, no long head-to-head/player text, no provider/model source badges, and correctly linked share/rematch controls. Add draws/insufficient/partial variants; do not merely grep source text.
- [x] Assert full `Petr` handle case is preserved. Test a 24-character handle and absent rank/avatar in static markup; actual wrapping/fallback is verified in browser.
- [x] Run focused tests; confirm old duplicate composition fails the new expectations.
- [x] Put the fixture-testable composition in `BattleResult({ snapshot })`, in spec §6 order. The async route retains snapshot lookup and `notFound`, then renders that component. Inside the composition invoke `toBattleViewModel` and `buildBattleCopy`; use `PlatformTheme` from `snapshot.platform`, not ID guessing. No client-side Codeforces refetch.
- [x] Scoreboard presents two adjacent surfaces, normalized scores from verdict score objects, real rating/rank, and sample/date/score context. Remove its punchline and verdict essay. Outcome metadata appears only within `RoastMoment`; do not move the old header badge into another large result banner.
- [x] `RoastMoment` shows `copy.outcomeLine`, selected style label, `copy.roastText` once, copy button, optional local 💀/😭 toggles, and rematch. Reactions have `aria-pressed`, no aggregate counts, no persistence API. Copy success is shown after resolution. Encode rematch params with `URLSearchParams` and include explicit Codeforces platform.
- [x] Place a concise visible `coverageNote` near the relevant scores/roast for partial/unknown data; expose the full existing warning via optional disclosure. Suppress unsupported winner decoration. No `@null` or misleading 0 placeholders for unavailable evidence.
- [x] MetricComparison shows paired bars plus exact raw values using one per-row scale and full labels. Keep accessible table semantics or an equivalent labeled value list. Radar uses the same five axes and player colors, visible legend, and a numerical alternative. Do not plot missing axes as valid zeros.
- [x] Run affected unit tests + typecheck. Desktop/phone result should match the packet's hierarchy, with production text sizing. Commit with `feat: build concise Codeforces result experience`.

### Task 8: Restyle problem overlap without deleting explorer functionality

**Files:** Modify `ProblemExplorer.tsx`, `ProblemFilters.tsx`, `ProblemTable.tsx`; consume Task 2 helpers; create `tests/unit/components/ProblemExplorer.test.tsx`. Interactions are tested in Task 12.

**Interfaces:** Keep current `ProblemExplorer({ overlap, p1Handle, p2Handle })`; centralize `ProblemSet`, `RatingFilter`, and `ProblemSort` types from Task 2 instead of keeping divergent copies in UI files.

- [x] Test initial both-set count, null exclusive counts for partial data, visible `unavailable` copy, empty definitive sets showing 0, and unknown DNA versus real 0%. Include absent tags and unsafe/missing links.
- [x] Test DNA segments only when definitive and `totalUnionCount > 0`; input common/exclusive counts belong to the same set. Do not use profile `solvedCount` as exclusive segment size. Check arithmetic against stored sample's 2/5/1 and 63%; retain the saved rounded percentage.
- [x] Run focused tests to observe intended failures.
- [x] Implement quiet segmented overlap summary, provider-colored identities, compact tabs and list. Counts and availability come from `OverlapResult`/presentation helpers. Partial exclusives are unavailable state, not a blank table.
- [x] Preserve actual search, rating filters, sorting, reset, and pagination. Consolidate phone filters into a labeled disclosure if needed. Reset visible page count to 30 whenever set/filter/sort changes; do not retain a previous set's oversized page count.
- [x] Use a proper tablist with associated IDs/panels and arrow/Home/End behavior. Missing statement URLs render plain text with an accessible unavailable reason. Existing valid Codeforces statement links open safely; names wrap on phone. Unknown rating displays `unrated`.
- [x] Run tests + typecheck. Task 12 proves tab/filter/page interaction. Commit with `feat: restyle truthful problem overlap explorer`.

### Task 9: Add the accessible share dialog and client share behavior

**Files:** Create `ShareDialog.tsx`, `src/lib/share/client.ts`; adapt `ShareMenu.tsx`; create `tests/unit/share/client.test.ts`. Browser behavior belongs to Task 12.

**Interfaces:**

```ts
export function getCanonicalBattleUrl(origin: string, id: string): string;
export function getCardUrl(id: string, format: CardFormat, download?: boolean): string;
export function copyText(text: string): Promise<void>;
export function shareBattle(
  data: { title: string; text: string; url: string }
): Promise<'shared' | 'unsupported' | 'cancelled'>;
export interface ShareDialogProps {
  snapshot: BattleSnapshot; open: boolean; onClose: () => void;
}
```

- [x] Test encoded URLs/format selection, canonical path on the current/configured origin, clipboard rejection propagation, successful native share, unsupported native share, and `AbortError` as quiet cancellation. Other native errors propagate to a useful inline error/fallback.
- [x] Run focused tests; confirm helpers are missing/failing as expected.
- [x] Use native `<dialog>` where supported by the application target browsers, with React open/close synchronization, Escape/cancel handling, accessible title, close button, focus trap, focus restoration, and `max-height`/internal scroll on short screens. Do not copy the prototype's fixed top-offset workaround.
- [x] Connect both share entry buttons to the same dialog and copy builder. Preview image `src` is `/api/og` for the selected real format. Provide loading/error/retry states; dimensions reserve layout. The preview and download show the same format and content.
- [x] Add copy canonical link with honest pending/success/failure feedback, device share if available, X intent as secondary, and three PNG download choices. Use `noopener,noreferrer` on external windows. No automatic posting and no fake copy success.
- [x] Keep “source” out of roast UI. Do not expose API keys, internal paths, or model names in errors or generated intent text.
- [x] Run helper tests and typecheck; complete browser dialog cases in Task 12. Commit with `feat: add focused share and export dialog`.

### Task 10: Render matching, offline-safe PNG cards in all three formats

**Files:** Create `card-model.ts`, `fonts.ts`; modify `card-renderer.tsx`, `src/app/api/og/route.tsx`; create static Hanken font assets and one-time `scripts/prepare-design-fonts.py` if conversion is needed; test `tests/unit/share/card-model.test.ts`, expand `tests/integration/card-rendering.test.tsx`.

**Interfaces:**

```ts
export const CARD_DIMENSIONS: Record<CardFormat, { width: number; height: number }>;
export interface BattleCardModel {
  copy: BattleCopy;
  player1: { handle: string; initials: string; score: number };
  player2: { handle: string; initials: string; score: number };
  platform: PlatformConfig;
  canonicalUrl: string;
  formattedDate: string;
}
export function buildBattleCardModel(snapshot: BattleSnapshot, origin: string): BattleCardModel;
// Keep renderBattleCard(snapshot, format?, options?) compatible.
// Extend RenderCardOptions with canonicalOrigin?: string.
// getCardFonts(): Promise<Array<{ name: string; data: ArrayBuffer;
//   weight: 400 | 600 | 700; style: 'normal' }>>
```

- [x] Test that the card model's roast/outcome exactly equal `buildBattleCopy(snapshot)` for supported, sample, draw, mirror, insufficient, partial, and historical fixtures. Model building does not mutate snapshots or request a provider.
- [x] Extend PNG tests to read PNG signature/IHDR bytes and assert **1200×630**, **1080×1080**, **1080×1920**. Retain content type, attachment, invalid ID, missing/unknown ID, and cache tests. Add long-handle and Unicode-roast fixtures. Verify renderer remains usable without external `fetch`.
- [x] Run focused tests and record intended missing model/dimension/font failures.
- [x] Prepare locally bundled **static** Hanken Regular 400 / SemiBold 600 / Bold 700 TTF faces for server rendering. The supplied browser font is WOFF2; do not pass it blindly to `next/og`.
  - A one-time conversion helper may load the approved WOFF2 with Python `fontTools.ttLib.TTFont`, instantiate `wght=400/600/700` using `fontTools.varLib.instancer.instantiateVariableFont` when an `fvar` table exists, set `font.flavor = None`, and save each TTF.
  - Install `fonttools[woff]` in a temporary virtual environment only if required. Do not add Python to deployment/build/runtime requirements.
  - Commit generated TTF assets and the source license. Check actual font weight/name metadata; do not rename a bold file to pretend it is regular.
- [x] Implement `fonts.ts` as server-only cached local asset loading compatible with Next's traced deployment assets. If using Node `fs` and `process.cwd`, include the font glob in `next.config.ts` output-file tracing and verify it in the production build. Never import `node:fs` into a client component.
  - Client share components import `CardFormat` with `import type`, never the renderer as a runtime value. If a `server-only` marker is used, make its test harness alias/mock explicit so plain Node/Vitest image tests can import the renderer without weakening the production boundary.
- [x] Build three deliberate compositions using `next/og` supported flexbox/inline styles. Use registry colors, initials, both exact handles/scores, the one short roast, one small outcome line, date/canonical URL, and sample/coverage note. Match the cool dialog/reference style; do not restore giant saturated panels or “Talk is cheap” marketing headlines from the rejected older card iteration.
- [x] For story, preserve the top/bottom safe zones and both players side by side. For max-length handles reduce type and wrap carefully; no hidden ending. Invalid dates fall back to `recorded match`, not a thrown `toISOString` error. Missing outcome handles never become `null` text.
- [x] API passes configured public origin when available, otherwise the request origin. Direct renderer tests pass an explicit origin such as `https://example.test`. Do not hardcode localhost or a guessed domain into exported pixels.
- [x] Run all card tests, generate all three actual PNGs, open them, and inspect text clipping/weight/spacing at normal and thumbnail scale. Save reviewed images as Task 12 evidence. Commit with `feat: render cool social share cards`.

### Task 11: Bring all existing routes and metadata into the same product

**Files:** Modify `src/app/battle/page.tsx`, `roast/page.tsx`, `evolution/page.tsx`, `layout.tsx`, saved result metadata and `BattleShareActions.tsx` if still referenced; create `loading.tsx`, `error.tsx`, `not-found.tsx` if absent; test `tests/unit/components/RouteStates.test.tsx`.

- [x] Add tests for safe query platform/persona selection, clear mirror-mode copy, useful missing-result navigation, and non-duplicated roast/source-free result metadata. Do not remove engineering documentation merely because it describes real internals.
- [x] Run focused tests and confirm new route-state behavior fails before implementation.
- [x] Route entry uses `BattleEntry` and existing prefill semantics. Known non-live `?platform=leetcode` shows `up next`; unknown platform defaults to Codeforces. Preserve old URLs with no platform parameter. `src/app/battle/[id]/page.tsx` metadata uses the same bounded roast/context as the card, plus existing OG PNG URL.
- [x] `/roast` is labeled `mirror match` and continues the real mirror backend; no promised dedicated solo analysis or extra roast blocks. `/evolution` gets Hanken/theme tokens and restrained history layout, removing self-grading/unsupported claims. `legacy/` remains byte-for-byte untouched.
- [x] Add consistent skeletons/error/404 surfaces with working retry/new-match actions. Global error boundary does not dump raw internal messages. Remove stale “AI judge”/source/model branding from navigation, homepage, result, share intents, social metadata, and solo entry. Keep operational provenance in stored data/logs.
- [x] Audit active imports for old `ArcadeHero`/`BattleCard`/`RoastBox`/`Commentary`; only delete proven unused files as a separate small cleanup, otherwise leave them unmounted. Do not bundle both old and new result experiences.
- [x] Run tests/typecheck and inspect all affected routes. Commit with `style: align routes and result metadata`.

### Task 12: Verify behavior, visual fidelity, and the future-provider boundary

**Files:** Add `playwright.config.ts`, `tests/e2e/landing.spec.ts`, `entry.spec.ts`, `result.spec.ts`, `share.spec.ts`, `fixtures.ts`, `global-setup.ts`; update `package.json`/lockfile and `vitest.config.ts`; save evidence and final notes. Keep E2E helpers out of production code.

- [x] Add `@playwright/test` as a dev dependency, install its Chromium runtime as needed, and add `test:e2e` script. Configure `testDir: 'tests/e2e'` and base URL `http://127.0.0.1:3100`; webServer command `npm run dev -- --hostname 127.0.0.1 --port 3100`. Exclude `tests/e2e/**` from Vitest while retaining its default exclusions, so `npm test` does not import Playwright files.
- [x] Mock `POST **/api/battles` in browser tests. A successful mock returns the real seeded demo ID so the existing saved route can load without provider calls. Never repeatedly fetch public handles to test CSS.
- [x] For real-browser alternate result states, `global-setup.ts` writes validated snapshot fixture JSON into the isolated checkout's existing `.data/battles/` directory using fresh safe IDs such as `cf-e2e-{runId}-draw` and exclusive `wx` writes. The current server store reads this directory; browser interception of `/api/battles/[id]` cannot substitute for a server-rendered page's direct store lookup. Record the exact created file paths in a run manifest passed to test workers; teardown removes only this run's own files. Do not overwrite the prepared demo or existing data, add production seed routes, change storage architecture, or create fixtures on a deployed server. Include draw/mirror/partial/insufficient/long-handle/missing-avatar fixtures with consistent verdict/player scores. Unit tests for `BattleResult` cover further content variants without additional public routes.
- [x] `landing.spec.ts`: four platform selectors/statuses; default live Codeforces; LeetCode selects a real `up next` preview with no enabled submit; GitHub/CodeChef planned; `try Codeforces` restores entry; provider selection causes **zero** battle POSTs; layout remains usable at 390/768/1440px and 320px smoke width.
- [x] `entry.spec.ts`: fill/swap exact case; change tone without losing values; a parent/controlled rerender does not reset fields; route-prefill changes synchronize intentionally; duplicate clicks make one POST; success navigates; 429 with `Retry-After: 1` allows retry; 404/500/invalid JSON/2xx missing ID retain inputs and clear pending state; unavailable provider causes zero POSTs.
- [x] `result.spec.ts`: exactly one roast surface/text; no source/model marketing; full handles and broken-avatar fallback; draws/mirror/partial/insufficient do not crown a winner; problem tabs and arrow keys update panel/count; search+rating+sort/reset work; pagination resets; missing URL is not a clickable false statement; no viewport horizontal overflow.
- [x] `share.spec.ts`: open from both launchers, actual selected PNG URL, format controls update preview/download, load failure retry, Tab remains inside modal, Escape/close restore launcher focus, successful copy feedback occurs only after resolution, rejected clipboard shows fallback, native-share AbortError is quiet. Verify reactions toggle locally with no server request/counter.
- [x] Run `npm run test:e2e` and fix actual behavior failures. No skipped tests hiding incomplete functionality. Mock provider boundaries; keep font/image rendering real.
- [x] Run final `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. Smoke-test `npm run start` from the production build and fetch each PNG to prove bundled fonts were traced. No external provider/font/avatar request may be needed for export.
- [x] Save actual-app desktop/mobile landing/result screenshots, provider planned states, draw/partial states, and all three PNG cards to `docs/review-evidence/2026-10-26-cool-social/`. Include a small `verification.md` with exact commands, pass/fail output summary, viewport sizes, known limitations, and sample/live labels.
- [x] Compare actual-app screenshots with the approved packet side by side. Check 200% zoom, keyboard-only use, reduced motion, dialog focus, text contrast, chart alternatives, and long names. Improvements for readable labels and 44px controls may change a few pixels; replacing the approved character is not acceptable.
- [x] Confirm `git diff -- legacy` is empty. Review that no new provider network integration, runtime model switch, environment secret, deployment, fake social count, or public seed-data mutation has entered the diff. Commit final evidence/tests with `test: verify cool social Codeforces experience`.

## Definition of done

All are required:

- [x] The four approved screens have actual application equivalents with the new font/palette/hierarchy.
- [x] Universal landing has all four providers, honest statuses, neutral hero, scalable provider rendering, and only Codeforces-enabled requests.
- [x] A real Codeforces submission can complete through the existing pipeline; saved demo works without an upstream call.
- [x] Page, copy, native/X sharing, dialog preview, and downloaded cards use the same bounded short roast and truthful outcome context.
- [x] Old saved snapshots still open. No re-scoring or commentary regeneration on view/export.
- [x] Full problem explorer works; partial/unknown evidence is not shown as zero or verified completeness.
- [x] Draw/mirror/insufficient/partial states, avatars, long handles, cooldown/retry, dialogs, and clipboard failure are verified.
- [x] PNG exports have exact dimensions, offline local fonts, correct safe zones, no clipping, and no hardcoded sample content in real matches.
- [x] Tests/typecheck/lint/build and browser checks have recorded results; actual screenshots/cards have been visually inspected.
- [x] LeetCode remains the explicitly documented next milestone. No fake functional integration ships.

## LeetCode next: leave this seam, do not implement it now

When separately authorized, add a real provider-specific evidence/scoring/overlap pipeline and versioned snapshot discriminant, then switch its registry availability to live only when those contracts and tests are ready. Reuse the landing shell, platform selector, one-roast/share behavior, and token roles. Give its result a difficulty-distribution emphasis; do not force Codeforces rating assumptions onto LeetCode.

Likewise, future GitHub comparison can use repository/contribution layout rather than invented “common solved problems.” Platform `status` becoming live is the final integration switch, not a substitute for implementing the backend.

## Executor completion response

Report what changed, which provider is actually live, verification evidence, screenshots, and any remaining concrete limitation. State whether the work is committed and where. Do not claim success based solely on a screenshot, all-green typecheck, or a 1000-byte PNG response. Do not publish or merge without the user's separate instruction.
