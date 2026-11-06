# GitHub Platform Integration Design Specification

> **Status:** Approved Proposal (Option 1: Open-Source Impact & Stack DNA)  
> **Date:** 2026-11-06  
> **Authors:** Antigravity & User  
> **Target Release:** TrashTalk 2.1.0  

---

## 1. Intent & Mission

TrashTalk was originally engineered around competitive programming profiles (Codeforces, LeetCode, CodeChef). While effective for contest coders, this excludes the overwhelming majority of software engineers who do not compete in algorithms contests but live daily on **GitHub**.

The mission of this integration is to **democratize TrashTalk for every developer** by turning GitHub profiles into high-stakes fight-night battlegrounds. Two developers enter their GitHub usernames to face off on open-source impact, shipping cadence, repository depth, and tech stack DNA, culminating in a deterministic 5-axis verdict and a brutal developer-to-developer roast.

---

## 2. Goals, Non-Goals, & Anti-Goals

### 2.1. Goals
1. **Zero-Friction Ingestion:** Support any public GitHub handle with zero authentication required ($0.00 spend), with transparent fallback to `GITHUB_TOKEN` environment variable for elevated rate limits.
2. **Deterministic 5-Axis Scoring:** Evaluate GitHub profiles using a transparent, mathematical 0–100 formula capturing real developer output:
   - **Star Gravity (30%)**
   - **Shipping Cadence (25%)**
   - **Repository Depth (20%)**
   - **Community Footprint (15%)**
   - **Tech Stack Breadth (10%)**
3. **Repository Trophy Mapping:** Map public repositories to `SolvedProblem` so the existing Trophy Explorer, Problem Table, and Difficulty Filters automatically showcase open-source projects ranked by stars without breaking existing data contracts.
4. **Tech Stack DNA Overlap:** Compute Jaccard similarity across the primary programming languages used by both players (e.g., *"Both ship TypeScript and Rust; Player 1 exclusively codes in Go, Player 2 in C++"*).
5. **Brutalist GitHub Roaster:** Add Gemini AI prompts and offline deterministic brutalist fallback templates specialized for GitHub tropes (abandoned side projects, star graveyards, bot-inflated commit streaks, README-only forks).
6. **Legendary Offline Demo:** Ship a legendary offline matchup (e.g. `torvalds` vs `antirez` or `gaearon` vs `yyx990803`) for instant 1-click exploration.

### 2.2. Non-Goals
1. **Private Repository Scraping:** We do not request OAuth permissions to read private code, commits, or proprietary employer work. Only public evidence is used.
2. **LOC (Lines of Code) Counting:** Raw line counts incentivize bloated dependencies and boilerplate; stars and shipping velocity are much better indicators of developer traction.
3. **Fragile Web Scraping:** Avoid scraping `github.com` HTML/SVG directly; use official GitHub REST API endpoints with robust rate-limiting and in-memory caching.

### 2.3. Anti-Goals
1. **Vanity Metric Bias:** Do not award 100 points for commit streaks sustained solely by GitHub Actions bot updates or automated cron jobs.
2. **Fork Star Stealing:** Do not count stars on forked repositories towards a player's Star Gravity score (only original repositories authored by the user earn star points).

---

## 3. Constraints

- **Local-First & Offline Resilience:** Automated test suites must run completely hermetically offline without making live unmocked calls to `api.github.com`.
- **API Rate Limits:** GitHub unauthenticated REST API allows 60 requests/hour per IP. The adapter must enforce a strict rate-pacer (`githubThrottler`), an in-memory evidence cache (1 hour TTL), and support `process.env.GITHUB_TOKEN` when present (5,000 req/hr).
- **Snapshot Immutability:** Generated GitHub battles persist as write-once canonical JSON files in `.data/battles/gh-<u1>-vs-<u2>-<id>.json`.
- **Responsive Guarantee:** The GitHub battle view and project explorer must render without horizontal overflow on mobile viewports ($\ge 320\text{px}$).

---

## 4. Architectural Approaches Considered

### Option 1: Open-Source Impact & Stack DNA *(Chosen)*
- **Data Source:** Official GitHub REST API (`/users/{username}`, `/users/{username}/repos?sort=pushed`, `/users/{username}/events/public`).
- **Scoring:** Star Gravity (30%), Shipping Cadence (25%), Repo Depth (20%), Community Footprint (15%), Tech Stack Breadth (10%).
- **Pros:** Measures real shipping output and public adoption; cleanly reuses existing 5-axis radar charts, activity heatmaps, trophy room, and share cards; robust and unauthenticated.
- **Cons:** Public events API provides up to 90 days / 300 events of history.

### Option 2: HTML/SVG Heatmap Scraper *(Discarded)*
- **Data Source:** Scraping `github.com/users/{username}/contributions`.
- **Why Discarded:** Fragile against GitHub frontend markup changes; commit streaks often measure automated bots or trivial edits rather than software engineering capability.

### Option 3: GraphQL Deep Dive *(Discarded)*
- **Data Source:** GitHub GraphQL API v4.
- **Why Discarded:** Mandatory Personal Access Token (PAT) required for every query, violating the zero-friction, zero-setup public experience.

---

## 5. Detailed Engineering Specification

### 5.1. Data Ingestion & Adapter (`src/lib/platforms/github.ts`)
- **Endpoints Queried:**
  1. `GET https://api.github.com/users/{username}` $\rightarrow$ Profile metadata, public repos, followers, gists, created date.
  2. `GET https://api.github.com/users/{username}/repos?sort=pushed&per_page=100` $\rightarrow$ Original vs. forked repos, star counts, fork counts, primary languages.
  3. `GET https://api.github.com/users/{username}/events/public?per_page=100` $\rightarrow$ Recent push and commit cadence over recent weeks.
- **Contract:** Implements `fetchGithubEvidence(username: string, context?: FetchContext): Promise<GithubEvidence>`.
- **Trophy Conversion:** Maps original public repositories to `SolvedProblem[]`:
  - `id`: `GH:${repo.name}`
  - `name`: `${repo.name}`
  - `rating`: `repo.stargazers_count`
  - `difficulty`: `> 1000 stars ? "Hard" : > 50 stars ? "Medium" : "Easy"`
  - `tags`: `[repo.language, repo.fork ? "fork" : "original"]`
  - `url`: `repo.html_url`

### 5.2. Deterministic 5-Axis Scoring Engine (`src/lib/battle/github-scoring.ts`)

$$\text{Composite} = 0.30 \times \text{Stars} + 0.25 \times \text{Cadence} + 0.20 \times \text{Repos} + 0.15 \times \text{Community} + 0.10 \times \text{Breadth}$$

1. **Star Gravity ($S$, 30%):**
   $$S = \min\left(100, \sqrt{\text{totalOriginalStars}} \times 4.5\right) \quad (\approx 500\text{ stars} = 100\text{ pts})$$
2. **Shipping Cadence ($C$, 25%):**
   $$C = \min\left(100, \frac{\text{recentEventCount}}{60} \times 100\right) \quad (60\text{+ recent public events} = 100\text{ pts})$$
3. **Repository Depth ($R$, 20%):**
   $$R = \min\left(100, \frac{\text{originalNonEmptyRepos}}{25} \times 100\right) \quad (25\text{ original repos} = 100\text{ pts})$$
4. **Community Footprint ($F$, 15%):**
   $$F = \min\left(100, \frac{\text{followers}}{150} \times 100\right) \quad (150\text{ followers} = 100\text{ pts})$$
5. **Tech Stack Breadth ($B$, 10%):**
   $$B = \min\left(100, \frac{\text{distinctLanguagesCount}}{7} \times 100\right) \quad (7\text{+ distinct languages} = 100\text{ pts})$$

### 5.3. Tech Stack Overlap & DNA (`src/lib/battle/github-overlap.ts`)
- Computes language overlap:
  - Intersection: Languages both developers ship.
  - Exclusive: Languages unique to Player 1 or Player 2.
  - Jaccard Similarity index: $\frac{|L_1 \cap L_2|}{|L_1 \cup L_2|} \times 100\%$.
- Highlights Top Project Matchup: Player 1's #1 starred repo vs. Player 2's #1 starred repo.

### 5.4. GitHub AI & Local Roaster (`src/lib/ai/github-roaster.ts`)
- **Personas:** Savage Dev, VC Energy, Fight Night, Hype Friend.
- **Target Tropes:**
  - 0-star graveyards with 40 abandoned projects.
  - Pinned repos that are forks of tutorial projects.
  - High follower count but zero commits in 6 months.
  - Single-language dogmatism (e.g. writing everything in Python).
- **Contradiction Guard:** Guarantees that the winner established by the 5-axis composite score is always hailed as the victor.

### 5.5. Demo Matchup & UI Integration
- **Legendary Prepared Battle:** `torvalds` vs `antirez` (Linus Torvalds vs Salvatore Sanfilippo) in `src/lib/demo/prepared-battles.ts`.
- **Platform Registry:** Update `src/lib/platforms/registry.ts` setting `github.status = "live"` and availability label to `"live"`.
- **Input Bar Quick Shortcuts:** Add GitHub shortcuts to `CompareForm.tsx`:
  - `torvalds vs antirez` (Linux vs Redis)
  - `gaearon vs yyx990803` (React vs Vue)

---

## 6. Verification & Test Plan

1. **Unit Tests:**
   - `tests/unit/platforms/github.test.ts`: Test evidence fetching, error handling, 404s, and repository-to-trophy conversion.
   - `tests/unit/battle/github-scoring.test.ts`: Verify 5-axis calculations, capping, and edge cases (0 stars, inactive profile).
   - `tests/unit/battle/github-overlap.test.ts`: Verify language DNA calculation and project comparison.
   - `tests/unit/ai/github-roaster.test.ts`: Verify contradiction guards and brutalist templates.
2. **Integration Tests:**
   - `tests/integration/github-battle.test.ts`: Full flow from mock evidence to stored snapshot and presentation view-model.
   - `tests/integration/card-rendering.test.tsx`: Render OG, Square, and Story cards for GitHub battles.
3. **Build & Quality Gates:**
   - `npm run typecheck` $\rightarrow$ 0 errors.
   - `npm test` $\rightarrow$ 100% green across all suites.
   - `npm run build` $\rightarrow$ Successful static and SSR page compilation.
