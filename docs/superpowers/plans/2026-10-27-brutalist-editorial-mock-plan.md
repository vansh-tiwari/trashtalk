# TrashTalk Brutalist Editorial Mock Implementation Plan

> **Goal:** Transform TrashTalk to match the approved mock design files (`Main.dc.html` and `Battle.dc.html`) "same to same", while retaining all underlying product capabilities (Codeforces battle engine, canonical 5-axis scoring, one-short roast + persona commentary, problem overlap DNA, real PNG card exports, 429 rate-limit handling, and accessibility guarantees).

---

## 1. Executive Summary & Design Alignment

### Mock Files Source:
- **Landing Screen:** `file:///Users/rtiwar36/Downloads/Web · Landing-html/Main.dc.html`
- **Battle Result Screen:** `file:///Users/rtiwar36/Downloads/Web · Battle result-html/Battle.dc.html`

### Key Aesthetic Shifts:
| Element | Old (Fight Night / Cool Social) | New Brutalist Editorial Mock |
| :--- | :--- | :--- |
| **Typography** | Barlow / Hanken Grotesk | **Big Shoulders Display** (800/900 caps, line-height 0.88), **Hanken Grotesk** (400/500/700/800 body), **IBM Plex Mono** (500 labels) |
| **Color Palette** | Cobalt `#304BFF` & Orange `#FF5A2A` split | Paper Base `#F2F2F0`, Dark Arena `#15171B`, Punch Red `#D82A26`, Ink `#111214`, Stroke Red `#FF5A52`, Lines `#DADAD6` |
| **Header / Hero** | Neutral split cards | Dark arena `#15171B` with unified battle input bar (`.bar`) & 3-round rotating animated stage with rolling odometers |
| **Headings & Badges**| Rounded pill badges | Giant uppercase condensed typography with `-webkit-text-stroke` outlines, skewed VS badge (`transform: skewX(-14deg)`), bold stamps |
| **Scoreboard** | Standard split columns | Giant 3-column scoreboard with rolling odometer score (`72–64`) and punch-red Verdict banner (`.vband`) |
| **The Roast** | Single card inside result | Persona switcher pills (`Savage dev`, `VC`, `UFC`, `Hype-man`), 2-column roast quotes, interactive reactions (💀, 🔥, 🤡) & "Run it back" |
| **Analytics** | Simple bars & radar | 5-axis comparative paired bars + 5-axis Radar chart + Form Guide (Rating history line chart + 26-week Activity heatmap) |
| **Problem Overlap** | Table-centric layout | DNA Overlap bar (`21 | 38 shared | 14`) + monospace problem pills (`Both solved`, `Only player 1`, `Only player 2`) |
| **Sharing** | Popup modal only | Full in-page 3D preview arena (Link preview 1200×630, Story 1080×1920, Square 1080×1080) with floating cards + real PNG downloads |

---

## 2. Technical Scope & Functionality Preservations

1. **Platform Registry & Engine:**
   - Universal platform bar supports Codeforces (live), LeetCode (up next), CodeChef (coming later), and GitHub (planned).
   - Only Codeforces creates real battles in this milestone; honest non-live states for others.
2. **Scoring & Snapshot Engine:**
   - All canonical calculations (Rating, Peak, Solves, Speed, Grit, Margin, Winner) remain 100% intact in `src/lib/battle/`.
3. **Commentary & Personas:**
   - Real Gemini API + fallback local roaster populate `snapshot.commentary` with punchline, player 1 roast, player 2 roast, and persona.
   - Persona tabs allow exploring roasts from Savage Dev, VC, UFC Announcer, and Hype-Man.
4. **Export Card Engine:**
   - `src/lib/share/card-renderer.tsx` updated to render high-res PNGs matching the new brutalist design in 1200×630, 1080×1920, and 1080×1080 formats.
5. **Accessibility & Reduced Motion:**
   - Full keyboard navigation, `aria-label`s on odometers and score reveals, and `@media (prefers-reduced-motion: reduce)` support.

---

## 3. Phased Task Breakdown

### Task 1: Typography, Design Tokens & Global CSS Setup
- [x] Add `Big Shoulders Display` (weights 800, 900), `Hanken Grotesk` (weights 400, 500, 700, 800), and `IBM Plex Mono` (weight 500) via Google Fonts `<link>` in `src/app/layout.tsx` and configure Next.js fonts in `src/app/fonts/fonts.ts`.
- [x] Update `src/lib/platforms/visual-tokens.ts` and `src/app/globals.css` with exact mock tokens:
  - `--bg: #F2F2F0`
  - `--paper2: #E7E7E3`
  - `--ink: #111214`
  - `--or: #D82A26`
  - `--ord: #B8201C`
  - `--stroke-red: #FF5A52`
  - `--mut: #5E6066` / `#4D4F55` (and `#A3A6AE` / `#B5B8BF` for dark)
  - `--ln: #DADAD6`
  - `--dk: #15171B`
- [x] Update `tailwind.config.ts` font families (`display: Big Shoulders Display`, `sans: Hanken Grotesk`, `mono: IBM Plex Mono`) and color utilities.
- [x] Implement utility classes in `globals.css`: `.big`, `.out` (`-webkit-text-stroke`), `.mono`, `.fb` buttons, `.vsb` skewed badge, `.w` container, `.dk` dark surface, and `@keyframes` (roll, flt, mq, stamp, cardIn).

### Task 2: Core Motion & Data Visualization Primitives
- [x] Create `src/components/motion/OdometerValue.tsx`:
  - Renders tabular rolling number digits matching `.od>span>i` keyframe animation.
  - Includes `aria-label` for screen reader accessibility and static fallback for reduced motion.
- [x] Create `src/components/motion/MarqueeTicker.tsx`:
  - Punch-red continuous marquee banner (`.tk`) with hover pause control.
- [x] Create `src/components/battle/RatingHistoryChart.tsx`:
  - Clean SVG line chart displaying rating progression over last 10 contests for both players.
- [x] Create `src/components/battle/ActivityHeatmap.tsx`:
  - Dual 26-week / 7-row commit & solve heatmap (`.hm`) using player ink and punch-red tints.

### Task 3: Modern Brutalist Navigation & Footer
- [x] Update `src/components/Navbar.tsx`:
  - Brand header `.top` with `TrashTalk` in `Big Shoulders Display 900` + red superscript `2.0`.
  - Links: "How it works", "Fresh roasts", and "Start a battle" action button.
- [x] Update `src/components/Footer.tsx`:
  - Dark footer `.ft2` (`#15171B`) with `TrashTalk 2.0`, platform notes, and links.

### Task 4: Unified Battle Input Bar (`.bar`) & CompareForm
- [x] Update `src/components/compare/CompareForm.tsx`:
  - Match mock `.bar` structure: platform `<select>`, handle 1 input, skewed `vs` badge, handle 2 input, `Fight` button.
  - One-click shortcuts row (`.try`): `tourist vs petr`, `Linus vs Antirez`, `neo_coder vs bitwise_bella`.
  - Real integration: validates handles, submits to `/api/battles`, handles 429 rate limit cooldown timer, displays loading states ("Entering arena...", "Fetching receipts...").
  - Platform handling: Codeforces initiates battles; LeetCode/CodeChef display honest status indicator with quick-switch to Codeforces.

### Task 5: Landing Page Transformation (`LandingExperience.tsx`)
- [x] Implement Dark Arena Hero (`.dk.hero2`):
  - Subtitle: `.mono` "The developer battle arena".
  - Headline: `.h1` "Where developer profiles go to get roasted."
  - Integrated `<CompareForm />`.
  - Animated Stage (`.stg`): 3 cycling rounds (Round 01, Round 02, Round 03) showcasing handles with rolling odometer ratings and skewed VS badge.
- [x] Implement Punch-red Roast Ticker Marquee (`.tk`).
- [x] Implement "Three taps to a roast" process steps (`.sec2 .g3`):
  - 01: Drop two handles (interactive input preview).
  - 02: Get roasted (animated punchline words).
  - 03: Send it to them (floating mini card preview).
- [x] Implement "Fresh roasts" live arena marquee wall (`.band`):
  - Dual horizontal marquee rows (`.rowm` left, `.rowm.rv` right) with clickable battle cards (`.og2`).
- [x] Implement "Who's next?" CTA (`.fin`) with quick battle input bar.

### Task 6: Battle Result Scoreboard, Stage & Verdict Banner
- [x] Update `src/components/battle/MatchHeader.tsx`:
  - Dark stage bar with `TrashTalk 2.0`, `New battle` link, and `Share ↗` button.
- [x] Update `src/components/battle/Scoreboard.tsx`:
  - Match `.sbd`: Winner badge, Player 1 solid uppercase handle, rank/rating subtitle.
  - Center: "Final score" mono label + giant rolling score odometer (`.sc` e.g. `72–64` or `97–90`).
  - Right: Player 2 outlined uppercase handle (`-webkit-text-stroke`), rank/rating subtitle.
- [x] Implement Verdict Banner (`.vband`):
  - Punch-red full-width band with white text, "Verdict" mono tag, and headline verdict punchline.

### Task 7: The Roast & Interactive Reaction Bar
- [x] Update `src/components/battle/RoastMoment.tsx`:
  - Persona switcher pills (`.seg2`): `Savage dev`, `VC`, `UFC`, `Hype-man`.
  - 2-Column roast quotes (`.g2`): Left for Player 1 (ink dot), Right for Player 2 (punch-red dot).
  - Interactive reaction chips (`.rx`): Skull counter (`💀 2.4k`), Fire counter (`🔥 1.1k`), Clown counter (`😭 890`), plus "Run it back" rematch button.

### Task 8: Head to Head, Form Guide & Same Problems DNA
- [x] Update `src/components/battle/MetricComparison.tsx`:
  - 5 comparative paired bars matching `.tpr` & `.tpb` (Grit, Solves, Contest, Speed, Peak) with player 1 black bars and player 2 red bars.
- [x] Update `src/components/battle/RadarComparison.tsx`:
  - 5-axis Radar chart matching mock SVG styling with clean polygons and mono axis labels.
- [x] Add Form Guide section:
  - Rating history line chart (`<RatingHistoryChart />`) + Activity heatmap (`<ActivityHeatmap />`).
- [x] Update `src/components/problems/ProblemExplorer.tsx`:
  - DNA overlap bar (`.dna`): Player 1 unique solves (black), shared solves (gray), Player 2 unique solves (red).
  - Monospace problem pills (`.cp`): "Both solved", "Only player 1", "Only player 2".

### Task 9: Dedicated In-Page Share Section & Real PNG Generation
- [x] Add dedicated Share Arena (`.dk.shs`) in `BattleResult.tsx`:
  - Format toggle tabs: Link preview (1200×630), Story (1080×1920), Square (1080×1080).
  - 3D perspective card container (`.shr2`) with animated card previews (`.cv .og2`, `.cv .st9`, `.cv .sq9`) and floating confetti (`.cf`).
  - Action buttons: "Download PNG", "Copy link", "Send to group chat" (Web Share API).
- [x] Update `src/lib/share/card-renderer.tsx`:
  - Update all 3 card layouts (OG 1200×630, Story 1080×1920, Square 1080×1080) to use the new brutalist design tokens, typography, and punch-red accents.
- [x] Retain accessible modal `ShareDialog.tsx` for mobile and direct share triggers.

### Task 10: Verification, Test Suite Alignment & Responsive Polish
- [x] Align test assertions in `tests/unit/components/LandingExperience.test.tsx` and `tests/unit/components/BattleResult.test.tsx` to match the new DOM structures and copy.
- [x] Run full test suite: `npm test` ensuring all 158+ tests pass.
- [x] Test phone (<700px), tablet, and desktop responsive layouts.
- [x] Test `prefers-reduced-motion` compliance.

---

## 4. Definition of Done
1. **Visual Accuracy:** Landing and Battle screens match the mock files (`Main.dc.html` and `Battle.dc.html`) same-to-same in typography, colors, borders, and animations.
2. **Functionality Intact:** Real Codeforces battle creation, canonical scoring, honest platform registry, problem overlap DNA, and real PNG downloads are fully operational.
3. **Tests Passing:** Vitest unit & integration tests pass with zero regressions.
