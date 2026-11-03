# "WHO'S NEXT" Bottom CTA UI Redesign & Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix visual defects in the "WHO'S NEXT" (`.fin`) bottom CTA section across both the landing page (`/`) and battle result page (`/battle/[id]`), correcting the width mismatch, card enclosure boundaries, input dividers, platform preview contrast, and shortcut link layout to deliver a high-impact editorial brutalist fight-night card.

**Architecture:** 
1. Separate card framing (`.form-strip-container`) from outer supplementary elements (`.try` shortcuts and `MatchStatus`) in `CompareForm.tsx` so the 2px white border with 4px black shadow tightly encloses only the platform tabs and input bar.
2. Eliminate the 40px width discrepancy in `src/app/globals.css` where `.fin .bar` had `max-width: 720px` inside a 760px container, ensuring edge-to-edge alignment with the platform chips.
3. Structure `.fin .bar` with editorial brutalist dividers between Input 1, the "VS" separator, Input 2, and the "FIGHT" button, avoiding unbordered floating text and ensuring graceful responsive stacking on smaller screens.
4. Scope non-live platform preview panels (`.fin .platform-preview-panel`) so action buttons use solid obsidian black (`#111214`) instead of camouflaged Punch Red against the red CTA canvas.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, Tailwind CSS, Vitest.

**Spec:** [`docs/superpowers/specs/2026-10-26-fight-night-color-motion-design.md`](file:///Users/rtiwar36/Documents/PP/trashtalk/docs/superpowers/specs/2026-10-26-fight-night-color-motion-design.md)

---

## Global Constraints

- **Design Language:** Editorial Brutalist / Fight Night (`--ink: #111214`, `--bg: #F2F2F0`, `--or: #D82A26`, `--ln: #DADAD6`).
- **Zero External Spend:** Local-first, hermetic, no unmocked external requests in tests.
- **Responsive Guarantee:** No horizontal overflow (`overflow-x`) on viewports down to 320px.
- **Theme Integrity:** On red canvas (`.fin`), active chip and primary buttons must be high-contrast obsidian black (`#111214`), not camouflaged red (`#D82A26`).

---

## Review Focus

1. **Width Parity:** Platform chips and input bar must share identical 100% width within the 760px frame without red gaps inside the white borders.
2. **Container Scope:** Quick battle shortcuts (`.try`) and `MatchStatus` must sit cleanly beneath the card, not trapped inside the white border.
3. **Input Separation:** Clear vertical/horizontal dividing lines between Player 1 handle, the "VS" divider, Player 2 handle, and the Fight button.
4. **Platform Switch Panel:** Switching to an upcoming platform (e.g. GitHub) on `.fin` must show a black "try Codeforces" button, not an invisible red-on-red button.
5. **Hero Parity:** Edits to `CompareForm.tsx` must preserve existing hero header layout (`.hh .bar`) on the landing page without regressions.

---

## Task Decomposition

### Task 1: Decouple Form Strip Container from Supplementary Links in `CompareForm.tsx`

**Files:**
- Modify: `src/components/compare/CompareForm.tsx:215-405`
- Test: `tests/unit/components/CompareFormLayout.test.tsx` (new test)

**Interfaces:**
- Consumes: `CompareFormProps`, `PLATFORM_REGISTRY`, `MatchStatus`
- Produces: Updated DOM where `.form-strip-container` wraps only `.platform-chips` and `.bar` / `.platform-preview-panel`. `.try` and `MatchStatus` render directly under `<form>` outside `.form-strip-container`.

- [ ] **Step 1: Write the failing unit test for `CompareForm` structure**
Create `tests/unit/components/CompareFormLayout.test.tsx` verifying that `.try` is not a child of `.form-strip-container` and that `.form-strip-container` contains only `.platform-chips` and `.bar`.
- [ ] **Step 2: Run test to verify it fails**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/components/CompareFormLayout.test.tsx`
Expected: FAIL (currently `.form-strip-container` is on the `<form>` root element, so `.try` is inside it).
- [ ] **Step 3: Refactor container DOM in `src/components/compare/CompareForm.tsx`**
In `CompareForm.tsx`, keep `<form onSubmit={handleSubmit} className={`w-full ${className}`} aria-busy={isPending}>`.
Wrap the platform chips and the bar/preview panel in `<div className="form-strip-container">`.
Render `.try` and `<MatchStatus>` outside `div.form-strip-container`.
- [ ] **Step 4: Run test to verify it passes**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run tests/unit/components/CompareFormLayout.test.tsx`
Expected: PASS.
- [ ] **Step 5: Verify existing unit & integration test suites**
Run: `/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run`
Expected: All tests pass.

---

### Task 2: Fix Width Mismatch, Background Bleed, and Internal Dividers in `src/app/globals.css`

**Files:**
- Modify: `src/app/globals.css:1095-1160` (the `.fin` section styles) and `src/app/globals.css:310-330`

**Interfaces:**
- Consumes: CSS variables `--ink`, `--or`, `--ln`, `--bg`
- Produces: CSS rules ensuring `.form-strip-container` has solid background, `.fin .bar` is 100% width (no 720px cap), clean input dividing borders, high-contrast "VS" badge, and dark preview switch button.

- [ ] **Step 1: Write CSS assertions in a unit/integration test**
Verify in a layout test that `.fin .bar` has width 100% and that `.form-strip-container` specifies a solid background (`#FFFFFF`).
- [ ] **Step 2: Update `.form-strip-container` base rules**
In `src/app/globals.css`:
Set `background: #FFFFFF;` on `.form-strip-container` so inner transparent elements never expose parent background color.
- [ ] **Step 3: Update `.fin` rules for `.bar`, inputs, VS separator, and Fight button**
In `src/app/globals.css` under `.fin`:
- Change `.fin .bar`: `width: 100%; max-width: none; margin: 0; background: #FFFFFF; display: flex; align-items: stretch; border: 0;`
- Add input styling: `.fin .bar input { border-right: 1px solid var(--ln); min-height: 60px; font-size: 16px; font-weight: 600; padding: 0 18px; }`
- Style `.fin .bar .vsm`: `background: #FAFAFA; border-right: 1px solid var(--ln); color: var(--ink) !important; font-size: 16px !important; font-weight: 900; padding: 0 16px !important; letter-spacing: 0.05em;`
- Style `.fin .bar .fb`: `background: var(--ink, #111214) !important; color: #FFFFFF !important; font-size: 22px; font-weight: 900; min-height: 60px; padding: 0 36px; border: 0 !important; cursor: pointer; flex-shrink: 0;`
- Add hover state: `.fin .bar .fb:hover { background: #23262d !important; }`
- Add preview panel button override: `.fin .platform-preview-panel .preview-switch-btn { background: var(--ink, #111214) !important; color: #FFFFFF !important; }`
- Style `.fin .try`: `margin-top: 20px; justify-content: center; gap: 12px 24px;`
- Style `.fin .try .mono`: `color: rgba(255, 255, 255, 0.7); text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;`
- Style `.fin .try a, .fin .try button`: `color: #FFFFFF; font-size: 14px; font-weight: 600; text-underline-offset: 4px;`
- [ ] **Step 4: Ensure responsive behavior (< 700px)**
Under `@media (max-width: 700px)`, ensure `.fin .bar` inputs stack cleanly with `border-bottom: 1px solid var(--ln); border-right: 0;`, `vsm` hides or adapts, and Fight button is full width `100%`.
- [ ] **Step 5: Run TypeScript check and Vitest test suite**
Run:
`/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/typescript/bin/tsc --noEmit`
`/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run`
Expected: 0 errors, all tests pass.

---

### Task 3: Visual Polish & Typography Hierarchy in `LandingExperience.tsx` and `BattleResult.tsx`

**Files:**
- Modify: `src/components/landing/LandingExperience.tsx:307-317`
- Modify: `src/components/battle/BattleResult.tsx:470-480`

**Interfaces:**
- Consumes: `CompareForm`, editorial brutalist design tokens
- Produces: Polished `.fin` CTA section with clean headline typography, subtitle, and well-proportioned max-width constraint (`max-w-[780px]`).

- [ ] **Step 1: Check typography and casing**
Ensure the heading `<div className="big">Who’s next?</div>` has crisp brutalist styling and spacing. Add an accent highlight or subtitle refinement if appropriate.
- [ ] **Step 2: Verify both pages render correctly**
Verify that `.fin` in both `LandingExperience.tsx` and `BattleResult.tsx` share identical markup and container constraints.
- [ ] **Step 3: Run full automated verification suite**
Run:
`/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/typescript/bin/tsc --noEmit`
`/Users/rtiwar36/.nvm/versions/node/v24.13.0/bin/node ./node_modules/vitest/vitest.mjs run`
Expected: 100% green.
