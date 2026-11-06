# Architecture Decision Record 0001: Battle Data, Evidence Scope, and Storage Strategy

**Date:** 2026-10-25  
**Status:** Accepted  

## Context
TrashTalk 2.0 requires a public-facing, shareable developer battle arena where:
1. Visitors can compare profiles on Codeforces (and future platforms) with credible, truthful statistics.
2. Battle results must be permanently accessible via canonical URLs (`/battle/{id}`).
3. Crawler requests, social card previews (`@vercel/og`), and PNG exports must read frozen snapshots without triggering upstream API requests or AI commentary generation.
4. The system must operate reliably within zero-cost constraints ($0.00 infrastructure spend) and respect external API rate limits (e.g., Codeforces' 1 request / 2 seconds guideline).

## Decisions

### 1. Codeforces API Pacing and Evidence Scope
* **Rate Pacing:** Codeforces enforces a rule of no more than 1 request per 2 seconds. The application includes a token-bucket / request queue (`src/lib/platforms/http.ts`) coordinating requests.
* **Evidence Boundaries:**
  * Profile details: Fetched via `https://codeforces.com/api/user.info?handles=...`. Batched when both handles are queried.
  * Contest Rating History: Fetched via `https://codeforces.com/api/user.rating?handle=...`.
  * Submission & Solved History: Fetched via `https://codeforces.com/api/user.status?handle=...&from=1&count=1000`.
  * Deduplication: Submissions with verdict `OK` are deduplicated by stable platform-scoped key: `CF:${contestId}:${index}`. The earliest acceptance timestamp is retained.
  * Completeness: If a user has more submissions than the fetch window or if pagination is truncated, the evidence is marked as `coverage: "partial"`. Definitive exclusives and DNA similarity are withheld when history is incomplete.

### 2. Scoring Authority & AI Separation
* **Deterministic Verdict:** The battle winner, margin of victory, and specific reasons are computed strictly by pure, versioned functions in `src/lib/battle/scoring.ts`.
* **Zero AI Authority:** The AI engine is strictly a commentator. It receives the locked verdict and evidence summary, and writes persona-grounded commentary. The AI cannot choose, invert, or alter the winner.
* **Draws & Missing Data:** Draws are supported when scores are tied. Missing opponent profiles immediately yield an error; no synthetic opponents or minimum score floors are assigned.

### 3. Commentary & Model Selection
* **Zero-Cost Local Default:** When `GEMINI_API_KEY` is not configured, the engine defaults to a deterministic local template roaster for all four personas (Savage Senior Dev, Silicon Valley VC, Fight Announcer, Wholesome Hype-Man).
* **Model Configuration:** When enabled, the model defaults to `gemini-2.5-flash` or `gemini-2.5-flash-lite`. Gemini 1.5 Flash is deprecated and will not be used.
* **Safety & Bounded Output:** Generation requests are capped at 300 output tokens, enforce strict JSON schemas via runtime validation, and immediately fall back to local commentary on timeout (>8s), rate limit (429), or malformed output.

### 4. Storage Architecture (`BattleStore`)
* **Interface Contract:**
  ```typescript
  interface BattleStore {
    get(id: string): Promise<BattleSnapshot | null>;
    create(snapshot: BattleSnapshot): Promise<void>; // Create-only; rejects overwrite
    has(id: string): Promise<boolean>;
  }
  ```
* **Storage Implementations:**
  * **File / Durable Local Store (`FileBattleStore`):** Stores snapshots as immutable JSON files in a configured data directory (`.data/battles/`) using atomic create-only writes (`flag: 'wx'`) and path-containment checks. A bounded in-memory FIFO/LRU cache (capped at 200 items) accelerates repeated reads. Write failures fail explicitly rather than silently falling back to ephemeral process memory.
  * **Idempotency Store (`FileIdempotencyStore`):** Atomically reserves request digests in `.data/idempotency/`, returning cached snapshot IDs for identical replays and 409 Conflict for mismatched payloads under the same key.
  * **Future External Store:** If deployed to ephemeral serverless containers without persistent disk (e.g. standard Vercel), a durable external adapter (e.g. Upstash Redis or Vercel KV) will be provisioned. Until provisioned and verified, the application truthfully relies on durable local storage.
* **Canonical URL Policy:**
  * `POST /api/battles`: Explicit creation endpoint that generates and returns a new snapshot ID.
  * `GET /api/battles/{id}`: Read-only retrieval of the immutable snapshot. Never calls external APIs or AI.
  * Rematches create new snapshots. Query params (`/battle?u1=...&u2=...`) represent draft inputs, not permanent URLs.

## Consequences
* High reliability: The site never breaks if Gemini is down or exhausted.
* Honest evidence: No fake scores or cross-platform equivalence.
* Fast social cards: OG images render in milliseconds directly from the stored snapshot.
