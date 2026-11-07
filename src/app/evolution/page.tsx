import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { GitBranch, ExternalLink, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "2020 vs 2026 Architectural Evolution & Lore",
  description:
    "How TrashTalk evolved from a fragile 2020 student Flask app to an immutable Next.js 15 production system with rate-pacing and deterministic scoring.",
  openGraph: {
    title: "2020 vs 2026 Architectural Evolution & Lore · TrashTalk",
    description: "From a college hackathon project to an immutable 5-axis algorithmic arena.",
  },
};

export default function EvolutionPage() {
  const comparisons = [
    {
      category: "Architecture & Framework",
      legacy: {
        title: "Monolithic Flask 1.1 + Jinja2 (2020)",
        details:
          "Single-threaded WSGI server with synchronous route handlers blocking on external HTTP requests.",
        code: `# 2020: legacy/app.py
@app.route('/codechef/', methods=['POST', 'GET'])
def codechef():
    user1 = request.args.get('user1')
    user2 = request.args.get('user2')
    (image1, ccInfo1, ...) = cc.getInfo(user1)
    (image2, ccInfo2, ...) = cc.getInfo(user2)
    return render_template('codechef.html', ...)`,
      },
      modern: {
        title: "Next.js 15 App Router + Immutable Snapshots (2026)",
        details:
          "Parallel non-blocking fetch with rate-pacing, deterministic scoring, and canonical permanent snapshots (/battle/[id]).",
        code: `// 2026: src/lib/battle/service.ts
const snapshot = await executeBattleFlow({
  u1: cleanU1,
  u2: cleanU2,
  persona,
  store: defaultBattleStore
});
// Stored as immutable snapshot for permanent sharing`,
      },
    },
    {
      category: "Data Extraction & Stability",
      legacy: {
        title: "DOM Index Scraping (2020)",
        details:
          "Hardcoded HTML tree index traversal (e.g., contents[4].contents[3].contents[1]...). Vulnerable to minor markup changes.",
        code: `# 2020: legacy/codechef.py
prbTag = infoTag.contents[4].contents[3].contents[1]
solved = prbTag.find_all('h5')
star_bgcolor = infoTag.contents[4].aside.contents[1]`,
      },
      modern: {
        title: "Verified Codeforces API with Rate-Pacing (2026)",
        details:
          "Runtime schema validation, 1-call/2s rate-pacing coordinator, and stable deduplicated problem IDs (CF:contestId:index).",
        code: `// 2026: src/lib/platforms/codeforces.ts
const statusRes = await codeforcesThrottler.schedule(() =>
  fetchWithTimeout(statusUrl, {}, timeoutMs)
);
// Deduplicate accepted submissions by CF:contestId:index`,
      },
    },
    {
      category: "Comparison Engine & Tone",
      legacy: {
        title: "Static CSS Color Comparison (2020)",
        details:
          "Comparing two numbers and applying red / green CSS classes. No commentary generated.",
        code: `<!-- 2020: legacy/templates/codechef.html -->
if (curRate1 > curRate2) {
  document.getElementById("curRate1").classList.add("table-success");
  document.getElementById("curRate2").classList.add("table-danger");
}`,
      },
      modern: {
        title: "Deterministic Scoring + Persona Commentary (2026)",
        details:
          "A mathematical scoring engine locks the verdict. The commentary engine provides concise persona roasts without altering the winner.",
        code: `// 2026: src/lib/ai/roast-engine.ts
const verdict = scoreCodeforcesBattle(e1, e2);
const commentary = await generateCommentary({
  p1Evidence, p2Evidence, verdict, persona
});
// Locked winner, zero hallucinated verdicts`,
      },
    },
    {
      category: "Hosting & Sharing",
      legacy: {
        title: "Ephemeral Free Dyno",
        details:
          "Required gunicorn process, slept after 30 minutes of inactivity.",
        code: `# 2020: legacy/Procfile
web: gunicorn app:app`,
      },
      modern: {
        title: "Local-First Architecture + Dynamic OG PNG Cards (2026)",
        details:
          "Defaults to high-performance local commentary with $0 required external spend. Renders offline-safe PNG share cards in all formats.",
        code: `// 2026: src/app/api/og/route.tsx
// Generates 1200x630, 1080x1080, or 1080x1920 PNG preview
// directly from snapshot without calling external APIs
return renderBattleCard(snapshot, format);`,
      },
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-6 max-w-container mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-rule">
        <div className="inline-flex items-center gap-2 text-xs text-muted font-medium">
          <GitBranch className="w-3.5 h-3.5 text-cf-brand" aria-hidden="true" />
          <span>engineering evolution</span>
        </div>

        <h1 className="font-sans font-semibold text-2xl sm:text-4xl text-ink tracking-tight">
          2020 origin vs. 2026 architecture
        </h1>

        <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl">
          How TrashTalk evolved from a student experiment into a structured developer comparison tool with deterministic scoring, verified evidence, and unit/integration test suites.
        </p>
      </div>

      {/* Untouched Legacy Preservation Banner */}
      <div className="p-4 sm:p-5 rounded-surface bg-surface border border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-sans font-semibold text-sm text-ink">
            the 2020 student codebase is preserved untouched
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Every original script, parser, and template remains in the{" "}
            <code className="text-ink bg-canvas px-1.5 py-0.5 rounded font-mono text-xs border border-rule">
              legacy/
            </code>{" "}
            directory as a tribute to continuous learning.
          </p>
        </div>
        <a
          href="https://github.com/vansh-tiwari/trashtalk/tree/master/legacy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg bg-canvas border border-rule hover:bg-canvas/80 text-xs font-semibold text-ink min-h-[44px] transition-colors"
        >
          <span>view legacy/ on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
        </a>
      </div>

      {/* Comparison List */}
      <div className="space-y-6">
        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className="rounded-surface border border-rule bg-surface overflow-hidden"
          >
            <div className="px-5 py-3 bg-canvas border-b border-rule flex items-center justify-between">
              <span className="font-sans font-semibold text-xs text-ink">
                {item.category.toLowerCase()}
              </span>
              <span className="text-xs text-muted font-tabular font-mono">
                0{idx + 1}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-rule">
              {/* 2020 Origin */}
              <div className="p-5 space-y-2.5 bg-canvas/30">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-canvas text-muted border border-rule">
                    2020 origin
                  </span>
                  <h3 className="text-xs font-semibold text-ink">{item.legacy.title}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {item.legacy.details}
                </p>
                <div className="rounded-lg bg-surface p-3 font-mono text-[11px] text-ink overflow-x-auto border border-rule">
                  <pre>{item.legacy.code}</pre>
                </div>
              </div>

              {/* 2026 Architecture */}
              <div className="p-5 space-y-2.5 bg-surface">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cf-brand/10 text-cf-brand border border-cf-brand/20">
                    2026 architecture
                  </span>
                  <h3 className="text-xs font-semibold text-ink">{item.modern.title}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {item.modern.details}
                </p>
                <div className="rounded-lg bg-canvas p-3 font-mono text-[11px] text-ink overflow-x-auto border border-rule">
                  <pre>{item.modern.code}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center py-6 border-t border-rule">
        <Link
          href="/battle/cf-tourist-vs-petr-legendary"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cf-brand hover:bg-cf-brand-hover text-white font-semibold text-xs transition-colors min-h-[44px]"
        >
          <span>open saved demo: @tourist vs @Petr</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
