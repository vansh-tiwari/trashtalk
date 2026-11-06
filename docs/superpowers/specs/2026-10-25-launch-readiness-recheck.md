# Launch readiness recheck — 2026-10-25

## Conclusion

Gemini fixed several concrete defects, but the claim that all six launch-readiness tasks are complete is not supported by the current implementation. Keep the existing Codeforces scope. The next work is a targeted closure pass with realistic persistence, partial-data, rematch, and visual regression checks.

This review changed documentation only. Application source, existing tests, and `legacy/` were not edited. Independent reproduction tests ran in a copied workspace under `/private/tmp/trashtalk-review2-n0ye8p3_`.

## Verification performed

- `GEMINI_API_KEY= npm test`: **48 tests passed across 11 files**.
- `npm run typecheck`: **passed**.
- `npm run lint`: exited successfully but explicitly ran TypeScript instead of ESLint because ESLint is absent. This is not a completed lint check.
- Isolated `npm run build`: **exit 0**, compiled/typechecked and generated routes; it also reported `ESLint must be installed in order to run during builds`.
- Independent regression probes: **7 failures across 10 checks**, demonstrating URL stripping (both direct parse and store reload), partial-history winner, dotted-handle persistence, contradictory AI prose, missing insufficient-data image state, and `@null` in local commentary. The remaining three checks verified real PNG signatures and exact OG/story/square dimensions.
- Visually inspected actual OG, story, and square exports. OG and square are readable for the prepared demo. **Story is broken:** both player cards collapse vertically and their handle/rating/score text overlaps.
- A second reviewer reproduced non-atomic/fail-open idempotency across processes, permanent same-input replay, absent distributed pacing, and ineffective deadlines using local files/mocks only.
- No live Codeforces behavior, real-key Gemini quality, external database, deployed cross-instance durability, mobile browser flow, or social crawler preview was established. Some existing tests attempt the SDK with a dummy key rather than injecting the constructed mock; passing those tests does not verify the advertised contradictory-output behavior.

## Confirmed improvements

- Snapshot IDs reject traversal, local reads enforce path containment, and stored JSON has a runtime schema.
- Snapshot writes use create-only filesystem writes and fail explicitly on disk errors; cached results are cloned and bounded.
- Submission HTTP/API failures are distinguished from complete empty histories.
- Incomplete histories now suppress definitive exclusive lists and DNA.
- Algorithmic Grit now uses rated-problem difficulty rather than exactly duplicating Contest Peak.
- OG/card image bytes render, all three formats exist, draw borders no longer favor player 1, and missing image IDs do not fabricate results.
- Download choices, awaited clipboard handling, reduced-motion CSS, typecheck script, and a CI workflow were added.
- README license attribution was corrected to Apache-2.0.

## Remaining findings

### R1 — P1: partial histories still determine winners

`src/lib/battle/scoring.ts:97–104` rejects unavailable history but not `historyAvailability:'partial'` or `isComplete:false`. The adapter still fetches only one page of up to 1,000 submissions. A partial profile versus a complete profile returns `outcome:'win'` in the independent regression. Required evidence remains incomparable, and repeat solves may be counted as new inside the truncated history.

The frozen snapshot contract/service also still omit per-player coverage and fetched times. The result cannot explain the scope behind its scores. Implement complete/bounded evidence scope explicitly; withhold the aggregate verdict when required coverage is incomplete and preserve available raw metrics instead of dummy zero scores.

### R2 — P1: idempotency reservations are neither atomic nor fail-closed

`src/lib/storage/battle-store.ts:224–261` checks existence then uses an ordinary write, and returns `reserved` even after I/O errors. Two synchronized processes both reserved the same key. An unwritable directory also returned `reserved` without creating a record. Completion failures are swallowed around line 282.

Use atomic reservation with ownership/lease semantics and explicit errors. Distinguish snapshot write success from idempotency completion failure and support recoverable retries. A check-then-write method tested only sequentially is not an atomic contract.

### R3 — P1: public generation still lacks shared admission controls

`src/app/api/battles/route.ts` admits every distinct request; there are no client/global usage limits. `src/lib/platforms/http.ts:66` has a process-local queue and the cache is process-local. Two scheduler instances can start simultaneous Codeforces calls. Queue errors become raw 500s, not typed busy responses. Gemini has no global generation allowance.

Choose explicit deployment-wide coordination or an enforced single-instance deployment with corresponding capacity limits. Count queue wait, pacing sleep, fetch/body, and AI work toward an overall deadline. The current scheduler checks expiry only before spacing sleep, while `fetchWithTimeout` stops its timeout after headers, before body parsing.

### R4 — P2: snapshot schemas strip solved-problem links

`src/lib/battle/validation.ts:125–133` omits `url` and `platform`. Zod strips both; `safeParseBattleSnapshot` then casts the incomplete result back to `BattleSnapshot`. Both memory and file creation save the stripped object. A subsequent read has `overlap.common[0].url === undefined`, breaking `ProblemOverlapArena` links. The seeded demo bypasses this create/validate path, hiding the regression in demo-only checks.

Make runtime schemas match domain contracts; preserve all required fields and remove the unsafe assertion masking schema/type divergence. Add create → reload → click-link coverage on a fresh battle, not only the prepared demo.

### R5 — P2: valid dotted handles cannot be persisted

`HandleSchema` accepts `john.doe`; `src/lib/battle/service.ts:66–67` embeds the handle into the ID, while `BattleIdSchema` rejects dots. The complete flow fails after provider/commentary work. Use `cf-` plus a full opaque UUID as planned, with handles stored as data rather than ID syntax.

### R6 — P2: rematches permanently replay the first snapshot

`src/app/api/battles/route.ts:35–36` substitutes a permanent global body digest for a missing idempotency key. None of the home/battle/solo forms sends a key. Every later same-input request returns the old snapshot, including the Rematch flow; evidence cannot refresh even after its cache expires.

Generate a new client key for each intentional battle/rematch and preserve it only for retries of that attempt. Keep content caching separate from request idempotency; define legacy missing-key behavior without treating unrelated future submissions as retries.

### R7 — P2: story export has overlapping player text

`src/lib/share/card-renderer.tsx:132–137,198–203` applies `flex:1` to player cards inside the story's auto-sized column layout. The actual 1080×1920 output collapses both cards, overlapping handle, rating, and score text. PNG size/dimensions alone do not test layout.

Use an explicit story composition with adequate fixed/minimum card sizes and non-collapsing children. Inspect demo, long handles, maximum punchline, and each outcome. Include visual checks rather than only byte-count assertions. The exports also lack the planned timestamp and canonical battle URL.

### R8 — P2: insufficient-data presentation still announces a winner

The card renderer branches only on draw (`src/lib/share/card-renderer.tsx:37–39`), so an insufficient-data result renders `WINNER: @undefined`. The local roaster treats it as a win and returns `Winner: @null`; the saved HTML page similarly renders `@null Wins`.

Handle `win`, `draw`, and `insufficient_data` exhaustively in one shared presentation boundary. This state becomes more common once R1 correctly suppresses unsupported verdicts.

### R9 — P2: AI contradiction guard and its test give false confidence

An actual injected SDK mock returning “Victory belongs to Petr!” and “Petr defeats tourist” was accepted as AI commentary while tourist remained the locked winner. The guard recognizes only a few phrases and prepends the correct winner to contradictory prose.

`tests/integration/admission.test.ts` constructs `mockModel` but never injects it; the dummy-key call can simply fail and exercise fallback. The refusal/429 test only exercises the no-key path. Inject the provider dependency, assert the mock was called, forbid network in tests, and cover real error/contradiction cases. Make authoritative outcome text deterministic and generated banter independent of winner declarations; do not promise arbitrary natural-language factuality through substring checks.

The SDK is still `@google/generative-ai`, the default model is unchanged, and clearing a timeout timer does not abort an outstanding generation request. Those parts of Task 4 remain unfinished.

### R10 — P2: lint and CI claims exceed the checks implemented

`scripts/lint.mjs:12–15` substitutes `tsc --noEmit` for missing ESLint, so CI currently runs typecheck twice and calls one run lint. Add actual pinned lint dependencies/configuration, make lint fail if unavailable, and propagate child-process failures. CI has no browser journeys or visual regression step. A production build's successful exit also does not prove ESLint ran.

### Deployment blocker: Vercel durability is still future work

`src/lib/storage/battle-store.ts:321–322` always chooses instance-local files. This is a meaningful improvement for a single process on persistent disk. It does not establish durable public sharing on standard Vercel/serverless. The ADR correctly labels an external store as future work, which contradicts “all six tasks fully satisfied” for that deployment target. Confirm hosting and implement/test its actual persistence/coordination contract before publishing.

### Still unresolved: demo provenance and schema coverage

Only the demo's DNA, avatar, and version label changed. Its manually specified 97/90 scores still disagree with the version-2 functions and metrics (for example, 42 recent solves map to 28 velocity, not 85). There is no captured evidence or sample label. The new test checks literal values, not score recomputation. Provider response validation is still TypeScript assertions rather than Zod response schemas. Complete these before claiming verified evidence.

## Next steps in execution order

1. **Close reproducible product regressions:** preserve problem URLs; use opaque IDs; implement exhaustive outcome presentation; reject partial-evidence verdicts; retain coverage in snapshots; fix the story composition. These need no external account and should be implemented immediately as the next coding task.
2. **Fix retry/rematch semantics:** per-attempt client keys, atomic fail-closed reservation, leases, completed replay, and explicit error handling. Verify with genuinely independent processes and conflicting/retried requests.
3. **Choose and verify the deployment contract:** for Vercel, add durable shared storage/coordinator; otherwise require a documented persistent single-instance host. Implement real global/client admission, provider pacing, and total deadlines. Test a created result across the intended independent instances/restarts.
4. **Make AI and quality gates honest:** inject/mock SDK calls, migrate maintained SDK, abort deadlines, constrain commentary, install actual ESLint, rebuild the demo from evidence or label it as a sample, and add fresh-battle/browser/visual tests to CI.
5. **Run the release gate on preview:** traversal rejection, fresh saved problem links, distinct intentional rematch IDs, safe identical-attempt retries, incomplete evidence, all three outcomes and export formats, mobile layouts, and crawler metadata. Only then expand platforms.

Acceptance must be based on these user-visible behaviors and deployment evidence, not the number of tests or a repeated completion summary.
