# TrashTalk — Editorial Fight Night Design System

**Status:** Approved active design direction. **Date:** 2026-10-26.  
**Supersedes:** The 2026-10-26 cool-social design documents and their muted pastel palette / 120–180ms-only motion restriction. Functional constraints (one short roast, saved scores, platform neutrality, truthful states) remain binding.

---

## 1. Visual Direction & Spirit

**Editorial Fight Night**: Warm paper, strong ink, orange slabs, cobalt player panels, lime winner stamps, large clean typography, and clearly visible on-entry choreography.

- **Tone:** Irreverent, electric, razor-sharp, truthful.
- **Rule of Evidence:** No fake scores, no decorative zero fallbacks for missing data, and no fabricated release dates.
- **Roast Principle:** Exactly **one concise roast** (≤ 24 words, ≤ 160 Unicode code points) shared across web, share dialog, and all image exports.
- **Motion Principle:** Visible on-entry choreography (not hover-dependent) that settles within ~1200ms and respects pause / reduced motion.

---

## 2. Color Palette & Semantic Tokens

### Base Palette

| Role | Token | Hex | Usage / Contrast |
| --- | --- | --- | --- |
| Canvas | `--canvas` | `#F4F4F0` | Warm neutral page canvas |
| Surface | `--surface` | `#FFFFFF` | Elevated cards, forms, expanded details |
| Ink | `--ink` | `#111214` | Primary text, deep dark rules (16:1 against canvas) |
| Secondary ink | `--secondary-ink` / `--muted` | `#50545B` | Supporting text on light surfaces (5.5:1 against canvas) |
| Rule | `--rule` / `--border` | `#D4D5CE` | Structural separators and boundaries |
| Brand action | `--brand` / `--action` | `#FF5A2A` | Primary CTA, orange slabs; uses dark ink text (5.7:1) |
| Brand hover | `--brand-hover` | `#F04C1D` | Interactive action hover state |
| Winner stamp | `--winner` | `#D6FF45` | Lime outcome stamp; uses dark ink text (15.4:1) |
| Focus ring | `--focus` | `#304BFF` | 3px solid outline with 2px offset + separating white ring |
| Danger | `--danger-surface` / `--danger` | `#F9ECEB` / `#9D3232` | Non-blocking inline errors and warnings |
| Positive | `--positive-surface` / `--positive` | `#E2EBE4` / `#1B7C4E` | Verified receipts, advantages |

### Codeforces Match Colors

| Side | Surface | Ink | Chart Stroke | Role |
| --- | --- | --- | --- | --- |
| Player 1 (you) | `#304BFF` | `#FFFFFF` | `#304BFF` | Full cobalt panel and clean white text (6.3:1) |
| Player 2 (rival) | `#FF5A2A` | `#111214` | `#BE3815` | Full orange panel and deep dark ink (5.7:1); dark orange chart on canvas (5.5:1) |

### Future Platform Themes (Registry Tokens)

- **LeetCode (next):** Accent `#FFCA3A` / Ink `#111214`; Surfaces `#FFCA3A` / `#273442`; Charts `#946800` / `#273442`
- **GitHub (planned):** Accent `#91F5C2` / Ink `#111214`; Surfaces `#91F5C2` / `#273442`; Charts `#1B7C4E` / `#273442`
- **CodeChef (planned):** Accent `#ED714B` / Ink `#111214`; Surfaces `#ED714B` / `#F4CFA2`; Charts `#B03D1B` / `#85511A`

---

## 3. Typography: Hanken Grotesk

Single clean typeface across the entire application: **Hanken Grotesk**.

- **Hero Headline:** 80–96px desktop, 56px phone (390px), 48px small phone (320px); weight 800; tight line-height.
- **Scores & Numbers:** 88–112px desktop / 56–64px phone with tabular figures (`font-variant-numeric: tabular-nums`).
- **Section Headings:** 24–32px, weight 750/800.
- **The Roast:** 24–30px desktop, 20–24px phone, weight 700.
- **Body & Inputs:** 16px font size to prevent mobile iOS auto-zoom.
- **Buttons & Controls:** Minimum 44×44px tap targets.

---

## 4. Spacing & Layout Architecture

- **Max content width:** `1200px`.
- **Page gutters:**
  - Small mobile (320px): `12px`
  - Mobile (390px): `16px`
  - Tablet/Desktop (768px–1440px): `24–40px`
- **Desktop Landing Split:** ~55/45 hero split between headline/entry form and the large split-color ticket.
- **Mobile Result Scoreboard:** Stays `grid-cols-2` down to 320px with adjacent player panels and visible central VS. Opponents never stack vertically on phone.

---

## 5. Motion & Accessibility

- **Choreography:**
  - Headline settle (450ms, 12px upward).
  - Ticket / player panels opposing slide (500ms, 24px desktop / 12px phone).
  - Decorative score count (850ms) to saved score; semantic accessible score is immediately available.
  - VS slab wipe (380ms).
  - Winner stamp scale & rotate settle (450ms).
  - Paired receipt bars scale-X from center (650ms).
  - Radar stroke draw (900ms).
- **Reduced Motion & Pause:**
  - OS `prefers-reduced-motion` priority.
  - In-app visible "Pause motion" / "Resume motion" control.
  - Paused / reduced modes immediately render final scores, final bar lengths, visible text, and static tickets.
