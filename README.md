# TrashTalk 2.0 🥊🔥
### The AI-Powered Developer Battle Arena & Profile Roaster

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue?style=for-the-badge)](LICENSE)

> *"Settle the rivalry. Get roasted. Find your next challenge."*

---

## 🚀 The Story: 2020 Student vs. 2026 Senior Architecture

**TrashTalk** was originally born in 2020 as a college student project. Back then, it was a simple Python Flask app that compared competitive programming ratings with green and red CSS table cells.

Six years later, it has been re-architected to showcase the evolution from a **student experiment** into a **production-grade, shareable developer battle arena built with senior engineering principles**.

> [!NOTE]
> **Preserved Heritage:** The original 2020 student codebase is preserved untouched in the [`legacy/`](file:///Users/rtiwar36/Documents/PP/trashtalk/legacy/) directory.

| Dimension | 2020 Student Era | 2026 Senior Staff Era |
| :--- | :--- | :--- |
| **Framework** | Monolithic Flask 1.1 + Jinja2 | Next.js 15 App Router + TypeScript Strict |
| **Data Engine** | Fragile DOM index scraping (`contents[4]...`) | Validated Codeforces API + 1-call/2s rate-pacing + bounded admission |
| **Scoring** | Raw rating number comparison | Pure deterministic 5-axis scoring engine (v2.0.0) |
| **Roasting** | CSS table cell color toggling (`table-success`) | Local-First Persona Engine + Optional Gemini with contradiction guards |
| **URLs & Sharing** | Ephemeral GET queries | Canonical immutable snapshots (`/battle/[id]`) + Multi-format card exports |
| **Storage** | None (ephemeral) | Durable create-only storage (`flag: 'wx'`) + atomic idempotency |
| **Testing** | Zero automated tests | Comprehensive Vitest suite (28 test files, 158 tests) + Playwright |
| **Context & Architecture** | None | Exhaustive [`AGENTS.md`](AGENTS.md) guide for developers & AI coding assistants |

---

## ✨ Features

- **🥊 Codeforces 1v1 Battle Arena:** Enter two Codeforces handles to trigger a head-to-head statistical showdown. (Active launch platform; LeetCode, GitHub, and CodeChef are planned for future milestones).
- **⚡ 3-Second Hook & Instant Demos:** Pre-seeded with legendary matchups (e.g., `cf-tourist-vs-petr-legendary`) that open in milliseconds without external API requests.
- **🏆 Problem Overlap Arena ($P_1 \cap P_2$):** Interactive 3-way trophy room displaying:
  - *Common Solved:* Clickable problem pills linking directly to problem statements, color-coded by difficulty.
  - *Player 1 Flex:* Hardest problems Player 1 has solved that Player 2 hasn't touched (withheld when history coverage is incomplete).
  - *Player 2 Flex:* Hardest problems Player 2 holds over Player 1 (withheld when history coverage is incomplete).
  - *Algorithmic DNA:* Jaccard similarity index measuring verified problem-solving overlap.
- **🎙️ 4 Distinct Commentary Personas:**
  - 🌶️ *Savage Senior Dev* (Zero mercy on code habits or contest chokes)
  - 👔 *Silicon Valley VC* (TAM, moats, and CAC evaluations)
  - 🥊 *Fight Announcer* (High-energy Octagon ring announcer)
  - 🎧 *Wholesome Hype-Man* (Playful banter with positive vibes)
- **📊 5-Axis Algorithmic Radar (v2.0.0):** Truthful metrics measuring *Algorithmic Grit (difficulty depth), Contest Peak, Solve Volume, Recent Velocity, and Topic Breadth*. Unavailable metrics are displayed explicitly.
- **🛡️ Local-First Operation with Optional AI:**
  - Operates 100% locally with deterministic persona commentary when no API key is provided ($0.00 required spend).
  - Optional Gemini commentary (configured for modern models like `gemini-2.5-flash` or `gemini-3.5-flash-lite`).
  - Strict contradiction guards prevent generated commentary from hallucinating an alternate winner.
- **🔗 Canonical URLs & Multi-Format Card Exports:**
  - Every battle is persisted as an immutable snapshot at `/battle/{id}`.
  - Generates dynamic cards directly from the frozen snapshot:
    - OpenGraph 1200×630 (Twitter/X, Discord, LinkedIn)
    - Story 1080×1920 (Instagram, TikTok)
    - Square 1080×1080 (Feed posts)
  - Includes format download choices and one-click shareable link copy with async clipboard handling.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([Visitor]) -->|Browser| WebUI[Next.js 15 App Router]
    
    subgraph Battle Creation [POST /api/battles]
        WebUI --> Service[Battle Orchestration Service]
        Service --> CF[Codeforces Adapter: user.info + user.status + user.rating]
        CF --> Scorer[Pure Deterministic Scorer: 5-Axis Score & Locked Verdict]
        CF --> Overlap[Problem Overlap Engine: Set Intersection & Exclusives]
        Scorer --> Commentary{Commentary Engine}
        Commentary -->|No Key / Fallback| Local[Local-First Template Roaster]
        Commentary -->|Key Provided| Gemini[Optional Gemini 2.5 Flash]
        Local --> Snapshot[(Immutable BattleSnapshot)]
        Gemini --> Snapshot
        Snapshot --> Store[Durable BattleStore]
    end

    subgraph Canonical Sharing [/battle/{id}]
        Store --> CanonicalView[Read-Only Frozen Snapshot]
        CanonicalView --> OG[/api/og: Dynamic Social Card Generator]
        CanonicalView --> WebUI
    end
```

---

## 🤖 AI Agents & Developer Context (`AGENTS.md`)

For AI coding agents (Antigravity, Claude Code, Cursor, Copilot) and human contributors needing deep technical documentation, refer to **[`AGENTS.md`](AGENTS.md)**. It provides an exhaustive map of:
- **Every File & Exported Function:** Signatures, parameter types, and responsibilities across `src/lib/`, `src/app/`, and `src/components/`.
- **5-Axis Scoring Math:** Algorithmic Grit (30%), Contest Peak (25%), Solve Volume (20%), Velocity (15%), Breadth (10%).
- **Social Card Pipeline:** Satori + Resvg SVG-to-PNG export engine across 3 formats.
- **Design Tokens & Rules:** Editorial brutalist tokens, responsive constraints, and non-negotiable agent invariants.

---

## 🛠️ Local Development & Testing

### Prerequisites
- Node.js 18+ (tested on Node 24)
- npm

### Setup
```bash
# Clone the repository
git clone https://github.com/vansh-tiwari/trashtalk.git
cd trashtalk

# Install dependencies
npm install

# Run the test suite (Vitest noninteractive)
npm test

# Run Next.js production build verification
npm run build

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Battle Arena.

---

## 📜 Credits & License

- Original 2020 Concept & Code: [Raghuvansh Mani Tiwari](https://github.com/vansh-tiwari)
- Preserved 2020 Source: [`legacy/`](file:///Users/rtiwar36/Documents/PP/trashtalk/legacy/)
- 2026 Revamp: Built with Next.js 15, TypeScript, Tailwind CSS, and Superpowers TDD.
- License: [Apache-2.0](LICENSE)
