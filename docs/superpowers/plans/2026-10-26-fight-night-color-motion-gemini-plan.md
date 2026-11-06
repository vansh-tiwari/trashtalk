# Fight Night Color and Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task when available. Steps use checkbox (`- [ ]`) syntax for tracking. Gemini can execute the same sequence directly; subagents are not required.

**Goal:** Recover the original reference's energy with strong color, visible motion, and adjacent mobile opponents while retaining the working Codeforces experience.

**Architecture:** Repair the existing presentation layer. Extend shared semantic theme tokens, add a small Framer Motion layer, then apply both to landing, results, and share previews/exports. Preserve saved battle data and the universal platform registry.

**Tech Stack:** Existing Next.js 15, React 19, TypeScript, Tailwind 3, Framer Motion 12, Vitest, Playwright, local Hanken fonts, existing PNG renderer. No new animation library.

**Spec:** `docs/superpowers/specs/2026-10-26-fight-night-color-motion-design.md` — read it before this plan; its palette, layouts, timeline, and evidence requirements are normative.

## Global Constraints

- Exactly one short roast, at most 24 words and 160 Unicode code points. No separate ruling paragraph, AI/model/source label, or second roast in a result.
- Use saved scores, outcomes, coverage, and copy. Viewing, animating, and exporting must not regenerate or change a result.
- Codeforces is live; LeetCode is next; GitHub and CodeChef are planned. The landing supports all four and registry extension.
- Keep local Hanken typography. No condensed novelty font or external font dependency.
- No scoring, storage, authentication, API-provider, or runtime-model migration in this repair.
- Reduced/paused modes show final scores, final bar lengths, visible text, and static ticket immediately.
- The new spec supersedes the old pastel/short-feedback-only guidance. Do not reapply old calm-style rules during cleanup.

## Review Focus

1. 320px width and 24-character handles: adjacent players remain legible, no truncation/overflow (Task 4).
2. Draw, partial coverage and insufficient data: no celebratory winner implication or fabricated zero values (Tasks 4–5).
3. Reduced motion, pause mid-count and hidden documents: final accessible content remains correct, intros do not replay (Tasks 2, 8).
4. Selecting non-live platforms: distinct preview theme but no battle request, fake metrics or loss of form functionality (Task 3).
5. Animated preview versus static export: identical final score, outcome, roast and platform colors in all PNG formats (Task 6).

## Execution contract

This is a presentation repair of completed work, not a rerun of the older 12-task feature build. Inspect `git status` and applicable `AGENTS.md` before starting; preserve unrelated edits. Use an isolated checkout if repository workflow requires it. Establish the existing test baseline once. Run focused checks after each task and the full suite at the final gate. Stage only task-owned files if committing.

Do not claim completion from a build, token swap, or screenshot alone. The first review checkpoint is an animated landing and result at both 1440px and 390px. If they still look like pale nested dashboards, correct them before progressing to secondary surfaces.

## File map and shared interfaces

| Responsibility | Existing or proposed files |
|---|---|
| Brand/platform token source | New `src/lib/platforms/visual-tokens.ts`; existing `registry.ts`, `theme.ts`, `src/app/globals.css`, `tailwind.config.ts` |
| Motion state and presets | New `src/components/motion/MotionProvider.tsx`, `Reveal.tsx`, `ScoreReveal.tsx`; new `src/lib/motion/presets.ts` |
| Landing composition | Existing `src/components/landing/LandingExperience.tsx`, `DemoMatchTicket.tsx`, platform selector/availability and compare form |
| Result composition | Existing `src/components/battle/BattleResult.tsx`, `Scoreboard.tsx`, `RoastMoment.tsx`, `MetricComparison.tsx`, `RadarComparison.tsx`, `src/components/problems/ProblemExplorer.tsx` |
| Static card parity | Existing `src/lib/share/card-model.ts`, `card-renderer.tsx`, `src/components/share/ShareDialog.tsx` |
| Browser proof | Existing `tests/e2e/fixtures.ts`, `global-setup.ts`, landing/result/share specs; new `tests/e2e/motion.spec.ts`, `playwright.motion.config.ts` |

Keep existing public component signatures unless the changes below explicitly add optional props. Do not move business logic into animation components.

### Task 1: Replace washed-out tokens with a complete color system

**Files:** Create `src/lib/platforms/visual-tokens.ts`; modify `src/lib/platforms/registry.ts`, `theme.ts`, `src/app/globals.css`, `tailwind.config.ts`, `design-system/trashtalk/MASTER.md`; extend `tests/unit/platforms/registry.test.ts`, `theme.test.tsx`.

**Interfaces:** Export `BRAND_COLORS` with `canvas`, `surface`, `ink`, `secondaryInk`, `rule`, `action`, `actionHover`, `winner`, `focus`. Extend `PlatformTheme` with required `accentInk`, `player1Chart`, `player2Chart`. Keep existing theme fields and `getPlatformConfig(id)` API. `getPlatformCssVariables(platform: Platform): Record<string, string>` must expose corresponding CSS custom properties and preserve existing aliases.

- [x] Inspect all usages of `player1`, `player2`, brand and hardcoded old hex values. Identify where a surface token is incorrectly used as text. Record the baseline `npm run typecheck`, `npm run lint`, `npm test` results.
- [x] Add meaningful registry/theme assertions: statuses unchanged; CF fills are exactly `#304BFF` and `#FF5A2A`; inks are white and `#111214`; every supported text pair reaches 4.5:1 and chart/paper pair reaches 3:1. Run `npx vitest run tests/unit/platforms`; new palette assertions should fail before changes.
- [x] Implement all spec palette values. Select dark chart variants for future platforms and verify contrast numerically. CSS globals consume shared values through a maintainable generated/static bridge; add a parity assertion if values must be duplicated. Avoid importing client-only code into the renderer.
- [x] Update MASTER with the new direction and replace its restrictive motion rule. Mark the earlier cool-social docs as superseded for visual guidance without deleting their history. Re-run platform tests and `npm run typecheck`.
- [x] Review a palette sheet or browser swatches, including small text, focus rings, full panels, and chart labels. Commit as `style: restore expressive platform color system` if commits are part of the workflow.

### Task 2: Build motion that works on touch and respects pause

**Files:** Create `src/lib/motion/presets.ts`, `src/components/motion/MotionProvider.tsx`, `Reveal.tsx`, `ScoreReveal.tsx`; integrate provider in `src/app/layout.tsx`; create `tests/unit/motion/policy.test.ts`; begin `tests/e2e/motion.spec.ts`.

**Interfaces:**

```ts
type MotionMode = 'full' | 'reduced' | 'paused';
// MotionProvider.tsx: client boundary around children; SSR-safe initialization.
useMotionPolicy(): { mode: MotionMode; paused: boolean; togglePaused(): void };
// presets.ts: pure helper, also used by unit tests.
resolveMotionMode(prefersReduced: boolean, paused: boolean): MotionMode;
// Reveal.tsx: ordinary content visible during SSR, additive animation after readiness.
Reveal({ children, sceneKey, kind, delayMs?, className? });
// kind: 'headline' | 'panelLeft' | 'panelRight' | 'roast' | 'share'
ScoreReveal({ value, sceneKey, accessibleLabel, className? });
```

Use `React.ReactNode` for children, `string` for sceneKey/accessibility labels, `number` for score/delay, and a literal union for kind. Put exact shared prop types in the component files. Presets store durations/delays from the spec, with milliseconds named explicitly and converted once for Framer Motion seconds.

- [x] Add policy tests: `(false,false)→full`, `(true,false)→reduced`, `(false,true)→paused`, `(true,true)→reduced`. Run `npx vitest run tests/unit/motion/policy.test.ts` and confirm initial missing-module failure.
- [x] Implement provider, stable pause control, tab-scoped preference, OS preference listener, and reusable presets. Add pre-hydration reduced-motion CSS. Reserve score width and expose a stable final score to accessibility APIs; decorative counting digits must be hidden from them.
- [x] Implement `Reveal` and `ScoreReveal` using installed Framer Motion. Animate essential content from a readable initial state, not server opacity zero. Settle on pause, reduced-motion changes, scene interruption and hidden document; only ambient drift resumes, not intro counts. No hydration/storage access errors.
- [x] Run unit checks and typecheck. In the browser test, count final accessible score occurrences, verify paused digits immediately equal final value, and verify preference survives navigation in the same tab. Browser test becomes runnable after Task 4 integration.
- [x] Commit as `feat: add accessible scene motion controls`.

### Task 3: Make the universal landing visibly energetic

**Files:** Modify `src/components/landing/LandingExperience.tsx`, `DemoMatchTicket.tsx`, `src/components/platforms/PlatformSelector.tsx`, `PlatformAvailability.tsx`, and presentation styles in `src/components/compare/CompareForm.tsx`; extend `tests/e2e/landing.spec.ts`.

**Interfaces:** Preserve `LandingExperienceProps` and `DemoMatchTicket` snapshot props. Consume Task 1 theme fields and Task 2 reveals with stable landing/demo scene keys. Demo numbers/copy derive from the supplied snapshot; explicitly label decorative proof illustrations if they are not data-driven.

- [x] Extend the browser checks for the new requirements: at 390×844 first handle input and selected platform visible; at 320px no horizontal overflow; every platform discoverable and upcoming selections send no battle POST. Run against current UI to identify actual baseline failures; do not invent a failing result.
- [x] Recompose the 55/45 desktop hero with the spec's heavier heading and large full-color ticket. Keep neutral space around strong blocks. Replace tiny pastel proof graphics and repeated nested cards with a strong process band and two clear receipt illustrations.
- [x] Implement the mobile order and 28–36px spacing. Apply actual entrance choreography plus optional ±4px ticket drift gated by visibility/motion policy. Keep form interactive immediately and retain retry/error semantics. Add no forced typing or loading delay.
- [x] Theme all four platform previews from registry, with future-platform status and emphasis intact. No fabricated upcoming platform results. Use accentInk rather than assuming white button labels.
- [x] Run `npx playwright test tests/e2e/landing.spec.ts tests/e2e/entry.spec.ts`. Review desktop and phone in motion without hover. Capture provisional recordings for comparison, then commit `feat: restore landing color and choreography`.

### Task 4: Restore the head-to-head result on mobile and desktop

**Files:** Modify `src/components/battle/BattleResult.tsx`, `Scoreboard.tsx`, `MatchHeader.tsx`, `RoastMoment.tsx`; extend `tests/e2e/result.spec.ts`, `motion.spec.ts`.

**Interfaces:** Preserve `BattleResult({snapshot})`, `Scoreboard({vm})` and roast copy inputs. Use `vm.id` for the result scene key and saved `vm.p1.score`/`vm.p2.score` for `ScoreReveal`. Outcome decorations depend on existing view-model evidence policy, never just the larger score.

- [x] Add browser assertions for adjacent player bounding boxes at 320/390px; both scores and the roast visible at 390×844 for the standard fixture; long handles fully available without truncation; no winner stamp for draw/insufficient cases. Include existing partial/legacy coverage fixture policies. Run current result tests and record which new checks fail.
- [x] Replace washed-out stacked cards with full cobalt/orange two-column panels at every breakpoint, visible central VS, heavy numerals, wrapping names and compact metadata. Match the spec's score sizes. Remove `/25` treatment and hidden phone VS.
- [x] Integrate panel, VS, decorative score count, eligible stamp and roast timeline from the spec. Keep the roast a single text block and preserve the rematch/share actions. Display warnings in normal reading order. Final intro settles by 1200ms.
- [x] Run `npx playwright test tests/e2e/result.spec.ts tests/e2e/motion.spec.ts`. Check numeric/copy identity before and after settling, missing-data state, accessible final values, and no intro replay after problem filter interactions.
- [x] Review the four-screen checkpoint with Task 3: desktop/mobile landing/result, full motion and settled. Fix composition now if color is still timid or phone users need hover to see movement. Commit `feat: animate compact head to head results`.

### Task 5: Give the receipts and overlap visible motion without clutter

**Files:** Modify `src/components/battle/MetricComparison.tsx`, `RadarComparison.tsx`, `src/components/problems/ProblemExplorer.tsx`; extend `tests/e2e/result.spec.ts`, `motion.spec.ts`.

**Interfaces:** Preserve existing metric and axis inputs. Optional `sceneKey?: string` can be added to chart components, supplied as `vm.id` by BattleResult. Use existing `MetricRow` values/kinds; no recomputation of the score or outcome.

- [x] Use the actual primary metric keys `rating`, `peak`, `solves`, `velocity` from `src/lib/battle/presentation.ts`; keep the other rows in a native disclosure with a clear accessible label. Verify disclosure reveals existing values and missing metrics stay unavailable rather than becoming zero.
- [x] Replace thin pastel bars with 8–12px paired chart colors and stable numeric labels. Keep normalized final widths in layout; animate an inner transform scale from the central origin once on viewport entry. No `transition-all` dependency for entrance motion.
- [x] Add radar stroke draw and overlap decorative wipe. Use theme chart colors, textual legends and different line styles. Preserve static accessible equivalents and evidence notes. Compact phone chart spacing and remove empty fixed-height containers.
- [x] Run result/motion browser specs. Verify scroll reveals actually change transform/path state, settle to correct geometry, do not replay when filtering, and remain immediately complete with reduced motion. Verify More stats is keyboard-operable.
- [x] Commit `feat: choreograph receipts and overlap reveals`.

### Task 6: Make share cards carry the same energy

**Files:** Modify `src/lib/share/card-renderer.tsx`, `src/components/share/ShareDialog.tsx`; update `src/lib/share/card-model.ts` only if needed; extend `tests/unit/share/card-model.test.ts`, `tests/e2e/share.spec.ts`.

**Interfaces:** Preserve `buildBattleCardModel` and existing PNG generation/download API. Renderer consumes `model.platform.theme` plus `BRAND_COLORS`; never import a client motion component into server/static rendering. Preview entrance uses `Reveal(kind='share')` around the final real image.

- [x] Add assertions that win/draw/insufficient fixtures preserve canonical outcome, scores, roast and platform theme in the card model. Run `npx vitest run tests/unit/share/card-model.test.ts`.
- [x] Remove hardcoded pastel renderer values. Build the spec's split-color composition separately for landscape, square and story, with readable wrapped handles, giant final scores, one roast and truthful label. Reserve branding/URL space and use installed local font data.
- [x] Add the 460ms preview entrance without regenerating the image on animation updates or altering downloaded pixels. Preserve focus trap, Escape, return focus, clipboard fallback and existing real native/download actions.
- [x] Run `npx playwright test tests/e2e/share.spec.ts` and inspect the actual 1200×630, 1080×1080 and 1080×1920 PNGs. Check long handles, long permitted roast, draw and incomplete cases; no clipping, washed colors, or mismatched scores. Save all three formats as evidence.
- [x] Commit `style: align share cards with expressive result design`.

### Task 7: Finish consistency across surrounding surfaces

**Files:** Modify only mounted header/footer, `/battle` entry/loading/error presentation, platform surfaces and problem filters as discovered through `src/app/layout.tsx` and route imports; update `tests/e2e/entry.spec.ts` as needed. Inventory exact discovered paths in the execution notes before editing.

**Interfaces:** No route/API/data changes. Consume existing brand/platform tokens and shared focus/touch styles. Preserve the provider, form and error contracts from earlier tasks.

- [x] Search active components for old palette values (`#5961A5`, `#E7E8F5`, `#E2EBE4`, `#737AB5`, `#668C76`) and calm-style remnants. Distinguish mounted routes from unused legacy ArcadeHero/RoastBox; do not mount obsolete components to get animations back.
- [x] Apply shared colors, focus rings, 44px targets and readable type to the discovered active surfaces. Keep loading informative without inventing live provider activity. Confirm upcoming platforms retain their own accents and honest status.
- [x] Run landing/entry/result/share browser specs, lint and typecheck. Review 768px tablet layout as well as the smallest phone. Verify validation and 429 retry behavior remain functional and keyboard focus visible against every fill.
- [x] Commit `style: align surrounding routes with shared visual system`.

### Task 8: Prove motion and final quality in production

**Files:** Create `playwright.motion.config.ts`; complete `tests/e2e/motion.spec.ts`; create evidence manifest `docs/review-evidence/2026-10-26-fight-night/verification.md` and media there. Reuse `tests/e2e/fixtures.ts` and `global-setup.ts`, including their safe unique fixture creation/cleanup.

**Interfaces:** Dedicated Playwright config uses the existing fixture setup and production server on its own port, e.g. 3101. Provide desktop 1440×900 and phone 390×844 projects, reduced-motion context cases, `video: 'on'`, and recorded output directory. No test-only product API or production fixture route.

- [x] Configure the production motion suite after inspecting existing Playwright config. Start command `npm run start -- --hostname 127.0.0.1 --port 3101`; baseURL `http://127.0.0.1:3101`. Keep the existing suite's port and lifecycle separate. Ensure video support is available; report an installation blocker if it is not, never replace recordings with a success claim.
- [x] Add temporal assertions using a controllable browser clock where supported: obtain initial, mid and final computed transform/numeric/path states; assert meaningful change and correct final value. Sample after an explicit scene-ready event/attribute, not an arbitrary network wait. Existing E2E consumers should not depend on these diagnostic markers.
- [x] Cover reduced-motion immediately-final UI; pause during score reveal; resume without replay; hidden-document/offscreen ambient suspension; filter changes without replay. Use unit coverage for lifecycle branches a browser runner cannot reliably trigger and include one manual visibility check in evidence. Do not test solely that Framer Motion was imported.
- [x] Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, then `npx playwright test --config=playwright.motion.config.ts`. Record actual commands, failures, fixes and final outputs. Re-run only affected checks after corrections, plus build if production files changed.
- [x] Save clean settled screenshots at 1440, 768, 390 and 320px. Save successful desktop/mobile landing and result videos, reduced-motion examples and pause/resume evidence. Capture intro frames near readiness +0/350/900/1800ms and separate viewport-reveal footage. Use actual videos, not a slideshow assembled from final screenshots.
- [x] Inspect a production performance trace on phone emulation: verify no continuous layout work from score counting/width animation and no unexpected layout shifts. Report measured observations; do not infer frame rate from passing unit tests. Check console/hydration errors and actual downloaded image dimensions.
- [x] Write `verification.md` linking evidence and summarizing what is automated versus manually observed, with any remaining limitation. Review the spec acceptance list in full. Commit `test: verify expressive desktop and mobile experience` only when evidence supports the claim.

## Completion gate

Deliver a working presentation repair plus the evidence manifest. Do not close this task with “colors updated and animations added.” Explicitly show the four principal screens, visible phone motion, reduced-motion behavior, and all three static share formats. Preserve the original data/functional test guarantees throughout.

## Plan self-review

Coverage: tokens/contrast/precedence → Task 1; timing/accessibility/lifecycle → Task 2; universal landing and availability → Task 3; adjacent phone matchup and one roast → Task 4; primary/expanded metrics and chart motion → Task 5; static share parity → Task 6; secondary surfaces → Task 7; recordings/responsiveness/performance/regressions → Task 8. Review Focus conditions have explicit owners above. New motion signatures are shared in Task 2 and consumers reference those exact names. No backend changes or new model configuration are required.
