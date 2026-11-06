# Gemini implementation review — 2026-10-25

Scope: current modern source in the working tree, against the TrashTalk 2.0 vision and roadmap. User priority remains public launch and shareability. Review only; no application source was edited. The modern implementation is untracked, so findings refer to current files rather than a committed diff.

## Assessment

The implementation makes substantial progress: Codeforces orchestration, deterministic scores, overlap functions, four local personas, explicit POST creation, canonical result pages, a prepared demo, and an OG/card route now exist. It is an improved prototype, but does not yet complete the roadmap or meet the stated public-launch requirements.

The next step is a focused launch-readiness pass on the existing Codeforces loop. Additional platforms, richer solo mode, community feeds, and more animation should wait until data and sharing are dependable.

## Verified checks and limits

- `npm test`: 5 files, 24 tests passed. A second review run with `GEMINI_API_KEY=` also passed. No live AI/provider call was needed.
- Production build of an isolated source copy at `/private/tmp/trashtalk-review-a1tu85ck`: passed, including Next.js type checks and prerendering.
- Initial build in the workspace failed with `Invariant: no direct app page entry found for /api/battles/[id]`. A dev server was simultaneously running from the workspace on port 3000. The isolated build passed; do not report the initial failure as a confirmed source defect. Avoid sharing `.next` between dev and build processes.
- `npm run lint </dev/null`: still presents ESLint setup instead of a configured lint run. Its exit status is not evidence of lint success.
- Isolated production preview on port 3107: saved demo HTML/API returned 200, unknown snapshot API ID returned 404, and the desktop saved-battle page rendered. Both demo avatars were broken in the inspected view.
- Real HTTP request `/api/battles/..%2F..%2Fpackage` on the isolated preview returned HTTP 200 with the project package JSON. Only non-sensitive project metadata was used for this check.
- Real HTTP request `/api/og?id=cf-tourist-vs-petr-legendary` failed to complete an image response. The server logged Satori's error: `Expected <div> to have explicit "display: flex" or "display: none" if it has more than one child node.` It also attempted a dynamic font download for the star glyph, which failed with HTTP 400.
- Backend edge cases below were reproduced with mocked fetch/model responses. Live Codeforces correctness, deployment durability, live Gemini quality, mobile layouts, and social-network crawler behavior were not established by this review.

## Findings, ordered by priority

### R1 — P1: public snapshot IDs permit filesystem traversal

`src/lib/storage/battle-store.ts:40–52` constructs `path.join(dirPath, id + '.json')` with an unchecked ID. `src/app/api/battles/[id]/route.ts:8–14` forwards decoded IDs directly. Verified through the production HTTP route: an encoded `../../package` returns the repository package JSON as a battle.

Fix at the shared domain/storage boundary as well as HTTP validation: an explicit safe ID grammar, path containment for the local adapter, and runtime snapshot validation. Every consumer, including saved HTML and the image endpoint, must use the same validated lookup. Unknown JSON files must never be accepted as battle snapshots.

### R2 — P1: successful creation can lose its saved result

`src/lib/storage/battle-store.ts:61–72` puts snapshots in memory before writing and swallows filesystem errors. Line 83 always selects the file adapter. Saving under an unwritable location resolves successfully, while a fresh store cannot retrieve the result. A serverless/read-only deployment can acknowledge a share URL that other instances or restarts cannot resolve.

The ADR names an external KV adapter, but no such implementation exists. The cache is also an unbounded Map, not the documented LRU. `save` can overwrite an existing ID, and the service uses a millisecond timestamp for identity (`src/lib/battle/service.ts:65–67`).

Use deployment-supported durable storage with create-only semantics; report success only after persistence. Use collision-resistant IDs and idempotent creation. Keep a file adapter explicitly for supported local/persistent-disk deployments; failure to persist must fail the creation.

### R3 — P1: submission failures become complete empty histories

`src/lib/platforms/codeforces.ts:163–179` initializes completeness to true. HTTP errors, provider `FAILED`, and JSON parse failures can bypass both the success branch and the exception handler, leaving complete coverage and zero solves.

Mocked `user.status` HTTP 429 produced `status:'ok'`, `isComplete:true`, and no solved problems. The downstream overlap then produced definitive DNA/exclusives and the scoring engine penalized the player. Completeness must start unavailable and be established only by validated, successful history retrieval. Separate profile status from history availability; never convert a failed fetch into an empty lifetime history.

### R4 — P1: partial history changes the winner and leaks false exclusives

The adapter fetches only the latest 1,000 submissions. `src/lib/battle/scoring.ts:7–34` ignores coverage and treats their distinct solves/tags/timestamps as complete evidence. This biases total solves, topic coverage, and new-solve velocity; a repeat solve can also look new when its earlier acceptance is outside the sample.

`src/lib/battle/overlap.ts:68–73` withholds DNA but still returns exclusive arrays for partial histories. The UI presents them as flexes with a disclaimer (`src/components/ProblemOverlapArena.tsx:86–114`). Absence from a sample does not establish an unsolved problem.

`src/lib/storage/contracts.ts:13–22` drops fetched time and evidence coverage from the frozen result. Restore coverage/provenance, support unavailable axes, and establish a comparable evidence scope. Until required scope is established, withhold the aggregate verdict and definitive exclusives. Preserve observed common problems.

### R5 — P1: OG previews and PNG exports fail during image rendering

`src/app/api/og/route.tsx` builds successfully but fails when the image body is rendered in the isolated production preview. The score badge containers around lines 111–124 and 164–177 have multiple child nodes without an explicit supported display style. Use renderer-compatible layouts and local font assets; test actual image bytes, not merely constructing an ImageResponse or building Next.js.

The story/square code only changes dimensions, and the download button supplies no format choice. A complete export deliverable needs all three layouts visually inspected and reachable from the UI.

### R6 — P1: anonymous creation has no bounded admission or shared pacing

`src/app/api/battles/route.ts:5–23` accepts every request without a request schema, usage gate, or idempotency. Handles are coerced to strings and personas are cast without validation. Each creation invokes six Codeforces calls and optional AI generation.

`src/lib/platforms/http.ts:11–27,33–35` coordinates only one process and has an unbounded queue. Queue waiting is outside the per-fetch timeout; multiple instances have independent queues. No profile cache or generation cache is implemented.

Add validated inputs, shared request admission/provider coordination, bounded total deadlines, cache reuse, and idempotency before broad anonymous access. Return explicit busy/429/retry behavior. These are missing launch controls, not a claim of an observed traffic incident.

### R7 — P2: generated prose can contradict the locked verdict

`src/lib/ai/roast-engine.ts:80–90` assigns the deterministic winner field itself, but validates commentary only as strings. Mocked valid output declaring Petr the victor was accepted with `source:'ai'` while the structured winner remained tourist.

Make the authoritative result and victory line deterministic, constrain generated sections to grounded banter, and reject/fallback on explicit contradictory result claims. Do not describe schema validation as proof of factual accuracy. The current AI tests exercise local behavior only; add mocked provider failure/refusal/malformed/contradictory output coverage.

### R8 — P2: social cards silently crown player 1 on draws

`src/app/api/og/route.tsx:26–29` uses `snapshot?.verdict.winnerHandle || p1.handle`. Draws therefore receive a winning player-1 border. Missing IDs produce fabricated player1/player2 metrics rather than an unavailable response. Read explicit outcome branches and never invent a fallback result.

### R9 — P2: prepared demo contradicts its own evidence and score version

`src/lib/demo/prepared-battles.ts:94–97` declares 68% DNA for 5 common problems over an 8-problem union; the documented rounded Jaccard value is 63%. Its scores also conflict with scoring version 1.0.0: for example, 42 recent solves give 28 velocity in the implementation, not the seeded 85. Both players use the same avatar URL. No captured evidence/provenance accompanies the snapshot, despite “verified” UI copy.

Build real prepared demos from captured normalized public evidence using the actual domain functions, or label the result clearly as fictional/sample data. Reuse this fixture in invariant tests.

### R10 — P2: Algorithmic Grit duplicates Contest Peak

`src/lib/battle/scoring.ts:29–47` derives both axes from the same max rating, assigning peak rating an effective 55% weight. This does not implement the proposed difficulty-depth axis; strong unrated solvers get zero grit. Derive grit from demonstrated rated problem difficulty, calibrate the mapping, and persist the new scoring version/reference time.

## Secondary gaps to address within the same launch pass

- The AI SDK is still `@google/generative-ai`, with default `gemini-2.5-flash`. Migrate to the maintained SDK and verify a model available to the deployment project. Current free-tier access was not tested here.
- The AI timeout uses Promise.race without aborting the provider call or clearing the timer, so returning a fallback does not stop the outstanding request.
- Snapshot metadata uses relative image URLs with no configured metadataBase; the local preview warns and resolves them to localhost. Verify the public canonical origin explicitly on deployment.
- Copy actions report success before awaiting clipboard permission/write. Add failure handling.
- No mobile browser tests, Playwright suite, CI workflow, numerical radar alternative, or reduced-motion CSS were found. Validate the result/action-row layout at narrow widths; this review did not establish a mobile rendering defect.
- Solo is still a mirror battle. Keep it explicitly labeled or defer it; a dedicated solo workflow is not part of the immediate correctness fix.
- README still says MIT while LICENSE is Apache-2.0; ADR/evolution claim runtime provider schemas, durable KV readiness, and stronger reliability guarantees than the code delivers.

## Recommended next step

Execute the launch-readiness plan at `docs/superpowers/plans/2026-10-25-trashtalk-launch-readiness.md`. First close the traversal and persistence issues, then evidence correctness and provider admission, then exports and release verification. Preserve the existing visual direction and domain decomposition. Do not expand to GitHub/LeetCode/CodeChef until this loop passes the acceptance checks.
