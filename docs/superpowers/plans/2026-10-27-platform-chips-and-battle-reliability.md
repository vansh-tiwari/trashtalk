# Platform Selector Chips & Battle Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 
1. **Full-Width Rectangular Platform Chips:** Replace the `<select>` dropdown with a front-and-center, full-width segmented strip of rectangular chips (`Codeforces`, `LeetCode`, `CodeChef`, `GitHub`) spanning the exact width of the input box, complete with crisp brutalist styling and honest availability indicators.
2. **Eliminate "Fetch Failed":** Resolve the root causes of the `fetch failed` error by optimizing Codeforces API request intervals (from 2000ms down to 250ms), fixing case-insensitive handle not-found matching, replacing broken fictional one-click handles (`neo_coder vs bitwise_bella`) with verified CP handles, and ensuring the local server runs cleanly on port 3000.

**Architecture:** 
- In `CompareForm.tsx`, remove the native `<select>` and replace it with a semantic `role="tablist"` rectangular chip bar that spans the entire width of the form container.
- Each platform chip will have `role="tab"`, clear rectangular borders (`border-radius: 0`), uppercase mono/grotesk typography, and visual state styling (active filled background vs inactive crisp border).
- In `codeforces.ts` and `http.ts`, adjust API throttler timing from 2000ms to 250ms (well within Codeforces' 5 req/s limit) and extend queue deadlines to prevent timeouts.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript, Vitest.

---

## Global Constraints

- **Brutalist Design Integrity:** Zero rounded pills (`border-radius: 0`), heavy typography (`Hanken Grotesk` and `IBM Plex Mono`), stark ink borders (`2px solid var(--ink)`).
- **Truthful Platform Availability:** Codeforces remains `live`; LeetCode shows `up next`; CodeChef and GitHub show `coming later`. No fake battle submissions for disabled platforms.
- **Accessibility:** Platform selectors must maintain accessible tab navigation (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-label`).
- **Zero Test Regressions:** All 28 test suites (158 tests) must remain 100% passing.

---

## Review Focus

1. **Platform Selector Responsiveness:** Chips must adapt cleanly on desktop, tablet, and mobile (grid/flex that stays within container bounds without horizontal overflow).
2. **Chip Selection Behavior:** Selecting "Codeforces" enables the input fields and Fight button; selecting "LeetCode", "CodeChef", or "GitHub" reveals an honest status message and platform switch prompt.
3. **One-Click Shortcut Validity:** All one-click links must point to handles that exist on Codeforces (e.g. `tourist vs Petr`, `ecnerwala vs Benq`, `Radewoosh vs Um_nik`).
4. **Error Handling Clarity:** When an invalid handle is entered, the form must display `"User '<handle>' not found on Codeforces."` instead of an obscure `"fetch failed"`.
5. **Fast Battle Generation:** Settle-it submissions must finish within 2–4 seconds instead of 15+ seconds.

---

## Implementation Tasks

### Task 1: Fix Codeforces API Reliability & Throttler Timing

**Files:**
- Modify: `src/lib/platforms/codeforces.ts`
- Modify: `src/lib/platforms/http.ts`

**Details:**
1. In `src/lib/platforms/codeforces.ts`:
   - Codeforces returns `{ status: "FAILED", comment: "handles: User with handle <x> not found" }` with HTTP 400.
   - Update line 105: check `comment.toLowerCase().includes("not found")` and `infoRes.status === 400` so any not-found comment is accurately caught and returns `status: "not_found"` with error message `User "${cleanHandle}" not found on Codeforces.`.
2. In `src/lib/platforms/http.ts`:
   - Change `minIntervalMs` from `2000` to `250` in `codeforcesThrottler` (Codeforces allows up to 5 requests per second; 250ms = 4 req/s max, completely safe and prevents cumulative 12s+ lag across 6 sub-requests).
   - In `schedule()`, raise default `deadlineMs` from `15000` to `30000`.
   - In `fetchWithTimeout()`, raise default `timeoutMs` from `8000` to `12000`.

- [ ] Update `src/lib/platforms/codeforces.ts` error parsing.
- [ ] Update `src/lib/platforms/http.ts` throttler interval and timeout.
- [ ] Run automated tests to verify no regressions:
  ```bash
  npm test tests/unit/platforms/codeforces.test.ts
  ```

---

### Task 2: Replace Select Dropdown with Rectangular Platform Chips in `CompareForm.tsx`

**Files:**
- Modify: `src/components/compare/CompareForm.tsx`

**Details:**
1. Remove `<select aria-label="Platform">` from inside `.bar`.
2. Create a full-width platform selector strip above the inputs:
   ```tsx
   <div className="platform-chips" role="tablist" aria-label="Battle Platform">
     {AVAILABLE_PLATFORMS.map((p) => {
       const isSelected = selectedPlatform === p.id;
       const isLive = p.status === "live";
       return (
         <button
           key={p.id}
           type="button"
           role="tab"
           aria-selected={isSelected}
           onClick={() => setSelectedPlatform(p.id)}
           disabled={isPending}
           className={`chip-btn ${isSelected ? "active" : ""}`}
         >
           <span className="chip-name">{p.name}</span>
           <span className={`chip-badge ${p.status}`}>{p.status === "live" ? "LIVE" : p.status === "up_next" ? "UP NEXT" : "SOON"}</span>
         </button>
       );
     })}
   </div>
   ```
3. Update One-Click Shortcuts:
   - Replace fictional handles `neo_coder vs bitwise_bella` with real Codeforces competitors:
     - `tourist vs Petr`
     - `ecnerwala vs Benq`
     - `Radewoosh vs Um_nik`
4. If a non-live platform (`leetcode`, `codechef`, `github`) is selected:
   - Display a clean banner directly under the chip strip:
     `"{Platform} is coming soon. Battles are currently live on Codeforces."`
     with a 1-click button: `"Switch to Codeforces"`.

- [ ] Remove `<select>` dropdown and add the rectangular `platform-chips` container.
- [ ] Replace broken one-click shortcuts with verified CP handles.
- [ ] Add the non-live platform notice and switch action.

---

### Task 3: Style the Rectangular Chip Strip in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Details:**
1. Style `.platform-chips`:
   - `display: grid; grid-template-columns: repeat(4, 1fr); width: 100%; border: 2px solid var(--ink); border-bottom: 0; background: #fff;`
   - Mobile breakpoint: `grid-template-columns: repeat(2, 1fr)` or clean 4-cell wrap.
2. Style `.chip-btn`:
   - `display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 0; border-right: 1px solid var(--ln); background: #fff; cursor: pointer; font-family: 'Hanken Grotesk', sans-serif; font-weight: 700; font-size: 14px;`
   - Last child: `border-right: 0;`
   - Active state (`.chip-btn.active`): `background: var(--ink, #15171B); color: #fff;`
   - Badge (`.chip-badge`):
     - `font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600; padding: 2px 5px;`
     - Inactive: `background: #EEF0F4; color: #555;`
     - Active: `background: var(--or, #D82A26); color: #fff;`
3. Integrate with `.bar`:
   - `.bar` border adjusted so `.platform-chips` sits flush on top, forming one cohesive brutalist input module.

- [ ] Add `.platform-chips`, `.chip-btn`, and `.chip-badge` styles in `globals.css`.
- [ ] Adjust `.bar` top border and layout alignment for flush visual grouping.
- [ ] Verify responsive wrapping on mobile (`@media (max-width: 640px)`).

---

### Task 4: Verification & Functional Testing

**Files:**
- Test: `tests/unit/components/LandingExperience.test.tsx`
- Run: Full suite `npm test`
- Build: `npm run build`

**Manual & Functional Checks on `http://localhost:3000`:**
1. **Platform Chips:**
   - Confirm Codeforces, LeetCode, CodeChef, and GitHub are visible across the full width of the input strip.
   - Confirm each chip is rectangular with crisp borders and no dropdown.
   - Click each chip and verify active state toggling and honest status labels.
2. **Battle Submission:**
   - Enter `tourist` and `petr` -> Click "FIGHT" -> Verify it completes in <4s and navigates to the battle result page.
   - Enter an invalid handle (e.g., `tourist` vs `thisuserdoesnotexist999`) -> Verify user sees `User "thisuserdoesnotexist999" not found on Codeforces.` instead of `fetch failed`.
   - Click one-click shortcuts (`tourist vs Petr`, `ecnerwala vs Benq`) -> Verify all shortcuts navigate to working matches.
