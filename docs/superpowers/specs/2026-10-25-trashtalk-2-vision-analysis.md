# TrashTalk 2.0: project analysis and proposed product design

Date: 2026-10-25. Status: proposal for review; no application implementation authorized by this document.

The user's confirmed priority is **public launch and shareability**. The recommendation is a focused Codeforces launch that completes the battle → evidence → roast → share → challenge loop, followed by GitHub exhibitions and additional coding platforms. This release order is my recommendation, not a previously approved scope decision.

## 1. Assessment

The concept has a clear audience and a strong hook: competitive programmers and developers who already compare profiles, now given an entertaining result worth sending to a friend. Its distinguishing feature is the combination of a roast and specific evidence, especially the original solved-problem comparison. AI commentary alone is easy to copy and loses novelty; a personalized rivalry with a next challenge has a stronger reason for repeat use.

Proposed positioning: **“Settle the rivalry. Get roasted. Find your next challenge.”** Keep “Where developer profiles go to get roasted by AI” as the headline if preferred.

The current application is a useful prototype, not yet a production-grade arena. Keep the Next.js foundation and visual direction. Rework the data, scoring, and result lifecycle before expanding the UI. Do not rewrite the project from scratch.

## 2. What exists in this working tree

| Area | Observed implementation | Gap against the vision |
| --- | --- | --- |
| App foundation | Next.js App Router, React, strict TypeScript, Tailwind; production build succeeds | No automated tests, configured ESLint, or CI quality workflow found |
| Landing page | Headline, calls to action, featured matchups, evolution banner | No split-screen fight preview, health bars, or roast ticker |
| Battle page | Inputs, platform/persona selectors, result cards, SVG radar | Ignores incoming query parameters; preset buttons only fill inputs; results require manual submission |
| Platform data | GitHub REST user endpoint, Codeforces `user.info`, LeetCode GraphQL summary, CodeChef HTML regex | No solved-problem IDs/history, GitHub activity/languages/stars, or capability/completeness metadata |
| Aggregation | Fetches the same handle across all four platforms, or only the chosen platform | Cross-platform identities are assumed; choosing a coding platform does not also probe GitHub |
| Scoring | Handwritten numeric composites | Repositories/followers stand in for consistency; lifetime solves stand in for velocity; platform count stands in for stack breadth; missing metrics get nonzero floors |
| AI | Four prompt personas, Gemini invocation, JSON parse, static fallback | Retired model, no output schema validation/deadline; LLM chooses winner; fallback ignores persona style and makes unsupported claims |
| Result validity | Returns a battle if either player has any stats | One missing player can become a synthetic low-score opponent; ties favor player 1 |
| Sharing | Copy text and X compose window | No canonical battle URL in the shared text, persisted result, battle-specific metadata, OG image, or PNG download |
| Solo | Battles a profile against itself | Duplicate fetch work and inappropriate head-to-head verdict; should become its own workflow later |
| Evolution | Static comparison cards and illustrative code snippets | Several claims describe planned features as completed features |

Primary files: `src/app/api/battle/route.ts`, `src/lib/platforms/*`, `src/lib/ai/roast-engine.ts`, `src/types/index.ts`, `src/app/battle/page.tsx`, `src/components/RoastBox.tsx`, and `src/app/evolution/page.tsx`.

Baseline verification during this review:

- `npm run build`: passed, including compilation, type validation, and prerendering.
- `tsc --noEmit --incremental false`: completed without diagnostics.
- `npm run lint`: exits into interactive ESLint setup; there is no reproducible lint gate yet.
- No test files or test script found. A successful build does not establish provider correctness or end-to-end behavior.
- Installed versions observed: Next.js 15.5.28 and React 19.3.1. The manifest specifies ranges starting at earlier versions. Choose supported versions at implementation time; framework version is not a product requirement.
- Existing legacy-file moves are staged with unchanged content in Git's rename summary. This review did not edit `legacy/`, app source, dependencies, or existing working changes.

## 3. Approaches considered

| Approach | Benefit | Cost / tradeoff |
| --- | --- | --- |
| All platforms, all five pillars immediately | Broad launch claim | Several external-data uncertainties compound; difficult to ship reliable overlap and honest scores quickly |
| **Codeforces battle loop first — recommended** | Documented profile/submission/rating APIs support meaningful battles and the original differentiator | First public release has a narrower audience; GitHub/LeetCode/CodeChef follow |
| Solo GitHub roasts first | Easy input and broad developer appeal | Leaves the rivalry and solved-problem heritage behind; public user metadata alone says little about engineering quality |

Recommendation: release the Codeforces battle loop first. Add GitHub as a separate, explicitly different exhibition mode next, preserving “torvalds vs antirez” as a later showcase. LeetCode and CodeChef enter only after a capability spike demonstrates the required public data. Never fill missing functionality with invented data.

## 4. Changes I recommend to the vision

### 4.1 Evidence decides; the AI commentates

Use a deterministic, versioned scoring engine to compute the winner and reasons. AI receives those facts and writes the four persona variants without authority to change the result. Changing persona must not change who wins.

Allow draws and “insufficient data.” Score missing data as unavailable, not zero; never penalize an outage, a private activity history, or an absent optional profile. A GitHub bonus must not decide a Codeforces match. Do not equate followers, stars, public activity, or contest ratings with a person's overall engineering ability.

### 4.2 Replace silent identity merging with optional enrichment

A matching GitHub handle is a candidate account, not evidence of the same person. Background lookup may discover it, but ask the visitor to confirm before displaying it as linked; label the result **user-confirmed**, not ownership-verified. Allow a different GitHub handle or dismissal. Do not send an unconfirmed candidate's profile to the roaster.

Use the chosen coding platform as the primary identity. An unavailable GitHub bonus does not block a battle. Discovery happens only after the primary result and is low priority; it is not part of the launch critical path.

### 4.3 Make the radar truthful

The original five labels mix competitive programming and software activity, so they are not all observable for a single coding-platform handle. The chart should reflect the selected mode.

For launch, propose five Codeforces axes: **Algorithmic Grit** (difficulty depth), **Solve Volume**, **Contest Peak**, **Recent Velocity**, and **Topic Breadth**. Use public accepted submissions, problem ratings/tags, and rating history. Show the raw values, scoring explanation, data timestamp, and coverage beside the chart. If an axis is unavailable, show “N/A”; do not silently draw it as zero or interpolate a fully populated polygon. Provide an accessible numeric/list alternative.

The specific normalization curves and weights are a release decision within Milestone 2, to be checked against novice, inactive, unrated, specialist, and elite fixtures before any “fair scoring” claim. Save the exact scoring configuration/version in every battle. No direct comparison between Codeforces, CodeChef, and LeetCode rating numbers.

For the later GitHub exhibition, use observable repo/activity/language signals, clearly labeled by time window and sampling coverage. Git consistency requires activity data, velocity requires a time window, and breadth requires language/topic data. If those cannot be fetched reliably, simplify the view instead of relabeling repository count.

### 4.4 Preserve the trophy room, with exact semantics

Let A and B be distinct accepted problem IDs for the same platform and declared coverage.

- Common solved: `A ∩ B`.
- Player 1 exclusives: `A − B`; Player 2 exclusives: `B − A`.
- DNA similarity: `100 × |A ∩ B| / |A ∪ B|` (Jaccard), rounded for display. If both sets are empty, display N/A.
- “Not solved” does not mean “never attempted.” Use “They haven't solved this” unless complete attempt history supports a more specific statement.
- Keep IDs platform-scoped. For Codeforces contest problems, use platform + contest ID + problem index; handle problemset-only identities explicitly rather than inventing a contest ID.
- Deduplicate repeat accepted submissions; keep the earliest accepted timestamp within the fetched history.
- Sort flex lists by native problem rating descending, then stable ID; put unrated problems last. Preserve native ratings. Any Easy/Medium/Hard mapping must be documented and labeled platform-relative.
- Make filters, counts, links, and pagination work on mobile. UI pagination must not truncate the sets used for comparison.
- Incomplete history cannot prove exclusivity. Show observed common problems, but withhold definitive exclusive lists and DNA until both relevant histories are complete; explicitly label a bounded-window comparison if one is offered later.

Add **“Steal their next five challenges”**: a free, deterministic shortlist from the rival's exclusives near the player's demonstrated difficulty range. This improves utility without adding an AI call. It is optional for launch if it delays sharing.

### 4.5 Make the 3-second hook independent of upstream APIs

Serve a prepared, timestamped tourist-vs-petr battle on the landing page: two cards, health-bar-style meters, glowing VS, a short roast line, and “Play this battle.” A click opens a saved result immediately, with no typing and no fresh AI request. Freshness is visible; this is a real saved demonstration, not a claim of live data.

Fresh custom battles can take longer, especially with paginated history and provider throttling. Show progress honestly and deliver the profile/score result before optional deep overlap where possible. Support keyboard operation, reduced motion, and muted-by-default sound if sound is introduced. Use an original arcade identity rather than copied franchise assets.

Start the ticker with curated, labeled examples. “Live community roasts” requires a publish/selection process; generating a battle must not automatically publish its roast to the home page. Defer a live feed until it can be curated and removed.

### 4.6 Make sharing a product foundation

Create an immutable `BattleSnapshot` containing player identity references, normalized public metrics, data coverage/fetched times, verdict, scoring configuration/version, roast source/persona/prompt version, and creation timestamp. Store enough evidence to reproduce the displayed comparison, without storing arbitrary raw profiles or submission source code.

Use `/battle/{id}` for canonical saved results. `/battle?u1=...&u2=...&platform=...` remains a draft/challenge entry URL. Reading either URL must never start paid/optional generation implicitly; explicit battle creation does. Featured chips point directly to prepared snapshots and skip the draft form.

Page, OG preview, and downloadable card all consume the same snapshot. No profile refetching or AI invocation from crawler-facing metadata/image routes. A rematch creates a new snapshot; swapping screen positions cannot change the underlying winner. A persona remix reuses the same evidence/verdict and produces a new shareable variant.

Launch exports: **1200×630 OG**, **1080×1920 story PNG**, and **1080×1080 square PNG**. Use one layout system/theme and platform-safe local font assets. Server rendering avoids browser canvas taint; remote avatars are optional and fall back to initials. Constrain server image fetches to known provider hosts, response sizes, and deadlines. Include handles, platform, winner or draw, one punchline, timestamp, and canonical URL. Very long handles/text must remain readable.

## 5. External constraints verified

1. Gemini 1.5 Flash was shut down on September 29, 2025. The existing model string must change. Google recommends `@google/genai`; the project's older SDK is no longer the maintained choice. Select a currently available model through configuration, then verify it with the actual deployment project. [Release notes](https://ai.google.dev/gemini-api/docs/changelog), [SDK documentation](https://ai.google.dev/gemini-api/docs/libraries).
2. Gemini limits depend on model and project tier, cover RPM/TPM/RPD, and are not guaranteed. Do not build around 1,500 free queries/day. [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
3. Codeforces documents a maximum of one API call per two seconds. Its documented `user.status` and `user.rating` endpoints support submission and rating-history retrieval. Batch `user.info` where possible, cache history, and coordinate request pacing across server instances; raw `Promise.all` is not a provider-wide limiter. [API introduction](https://codeforces.com/apiHelp), [Methods](https://codeforces.com/apiHelp/methods).
4. GitHub unauthenticated REST requests are limited to 60/hour per originating IP. Optional GitHub discovery needs caching and a server credential strategy before broad use; do not assume every visitor has a separate allowance. [GitHub limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
5. Vercel Hobby has finite quotas and may pause features after exhaustion; it is restricted to personal, non-commercial use. A free deployment cannot honestly promise unlimited availability or “never fails.” [Hobby plan](https://vercel.com/docs/plans/hobby).
6. The current LeetCode query returns aggregate solve counts, not a complete solved set. CodeChef is parsed from HTML. This review did not establish stable, supported access to complete public solved histories for either; a working summary fetch would not establish overlap feasibility.

Proposed cost promise: **“Free to use. Optional AI, with a local commentary fallback.”** For an operator targeting zero spend, use a provider project without paid billing, do not enable automatic paid upgrades, bound usage, and switch off generation when free capacity is unavailable. An app quota is defense in depth, not a guarantee against provider billing settings. Offline commentary does not make fresh external profile data available during a provider outage.

## 6. Proposed architecture

Keep one Next.js application and a Node.js server runtime for orchestration. No standalone Flask service, microservices, live socket layer, or login requirement for launch.

Flow: validated battle request → primary platform adapter → normalized evidence and coverage → deterministic scorer/overlap → persona commentary → immutable snapshot → result page and exports.

Boundaries:

- **Adapters:** validated provider responses; explicit `ok`, `not_found`, `rate_limited`, `unavailable`, or `partial` results; deadlines and provider-aware scheduling.
- **Battle domain:** pure normalization, scoring, overlap, verdict, and challenge functions. Never depends on an LLM or React.
- **Commentary:** compact evidence claims plus locked verdict; structured validated output; four distinct local template sets; configurable provider/model; one bounded attempt before fallback. Do not send biographies, raw HTML, or unbounded raw JSON into prompts.
- **Storage:** `BattleStore`, `ProfileCache`, and `UsageGate` interfaces. Public sharing requires durable storage; process-local maps or browser storage are insufficient. Choose the actual storage service in Milestone 0 based on supported atomic operations, quota behavior, and operator preference. No deployment account has been assumed or provisioned.
- **Web:** client-side arena animation and filters; server-rendered snapshot metadata/images; status/error and coverage views.

Production storage must support immutable battle writes, idempotency records, bounded profile caches, and atomic usage/request-coordination operations across instances. It may be one service or a durable store plus a small coordination cache. If free capacity cannot satisfy this contract, reduce anonymous throughput and preserve prepared demos; do not promise the same scale for zero cost.

Use explicit `POST /api/battles` creation with an idempotency key; `GET /api/battles/{id}` reads a saved snapshot. A bounded pending result can be polled during creation when deep evidence needs background work; choose a deployable job mechanism in Milestone 0, or cap work and return an explicitly partial comparison. Pending work has its own creation/job ID; freeze a snapshot only when its declared evidence scope is settled. If a partial snapshot is shared and deeper evidence later becomes available, publish a new snapshot rather than mutating the shared result. Never assume a detached promise survives a serverless request.

Cache profile evidence separately from commentary. Cache keys include platform/normalized handle and evidence version; commentary keys include evidence digest, scoring version, persona, and prompt version. Player orientation is explicit in the response; avoid associating a player-1 roast with the wrong player after swapping.

## 7. Failure behavior and trust

- Missing primary player: show which handle is missing and allow correction; no winner against a fabricated opponent.
- Primary provider unavailable: offer a clearly dated cached snapshot when available; otherwise a retry/demo path, no invented stats.
- Optional profile unavailable: omit it without disrupting primary scores.
- Large/partial history: show coverage and progress; no definitive exclusives or DNA until supported.
- No key, exhausted allowance, invalid/refused AI output, or deadline: use a persona-specific local roast and label the source correctly.
- Tied scores: draw. Identical handles: explicit mirror-match handling, not accidental player-1 victory.
- All humor is grounded in supplied evidence. Do not invent code quality, employment gaps, cheating, inactivity, or private habits. Public profiles rarely substantiate those claims.
- Apply global and anonymous-client generation limits, input size validation, and idempotency. Crowded capacity returns a retry time or saved demo, not an unbounded provider queue.
- Public ticker/community publication is opt-in and curated. For shared snapshots, document public-link visibility and provide a removal/report route before opening anonymous publishing broadly.
- If an exported image or avatar fails, retain a readable text result and share URL.

## 8. Release scope and measurable outcomes

**Launch requirements:** Codeforces battles; all four personas including local fallback; honest five-axis comparison; complete-or-explicitly-unavailable trophy room and DNA; prepared one-click demo; saved links; OG + story/square PNG; mobile/accessibility pass; reproducible checks and deployment verification.

**Next:** GitHub exhibition and optional user-confirmed enrichment; solo workflow; LeetCode/CodeChef capability-gated support; challenge shortlist if not shipped initially; deeper evolution case study; curated community feed.

**Defer:** accounts, leaderboards, tournaments, public rankings of developer quality, automatic social publishing, monetization, and cross-platform universal scores.

Proposed engineering acceptance targets (not observed performance): prepared demo result visible within three seconds on a defined mobile test profile; snapshot reads and OG requests make zero AI calls; all four personas work with no AI key; no definitive overlap claims on incomplete data; share URL/page/OG/PNG agree on verdict and evidence version.

Track the funnel with privacy-conscious events: demo opened, custom battle submitted/completed, share copied, export downloaded, and rematch started. Copy/download is a sharing intent, not proof of an external post. Measure baseline conversion first, then set improvement targets; do not optimize for time spent watching loading animations.

The evolution page should show actual tradeoffs, measured caching/fallback behavior, test evidence, and unchanged legacy examples. Remove unsupported “Zod validated,” “TDD,” “zero cold starts,” “100% free forever,” and dynamic-OG claims until delivered. Keep the Apache-2.0 license attribution accurate; the current README incorrectly says MIT. Demonstrated decisions will make a stronger case study than “Senior Staff” labels alone.

## 9. Remaining decisions

The product priority is answered: public launch and shareability. The release order and mode-specific radar above are proposals for the user's review. The builder may choose component decomposition, animation details, scoring calibration within the documented review gate, and storage tooling based on verified deployment capabilities. Storage/account selection and evidence-fetch feasibility are Milestone 0 deliverables, not silently assumed infrastructure.

The implementation roadmap is in `docs/superpowers/plans/2026-10-25-trashtalk-2-roadmap.md`. It intentionally stops short of pretending unresolved provider/storage choices have exact implementation code.

A fresh builder review found no important gaps beyond the explicitly proposed release-scope decision: Codeforces first and a mode-specific radar remain recommendations for the user's review. Infrastructure and scoring details are deliberately assigned to their discovery/calibration milestones.
