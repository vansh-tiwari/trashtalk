# TrashTalk: cool social design, universal landing, Codeforces first

Date: 2026-10-26. Repository inspected at commit `79ce7cf`.

## 1. Approval and scope

The user approved the latest **cool social** mockups, then approved a shared visual identity with small platform-specific color and layout variations. They requested a detailed implementation handoff for their chosen coding executor, **Gemini 3.8 Flash High**. This is the user's executor label, not a requirement to change the application's commentary model or environment variables.

Build the universal landing page and the working Codeforces experience now. LeetCode is the next integration, not part of this implementation. GitHub and CodeChef are visible future destinations. Design the landing page to accommodate future platforms without rewriting its composition.

The user specifically rejected loud blue/orange color slabs, heavy condensed/all-caps fonts, long explanations, and separate ruling/roast sections. The result has **one short roast**, with outcome metadata inside that same section. No main-flow labels advertise AI, Gemini, model versions, local templates, or a judge.

### Source of visual truth

Use the repository-local packet in `docs/design/2026-10-26-cool-social/`:

- `trashtalk-four-screens.html`: self-contained interactive reference; open locally in a normal browser.
- `web-home.png`, `web-result.png`, `mobile-home.png`, `mobile-result.png`.
- `HankenGrotesk.woff2` and `FONT-LICENSE.txt`.

These references are portable. Do not depend on personal absolute paths, Downloads, `.codex/visualizations`, `.superpowers`, or a preview server during development or deployment.

**The universal platform selector and upcoming-platform states below are the intentional extension to the approved Codeforces-only landing mockup.** Preserve its visual composition, not its hardcoded provider scope.

### Precedence

1. This specification and the accompanying 2026-10-26 plan.
2. The approved cool social packet, subject to the accessibility corrections below.
3. Current backend contracts and tests, except narrowly identified UI integration fixes.

The 2026-10-25 Matchday design system, loud share-card PNGs, earlier PDF designs, and previous UI plans are historical. They do not override this design. The executor must replace the active `design-system/trashtalk/MASTER.md` during implementation and mark the earlier direction superseded.

## 2. What ships

- A provider-neutral homepage: shared hero, platform selection, an honest availability state for all four providers, and a real Codeforces demo.
- A working Codeforces entry form at `/` and `/battle`, retaining prefill, persona choice, validation, swap, pending/error recovery, and canonical result navigation.
- A redesigned `/battle/[id]` result: scoreboard, exactly one short roast, raw comparison bars, five-axis radar, problem explorer, sharing.
- Matching PNG exports: OG 1200×630, square 1080×1080, story 1080×1920.
- Consistent shared navigation/footer, solo mirror entry, story page, loading/error/not-found states.
- Meaningful automated behavior checks and desktop/mobile visual evidence.

### Non-goals

Do not implement LeetCode battle scoring, new provider fetching, cross-platform battles, authentication, leaderboards, public feeds, global reactions, notification signup, billing, or deployment. Do not migrate frameworks, replace the existing battle service, rewrite scoring, or change storage/idempotency architecture. Do not modify `legacy/`.

Existing broad provider profile adapters are not working battle integrations. Do not wire the old `src/lib/platforms/aggregator.ts` or `src/types/index.ts` scoring model into this experience. The active Codeforces contract lives in `src/lib/platforms/contracts.ts`, `src/lib/battle/types.ts`, and `src/lib/storage/contracts.ts`.

## 3. Visual system

### Base tokens

| Role | Value |
| --- | --- |
| Canvas | `#F8F9F5` |
| Surface | `#FFFFFF` |
| Primary ink | `#282C34` |
| Secondary readable text | `#626A73` |
| Decorative line | `#E1E3DC` |
| Input/control boundary | `#858D96` |
| Neutral brand action | `#5961A5` |
| Brand hover | `#444B8A` |
| Focus ring | `#5961A5`, 3px with 3px offset |
| Codeforces player-one surface / ink | `#E7E8F5` / `#444D79` |
| Codeforces player-two surface / ink | `#E2EBE4` / `#42634D` |
| Chart strokes | `#737AB5` / `#668C76` |
| Chart fills | The corresponding stroke at 15–22% opacity |
| Error surface / ink | `#F9ECEB` / `#9D3232` |

Decorative pale bars do not carry essential meaning alone. Player names and exact values remain visible. Check composed colors; token values are design decisions, not a claim that every arbitrary combination is accessible.

### Type and density

- **Hanken Grotesk** throughout; no Barlow Condensed, Arial Black, Impact, all-caps display headings, or default monospace UI.
- Locally hosted licensed font assets. Use a stable system sans fallback.
- Desktop hero 72–82px, weight 750/700, line-height 1.0–1.04, negative tracking approximately -0.045em.
- Phone hero 52–62px, with intentional wrapping and no clipped words.
- Section headings 22–28px, weight 650/600. Roast 26–32px desktop and 24–26px phone, weight 650/600.
- Body and inputs 16px. Supporting controls/table text 14px. Essential metadata minimum 12px. The mockup's 8–11px labels and very pale text are **not** implementation requirements; enlarge/darken them.
- Tabular numbers for scores and comparisons. Scores 76–84px desktop / 60–64px phone.
- Max content width 1120px. Page gutters 20px at 390px, 24px at tablet, 40–48px at desktop. At 320px use 16px gutters and reduce headline size if necessary.
- Rounded controls 10px; grouped surfaces 14–17px; avoid nesting every text block in a card.
- Section gaps 28–40px; no giant empty mobile gaps or text-heavy marketing stacks.

### Motion and personality

The hero may include the approved static tilted demo ticket, subtle orbit lines, small asterisk, and “friendship pending” sticker. Clip decorative art locally so it never creates viewport overflow. Give decorative SVGs `aria-hidden`.

Only 120–180ms color/opacity/transform feedback. No perpetual marquee, pulsing status, fake typing, score-count loops, continuous confetti, or animation that hides information. Honor reduced motion. Emoji reactions are content, not replacements for navigation icons.

## 4. Platform model and landing behavior

Use one data-only, server/client-safe platform registry. Reuse the existing `Platform` union from `src/lib/platforms/contracts.ts`; do not create another incompatible provider union. Use a typed ordered list, not hardcoded duplicated arrays in forms and cards.

| ID | Visible label | Status now | Accent and side surfaces | Future result emphasis |
| --- | --- | --- | --- | --- |
| `codeforces` | Codeforces | `live` | `#5961A5`; `#E7E8F5`, `#E2EBE4` | Rating, peak, solves, overlap, five axes |
| `leetcode` | LeetCode | `next` | `#8D6B34`; `#F1E9D6`, `#E7EBEF` | Easy/medium/hard, activity, common problems |
| `github` | GitHub | `planned` | `#426E5D`; `#DFEDE5`, `#E7E9EC` | Repositories, contributions, languages |
| `codechef` | CodeChef | `planned` | `#925F4E`; `#EEE7DA`, `#F0E1DC` | Rating, stars, contest history |

Future palettes are prepared as tokens and availability previews only. No fabricated scores, charts, fetched profiles, or forms implying those providers already work. No promise of release dates.

### Homepage hierarchy and exact copy

1. Shared nav: lowercase `trashtalk.`, `how it works`, `the lore`, `pick a rival`.
2. Eyebrow: `friendly rivalry. questionable friendships.`
3. Hero: `all talk?` / `bring receipts.`
4. Support: `Two handles. One roast. Group chat material.`
5. Provider selector, order: Codeforces, LeetCode, GitHub, CodeChef. Status labels: `live`, `up next`, `coming later`.
6. Selected provider entry or availability preview.
7. Real saved Codeforces demo, clearly labeled `Codeforces demo` and `sample data`.
8. Compact process: `drop two handles` → `let the stats talk` → `send it to them`.
9. A small universal platform overview/availability row. It can grow by mapping registry entries; never assume exactly four CSS columns.
10. Restrained footer: `started in 2020. still talking.`

For selected Codeforces: show two labeled inputs, swap, tone selector, `settle it`, and `tourist vs Petr` demo link. The sample ticket uses real prepared sample values, not live API calls.

For selected LeetCode: keep the same region geometry, switch the preview accents, show `LeetCode is up next.` with `difficulty breakdown · solving activity · shared problems`, and a real `try Codeforces` action. Do not mount an enabled battle form or invent a LeetCode demo.

For selected GitHub/CodeChef: equivalent `coming later` state with the intended emphasis from the table. These preview buttons are selectable and keyboard-operable, not disabled controls with hover-only explanations. Selection does not submit or call any API.

The hero and core value propositions must not claim the entire product is Codeforces-only. Provider-specific labels live inside the selected form, demo, or availability preview. “Problem overlap” applies to relevant coding platforms, not to GitHub repositories.

The landing hero remains the neutral brand theme. Platform accents belong to its selected provider island. On battle routes, a provider-scoped wrapper applies platform tokens. Never infer provider from the URL ID prefix or a display label.

## 5. Entry flow and backend boundary

`/battle` accepts existing `u1`, `u2`, `persona`, and optional `platform` query parameters. Missing/invalid platform falls back to Codeforces. A known unavailable platform shows its explicit availability preview instead of silently running a Codeforces battle. Invalid persona falls back to `savage_dev`; reuse the Zod enum.

POST contract remains `POST /api/battles`, returning `{ id, snapshot }`. Add an optional backward-compatible request field constrained to `platform: 'codeforces'` with that default. A submitted `leetcode`, `github`, or `codechef` must return 400 before storage reservation or fetching. This prevents the universal UI from accidentally treating a future provider as Codeforces. Keep existing ID grammar, handle validation, response status behavior, and idempotency semantics.

Inputs keep values on errors. A 429 is a terminal response to that request, not an endlessly pending state. Show `Codeforces is busy. Try again shortly.` and allow a deliberate retry after a bounded `Retry-After` cooldown. Pending requests disable duplicate submission; retries/new rematches use the existing per-attempt key behavior. Do not solve server idempotency defects in this design pass.

Do not advertise internal queue stages, request pacing, immutable snapshots, or model versions in status copy. `checking the receipts…` is sufficient while submitting. Focus the first invalid field or an error summary. A success response without an ID must become a recoverable error, not a stuck spinner.

## 6. Codeforces result composition

Order:

1. Compact breadcrumb, share action, platform/date/sample context.
2. Adjacent player surfaces: resilient avatar, exact handle case, rank, rating, normalized recorded score.
3. **One** roast surface: outcome metadata + tone label + one short roast + small local reactions/copy/rematch controls.
4. `the receipts.` raw comparison bars alongside `skill check.` radar on desktop; stacked on phones.
5. `same problems?` overlap summary and problem explorer.
6. `group chat’s waiting.` share action.

There is no separate verdict essay, ruling banner, three commentary paragraphs, per-player roast cards, or second punchline block. A tiny outcome label inside the roast is not a second section. Scoring explanation may live in a concise disclosure beside the numbers, not as another roast.

### One short roast, shared everywhere

The displayed roast is at most **24 whitespace-separated words and 160 Unicode code points**. No arbitrary CSS line-clamp silently hides its ending. Do not regenerate commentary when opening an existing snapshot or changing a share format.

Use the stored `commentary.punchline` for a supported win if it is short and valid, removing only a matching known outcome prefix for the actual persisted winner. If it is too long, empty, or incompatible with the outcome, use a short deterministic fallback. Do not concatenate or display `headToHeadRoast`, `player1Roast`, or `player2Roast`.

Required outcome-aware fallbacks:

| Condition | Outcome metadata | Fallback roast |
| --- | --- | --- |
| Supported win | `@{winner} takes it · +{margin}` | `@{loser}, the scoreboard would like a word.` |
| Draw | `draw · 0 points apart` | `Same score. Twice the ego.` |
| Mirror | `mirror match` | `Your toughest rival? Still you.` |
| Insufficient | `not enough data` | `Not enough receipts. No victory lap.` |
| Partial/unknown recorded win | `recorded result: @{winner}` | `Big claims. Limited receipts.` |

Do not strip arbitrary text with a loose username regex. Codeforces handles can contain dots and hyphens. Do not invent a winner, render `@null`, or make live/verified claims for the sample or incomplete evidence.

One pure copy builder supplies the page, clipboard text, social intent, and PNG renderer. Backend provenance fields remain stored; the product does not label roast text as AI-generated, Gemini-generated, or local. Do not alter the runtime model name because of the coding executor's name.

### Data truthfulness

Reuse `toBattleViewModel` as the outcome/compatibility authority. Preserve its existing recorded-result policy and tests. The current persisted schema lacks original coverage records; this project must not infer new lifetime completeness from a scoring-version string or recompute old outcomes.

`overlap.isDefinitive === false` means exclusive sets/counts/DNA cannot be presented as exact. Show common observed problems if available; exclusive tabs show `unavailable`, not 0. A concise visible note such as `partial history` or `coverage unavailable` remains necessary even in a short-copy design. An optional disclosure may contain the existing longer explanation. Never hide every warning behind a tooltip.

Scores come from `verdict.player1Score`/`player2Score` consistently, not a mix of duplicate player fields. Scoring stays unchanged. Raw comparison labels map as follows:

- `rating` → current rating; `maxRating` → peak rating.
- `solvedCount` → unique solves when supported; observed solves when partial/unknown.
- `recentAcceptedCount` → recent accepts, with `last 180 days` available as supporting text. It is not a streak or unique recent solves.
- `distinctTagsCount` → topics. Fifth optional compact raw row if layout permits.
- Axes: `algorithmicGrit`, `contestPeak`, `solveVolume`, `recentVelocity`, `topicBreadth`. No Git consistency, stack breadth, or fabricated commit activity for Codeforces.

Use exact values with paired normalized bars; the same scale applies to both sides per row. Unknown values are unavailable, not zero. Radar has a player legend and readable numeric alternative; missing axes are unavailable rather than plotted as real zero.

## 7. Problem explorer

Retain search by name/ID/tag, native rating filter, sort, reset, and pagination. The mockup hid some controls to show visual structure; do not remove working features. A compact `filters` disclosure is acceptable on phones.

Tabs: `both`, `only {p1}`, `only {p2}` with accurate counts or unavailable states. Arrow keys/Home/End navigate tabs; active panel is named by the active tab. Switching sets or filters resets pagination. Long names wrap. External statement links must be real and safe; missing links become readable unavailable text, never a JavaScript URL or fabricated destination.

An exact DNA segmented bar is only shown with definitive overlap and a positive total union. Use sample sizes from the **same observed set**, not profile lifetime solves. Zero overlap with a nonzero union is 0%; unknown/empty-union data is unavailable, not a division-by-zero graphic. Keep the common count and percentage aligned with the stored snapshot rather than recomputing its verdict.

## 8. Sharing and export

Use one share dialog launched by `share this` and `send it`. Controls: copy canonical link, native device share when supported, existing X intent as a secondary option, and format-specific PNG downloads. User action launches sharing; there is no automatic posting.

The dialog previews the **real `/api/og` PNG for the selected format**, not a separately hardcoded HTML card. Page, preview, export, and intent use the same short roast/outcome builder and platform tokens. Downloading a PNG must not accidentally produce the prototype's SVG.

All formats: local Hanken font, calm surfaces, adjacent handles/scores, small vs, one short roast, outcome metadata, actual canonical URL, and sample/coverage context when needed. Avoid a huge marketing headline that crowds out the actual matchup. Preserve complete handles; adapt type/wrapping for 24-character handles. Do not use CSS unsupported by the server image renderer.

- OG: 1200×630, approximately 48px outer safe inset.
- Square: 1080×1080, approximately 56px inset.
- Story: 1080×1920, keep important content out of the top 140px and bottom 220px; both players remain adjacent. Do not stretch the OG layout.
- Match date is frozen `createdAt`, not download time. Sample remains sample. Incomplete data has no authoritative winner crown.
- Use configured deployment origin / request origin for canonical links; never ship a personal localhost URL or invent a production domain.
- Images must render without fetching profile avatars, fonts, or providers. Use deterministic initials inside the export.

Retain `/api/og?id=...&format=og|square|story&download=true`, PNG content type, cache behavior, and attachment headers. Keep font work Node/server-only. WOFF2 browser fonts are not assumed compatible with `next/og`; provide static TTF/WOFF faces in the deployed bundle and verify all three formats offline.

## 9. Other routes and states

- `/roast`: shared theme/form, explicitly `mirror match` until a real solo workflow exists. Do not advertise individual analysis the backend does not provide. No extra full commentary sections.
- `/evolution`: keep readable engineering history in the new shell; no “Senior Staff” self-grading, fake reliability claims, or homepage-sized essays. Source files remain untouched.
- Missing result: useful 404 with `start a match`. Invalid handle, provider busy, fetch/storage failures, copy/share cancellation, and image failures have distinct recoverable states.
- Copy success appears only after promise resolution. Native-share cancellation is quiet. Dialog supports Escape, trapped focus, a visible close control, scroll containment, and focus restoration.
- Reactions are optional local UI toggles with `aria-pressed`; no invented public totals, backend storage, or analytics requirement.

## 10. Verification and acceptance

- Run baseline and final `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; report baseline failures separately. Install locked dependencies with `npm ci` when necessary.
- Add focused behavioral tests for unavailable providers, form retry/reset, outcome/short-roast consistency, incomplete overlap, and sharing. Do not write tests that only assert Tailwind class names.
- Use existing Node/Vitest tests for pure helpers/server rendering. For real browser behavior, add Playwright development tooling and a small mocked-network suite; do not pretend `renderToStaticMarkup` proves click/focus behavior.
- Inspect `/`, `/battle`, saved demo, mirror entry, story, not-found, all three image exports at 390/768/1440px. Add a 320px smoke check and 200% zoom.
- Zero viewport horizontal overflow. Full handle visibility. Keyboard/tab/dialog checks. Reduced-motion check. Controls ≥44×44px; 4.5:1 normal text contrast; accessible chart alternative.
- Save fresh screenshots under `docs/review-evidence/2026-10-26-cool-social/`. Compare them to the approved packet; do not approve from dimensions-only PNG tests.
- Landing represents all four platforms honestly, with only Codeforces calling battle creation. LeetCode is visibly next. One result roast, no source/model marketing, no duplicate ruling.

The next milestone can extend a registry entry and add a provider-specific pipeline without redesigning the universal homepage. This phase must not falsely generalize the Codeforces scoring or persistence contract to pretend that milestone is already implemented.
