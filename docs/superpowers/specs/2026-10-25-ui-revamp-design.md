# TrashTalk whole-UI revamp — proposed design

## Intent and user direction

The user wants a complete UI rethink because the current design feels like “AI slop,” with a preference for a lighter theme. They explicitly clarified that this is **not** a request to bring the legacy look back. Public launch and shareability remain the product priorities.

The recommendation is **Matchday**: a light sports-editorial interface built around real developer rivalries. This recommendation and its exact typography/colors have not yet been approved as the final visual design. It is a reviewable proposal, not an implementation change.

## What the source review shows

The legacy design uses a gray canvas, platform-logo selection, simple Compare/Look inputs, compact profile tables, direct red/green comparisons, and blue common-problem links. Its useful lesson is task clarity, not its floats, fixed footer, hover-only logos, or Bootstrap styling.

The current design layers dark/glass panels, cyan/pink/orange/purple accents, gradients, small monospace labels, badge-heavy navigation, repeated headings, generic technical selling points, and large vertical gaps. On results, long commentary precedes the radar and problem overlap; raw profile metrics are spread across separate player cards. This makes it harder to scan a comparison and gives unrelated sections similar visual weight.

## Alternatives considered

| Direction | Character | Tradeoff |
| --- | --- | --- |
| **Matchday — recommended** | Light editorial match report, condensed headline, precise aligned statistics | Requires strong typography/layout discipline; understated motion |
| Developer workbench | Monochrome utility, dense controls, muted blue/green | Efficient, but could feel like another internal tool |
| Rivalry zine | Oversized irregular type, bold colored blocks, stickers | Distinctive, but can overwhelm dense data and exported cards |

Matchday best combines a fresh identity, light-theme readability, rivalry, and shareable results. Keep the sport influence typographic; no copied franchise imagery or sports-betting interface.

## Product hierarchy

1. **Enter or open a match.** One primary form; a saved example nearby.
2. **Understand the result.** Names, outcome, score/metric explanation and data scope.
3. **Inspect the evidence.** Aligned metrics and a real problem explorer.
4. **Enjoy the commentary.** One short punchline close to the result, fuller persona text later.
5. **Share or rematch.** Reachable actions with a reliable preview and plain labels.

This differs from the current order of headline/technical claims → form → large commentary → separated cards → radar → problem grid.

## Page-by-page design

### Shared shell

Simple wordmark, **Compare**, **The story**, and a labeled source link. Remove “v2.0 AI,” the gradient emblem, and career-level badges. The footer is a restrained attribution/legacy/source line, not a large visual section. Light theme is the primary and only new theme in this pass; existing forced-dark classes and nested hardcoded dark surfaces must be removed systematically.

### Home `/`

A compact masthead with **ALL TALK? CHECK THE STATS.** beside the working compare form on wide screens, stacked on phones. One sentence explains Codeforces support. Two labeled handles, swap, Compare; persona choice is secondary and can open a small disclosure. A saved matchup is one click away, labeled **Saved example**, with timestamp/sample status.

Below the entry point, show one editorial match preview with two handles and a few clear metrics. This supplies a visible idea of the result without a carousel or ticker. Finish with a concise “Compare → Read the result → Share” explanation only if helpful. Remove architecture promotional panels; the story page owns that material. Aim to make the form and example affordance visible within the first 800px at a 1440px viewport and first 900px at 390px.

### Match entry `/battle`

Reuse the home form component, but with a quieter page heading and no duplicate marketing. Query parameters prefill it; fields remain visible on validation errors. Persona options expose their real label and a short tone description. Provider busy/loading states explain what is happening without falsely announcing individual fetch stages that the API does not expose. Retain per-attempt values and the existing endpoint contract; idempotency semantics belong to the separate correctness work.

### Saved result `/battle/[id]`

Top: short matchup title, date/platform/coverage line, compact outcome stamp, and **Share** / **New match** actions. Winner, draw, and insufficient-evidence layouts have explicit copy; never render an empty or null winner.

Next: two identity headers anchored to one compact three-column comparison. Show the key values on the same row; highlight an advantage with a label/delta in addition to color. Include current rating, peak, observed/total solves according to available scope, recent activity where supported, and supported composite scores. Existing snapshots that lack coverage may show their persisted aggregate as **Recorded score**, explicitly qualified by the compatibility policy below. “Why this result?” expands the scoring explanation. One short roast line sits under the scoreboard.

**Snapshot compatibility policy:** the UI does not recompute a verdict or silently turn a stored win into insufficient data. For existing snapshots without coverage, display the persisted outcome as **Recorded result**, the persisted aggregate as **Recorded score**, and a prominent **Coverage not recorded; this comparison cannot be independently verified** warning. If a snapshot explicitly carries partial coverage alongside a win, use the same recorded-result treatment with **Incomplete evidence; recorded outcome is not validated**. Do not apply an authoritative winner stamp or a “verified” label to those records. New snapshots marked insufficient by the backend get the dedicated insufficient state. All page/export views use this same policy; fixing the backend to withhold unsupported new verdicts remains separate work and a release dependency.

Then: the **Problem explorer**, elevated to a primary product feature. Underline tabs **Common**, **Only [handle]**, **Only [handle]**, with honest counts, search, native rating filter, and sort. Default sort uses native difficulty descending. Unknown exclusive data is an unavailable state with a reason, not an empty list pretending zero. Use a clean semantic table/list instead of a wall of decorated problem cards. Handle missing URLs safely while the schema bug is fixed.

Below: optional **Skills view** with the existing five-axis radar and numerical comparison. Keep it secondary because radar geometry is poor for exact comparisons. Label missing axes and preserve a readable alternative. Fuller persona commentary follows as a short editorial section, with tone controls only if they actually work. Do not add fake local re-generation behavior.

### Solo `/roast`

Reuse the form/shell/tokens. Current backend produces mirror matches, so do not invent a standalone solo-analysis experience in the design implementation. Label its present behavior honestly or make solo a secondary beta entry until the dedicated workflow exists. Keep this surface visually consistent without expanding its backend scope.

### Story `/evolution`

Rename the visible navigation to **The story**. Open with the 2020 project origin, real legacy imagery/source examples, and what changed. Use a restrained timeline and readable before/after code excerpts. Remove “2026 Senior Staff” self-grading and unsupported reliability claims. This is an engineering story backed by evidence, not homepage marketing scaffolding.

### Sharing and exported cards

One export dialog/popover with copy link, X share, and three labeled preview formats. Show exactly which outcome/text will export. Use the same paper/ink/player-color typography as the product, with distinct compositions for OG, story, and square. Include canonical URL, timestamp, and sample/coverage context. Avoid shipping compressed PNG text simply because a dimension test passes. No added auto-posting.

### Error/loading/empty surfaces

Specify all states in the design: idle, submitting, slow/busy, invalid handle, one missing player, upstream unavailable, partial evidence, insufficient evidence, draw, store failure, removed link, clipboard failure, and image failure. Skeletons reserve geometry; status changes use one meaningful live announcement; focus returns to a useful heading or linked error summary. Keep user inputs when work fails.

## Responsive and accessibility requirements

- Check 375/390/768/1024/1440px, 200% zoom, keyboard operation, and reduced motion.
- Both players' values remain adjacent on phones; do not force full separate player-card scrolling.
- Primary controls have at least 44px target height. Menus/dialogs expose state, support Escape and focus restoration, and never cover the active keyboard control.
- Body is 16px, UI generally 14px, metadata no smaller than 12px. Use contrast-safe ink/muted text and visible field boundaries.
- No viewport horizontal overflow. Individual dense data regions can have an accessible, labeled overflow strategy when truly necessary.
- Color never carries winner/player/availability meaning alone. Handle strings and tags work with long text and keyboard/touch disclosure.

## Scope, dependencies, and non-goals

Keep Next.js/React/Tailwind/Lucide and existing battle routes. Extract focused UI components and a presentation adapter; avoid a framework migration or large component-library install. Follow `design-system/trashtalk/MASTER.md` for the concrete token/type/motion system.

The UI can be designed and developed with explicit state fixtures independently of the backend closure work. Existing readiness findings—partial winners, dropped URLs, idempotency/rematches, durable deployment, and AI assertions—remain release blockers. The presentation adapter must expose unknown data honestly instead of hiding those failures. No new providers, leaderboard, authentication, billing, social feed, or automatic publishing is part of this UI revamp.

A fresh builder review identified the legacy-snapshot outcome ambiguity; the explicit compatibility policy above resolves it without giving the UI scoring authority. No other material implementation questions were identified beyond the planned visual checkpoint.

## Approval and implementation strategy

First produce one coherent desktop/mobile home-and-result design checkpoint. Approve visual direction and interaction hierarchy before applying it to every route. The user requested a plan in this turn; no application implementation is included. The implementation roadmap describes that checkpoint and subsequent work.
