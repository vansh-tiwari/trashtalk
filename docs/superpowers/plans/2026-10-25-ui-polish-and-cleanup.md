# TrashTalk UI Polish, Animation & De-Slop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the TrashTalk Matchday interface by fixing avatar loading failures, expanding layout widths, adding purposeful micro-animations with Framer Motion, stripping unnecessary explanatory text, and cutting AI commentary slop.

**Architecture:** Introduce a resilient, self-healing `<UserAvatar>` component with zero broken images. Widen desktop containers from 896px (`max-w-4xl`) to 1152px (`max-w-6xl`) for generous editorial breathing room. Layer subtle Framer Motion micro-interactions (sliding tab indicator, count-up ease, accordion transitions) respecting `prefers-reduced-motion`. Refactor prompts and local templates in `roast-engine.ts` to ban robotic preamble and enforce sharp, authentic competitive programming humor.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion (`framer-motion@^12.4.7`), Vitest.

**Spec:** User feedback on Matchday direction; `design-system/trashtalk/MASTER.md`; `docs/superpowers/specs/2026-10-25-ui-revamp-design.md`.

## Global Constraints

- Preserve `legacy/` 100% untouched.
- Strictly maintain the Matchday light sports-editorial aesthetic (warm off-white canvas `#F4F1EA`, dark ink `#1B1E21`, crisp borders `#D8D4CB`, restrained blue `#2155CD` / orange `#B8491D`).
- Scoring authority remains deterministic; zero modifications to scoring calculations, tie-breaks, or verdict logic.
- Honor `prefers-reduced-motion` across all Framer Motion animations.
- Minimum 44×44px interactive target heights must be preserved.
- Tabular numerals must be preserved on all scores, ratings, and count deltas.

## Review Focus

1. **Broken Avatars**: When an avatar URL returns 503 (e.g. `userpic.codeforces.org`) or network fails, the UI must render an elegant monogram fallback with the player's corner colors—never a broken browser image.
2. **Layout Sizing & Responsive Margins**: Desktop layouts must feel spacious and balanced at 1440px without overflowing horizontally on 375px/390px mobile screens.
3. **Motion Sensitivity**: Animations must be understated and high-performance (transform/opacity only); never distracting, bouncy, or jarring.
4. **Information Density**: Removing filler paragraphs must increase scannability without removing necessary data context (e.g., preserving problem IDs, ratings, and partial coverage disclaimers).
5. **Authentic CP Commentary**: Commentary must avoid generic corporate AI filler phrases and use concise competitive programming concepts (TLE, test 2, greedy bugs, rating floor, master cutoff).

---

## File and Responsibility Map

| File | Responsibility |
| --- | --- |
| `src/components/ui/UserAvatar.tsx` | New resilient avatar component with protocol sanitization, DiceBear/monogram fallback, and error handling |
| `src/app/layout.tsx` | Expand global page container width (`max-w-6xl` / `1152px`) |
| `src/app/battle/[id]/page.tsx` | Expand battle result view width, clean layout spacing |
| `src/app/page.tsx` | Remove redundant "How it Works" cards and duplicate preview text; clean masthead |
| `src/components/battle/Scoreboard.tsx` | Replace fragile image with `UserAvatar`, add score entrance micro-animation and accordion easing for "Why this result?" |
| `src/components/battle/MatchHeader.tsx` | Remove verbose subtitles; present tight date/platform/ID context |
| `src/components/battle/MetricComparison.tsx` | Cut filler introductory text; tight sports-editorial table presentation |
| `src/components/battle/Commentary.tsx` | Strip redundant labels; clean pull quote and direct roasts |
| `src/components/battle/RadarComparison.tsx` | Smooth Framer Motion accordion transition; cut filler explanatory paragraphs |
| `src/components/problems/ProblemExplorer.tsx` | Add Framer Motion sliding tab underline; cut filler descriptions |
| `src/lib/ai/roast-engine.ts` | Overhaul Gemini system prompts and local templates to cut robotic AI slop and enforce punchy, authentic CP humor |
| `src/lib/demo/prepared-battles.ts` | Update tourist and Petr sample avatars to resilient URLs |
| `tests/unit/components/UserAvatar.test.tsx` | Test avatar error fallback behavior and monogram rendering |

---

## Task Decomposition

### Task 1: Resilient Image & Avatar Component

**Files:**
- Create: `src/components/ui/UserAvatar.tsx`
- Modify: `src/lib/demo/prepared-battles.ts:10-38`
- Modify: `src/components/battle/Scoreboard.tsx:17-41`
- Test: `tests/unit/components/UserAvatar.test.tsx`

- [ ] Write unit test in `tests/unit/components/UserAvatar.test.tsx` checking:
  - Renders image when URL is valid.
  - Automatically prepends `https:` if URL is protocol-relative (`//userpic...`).
  - Gracefully triggers fallback monogram initials when `onError` fires or URL is undefined.
  - Applies player corner color styling (`#2155CD` for p1, `#B8491D` for p2).
- [ ] Implement `src/components/ui/UserAvatar.tsx` using `next/image` with stateful error fallback to SVG monogram.
- [ ] Update `src/lib/demo/prepared-battles.ts` to replace broken `userpic.codeforces.org` links with reliable bottts SVG avatar endpoints.
- [ ] Integrate `<UserAvatar>` into `Scoreboard.tsx` for both Player 1 and Player 2.
- [ ] Run `npm test tests/unit/components/UserAvatar.test.tsx` and verify test passes.

### Task 2: Layout Width Expansion & Spacing Polish

**Files:**
- Modify: `src/app/layout.tsx:35-41`
- Modify: `src/app/battle/[id]/page.tsx:68-80`
- Modify: `src/app/page.tsx:8-25`
- Modify: `tailwind.config.ts:34-37`

- [ ] Update `tailwind.config.ts` container max-width to `1200px` (`max-w-6xl` scale).
- [ ] Update `src/app/layout.tsx` `<main>` wrapper to use `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`.
- [ ] Expand `src/app/battle/[id]/page.tsx` from `max-w-4xl` (896px) to `max-w-6xl` (1152px), providing optimal multi-column breathing room on 1440px displays.
- [ ] Test 375px mobile and 1440px desktop viewports with curl/visual check to verify zero horizontal scrolling.

### Task 3: Strip Redundant Text & Information De-Cluttering

**Files:**
- Modify: `src/app/page.tsx:10-180`
- Modify: `src/components/battle/MatchHeader.tsx:12-48`
- Modify: `src/components/battle/MetricComparison.tsx:15-35`
- Modify: `src/components/battle/RadarComparison.tsx:50-80`
- Modify: `src/components/problems/ProblemExplorer.tsx:75-105`

- [ ] Clean `src/app/page.tsx`:
  - Remove redundant 3-step "How it Works" cards at the bottom (the form and preview already explain the flow).
  - Remove redundant "Delta: +7 PTS • Score: 97 to 90" text in the preview card header.
  - Simplify masthead copy from verbose marketing paragraphs to punchy editorial statements.
- [ ] Clean `src/components/battle/MatchHeader.tsx`:
  - Remove verbose boilerplate subtitles like "Deterministic verdict decided by scoring engine v2.0.0."
  - Present a tight, clean meta line: `Codeforces • Saved [Date] • ID: [id]`.
- [ ] Clean `src/components/battle/MetricComparison.tsx`:
  - Remove introductory paragraph ("Direct metric comparison calculated deterministically from verified profile data.").
  - Keep the clean table and column headers clear and uncluttered.
- [ ] Clean `src/components/battle/RadarComparison.tsx` & `ProblemExplorer.tsx`:
  - Remove verbose explanatory subtitle text; let the section headers and data speak for themselves.

### Task 4: Purposeful Framer Motion Micro-Animations

**Files:**
- Modify: `src/components/problems/ProblemExplorer.tsx`
- Modify: `src/components/battle/Scoreboard.tsx`
- Modify: `src/components/battle/RadarComparison.tsx`
- Modify: `src/components/compare/CompareForm.tsx`

- [ ] In `src/components/problems/ProblemExplorer.tsx`:
  - Implement a sliding tab underline/indicator using Framer Motion's `layoutId="activeTabIndicator"` with a crisp spring transition.
- [ ] In `src/components/battle/Scoreboard.tsx`:
  - Animate score entry using subtle spring scale and opacity (`initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}`).
  - Add smooth accordion height animation to `"Why this result?"` disclosure with `AnimatePresence`.
- [ ] In `src/components/battle/RadarComparison.tsx`:
  - Wrap collapsible radar content in `AnimatePresence` with smooth height and opacity transitions.
- [ ] In `src/components/compare/CompareForm.tsx`:
  - Add interactive active tap feedback on Submit button (`whileTap={{ scale: 0.98 }}`).
- [ ] Verify that all motion elements respect `@media (prefers-reduced-motion: reduce)`.

### Task 5: Cut AI Slop & Sharpen Commentary Tone

**Files:**
- Modify: `src/lib/ai/roast-engine.ts:15-180`
- Modify: `src/components/battle/Commentary.tsx:20-80`
- Test: `tests/unit/ai/roast-engine.test.ts`

- [ ] Overhaul Gemini prompt instructions in `src/lib/ai/roast-engine.ts`:
  - Explicitly ban AI throat-clearing ("In this algorithmic showdown...", "It is fascinating to observe...", "Both players demonstrate exceptional...").
  - Ban generic corporate metaphors; mandate real competitive programming references (TLE on test 2, greedy vs DP, rating deflation, brute force hacks, Division 1 struggles, submission spam).
  - Enforce character caps: punchline maximum 12 words, head-to-head roast maximum 30 words, individual roasts maximum 20 words.
- [ ] Update fallback local templates in `roast-engine.ts` with authentic, witty developer zingers.
- [ ] Simplify badges in `Commentary.tsx` (e.g. replace `"Gemini 3.5 Generated"` and `"Tone: Savage Senior Dev"` with compact `Gemini 3.5 • Savage`).
- [ ] Run Vitest suite `npm test` to verify all commentary parsing, schemas, and admissions tests pass.

### Task 6: End-to-End Verification

- [ ] Run full typecheck: `tsc --noEmit`.
- [ ] Run full unit/integration test suite: `vitest run`.
- [ ] Build verification: `next build`.
- [ ] Verify HTTP 200 and visual rendering on `http://localhost:3000/` and `/battle/cf-tourist-vs-petr-legendary`.
- [ ] Test image fallback by simulating an unreachable avatar URL and ensuring monogram renders gracefully without broken image icons.
