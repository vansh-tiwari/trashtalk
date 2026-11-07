import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, EyeOff, Database, Bot, Trash2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Transparency",
  description:
    "TrashTalk is local-first, cookie-free, and queries 100% public APIs. Learn how developer stats are processed and how to unlist snapshots.",
  openGraph: {
    title: "Privacy Policy & Data Transparency · TrashTalk",
    description: "No tracking cookies, no secret analytics, 100% public receipts only.",
  },
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: EyeOff,
      title: "100% Public APIs Only",
      summary: "Zero private access tokens. Zero password requests.",
      description:
        "TrashTalk exclusively queries public endpoints provided by Codeforces, LeetCode, CodeChef, and GitHub. We only read data that anyone can see by visiting your public user profile in an incognito window. We will never ask you for an OAuth token with write access, private repository scopes, or email permissions.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Tracking Cookies",
      summary: "No cross-site pixels. No marketing tracking.",
      description:
        "We do not use advertising beacons, retargeting scripts, or third-party cookies. We use privacy-friendly telemetry powered by Vercel Analytics, which collects anonymous pageview performance metrics without storing persistent cookies or tracking individual users across the web.",
    },
    {
      icon: Database,
      title: "Immutable Snapshots",
      summary: "Battles generate permanent read-only JSON snapshots.",
      description:
        "When a matchup is evaluated, the calculated 5-axis algorithmic scores, problem overlap sets, and roasts are saved as an immutable snapshot. This ensures that sharing a battle link (/battle/[id]) renders the exact fight result without making unnecessary repetitive calls to external platforms.",
    },
    {
      icon: Bot,
      title: "AI Commentary & Roasting",
      summary: "Zero-retention model inference via Google Gemini.",
      description:
        "When generating creative commentary or punchlines, only the public handles, verified ratings, solve numbers, and outcome verdicts are forwarded to Google Gemini. No personal user data is sent or used for training. If Gemini is unavailable, the application falls back immediately to our deterministic local roaster.",
    },
    {
      icon: Trash2,
      title: "Right to Unlist",
      summary: "Want a match snapshot removed? We honor takedowns.",
      description:
        "If you do not want your handle or a specific battle snapshot to appear on TrashTalk, open a request on our GitHub repository or contact the maintainers with your handle. We will permanently unlist the snapshot from our public index.",
    },
  ];

  return (
    <div className="w min-h-screen py-10 sm:py-16">
      {/* Breadcrumb / Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted hover:text-ink transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-punch" aria-hidden="true" />
          <span>back to the arena</span>
        </Link>
        <span className="mono text-xs text-muted uppercase">EFFECTIVE: MARCH 2026</span>
      </div>

      {/* Main Container */}
      <div className="border-4 border-ink bg-surface shadow-[8px_8px_0px_#111214] p-6 sm:p-12 space-y-10">
        {/* Header */}
        <div className="space-y-4 pb-8 border-b-2 border-ink">
          <div className="inline-block px-3 py-1 bg-ink text-white font-mono text-xs font-bold uppercase tracking-widest">
            DATA TRANSPARENCY
          </div>
          <h1
            className="big text-ink uppercase"
            style={{ fontSize: "clamp(36px, 5vw, 68px)", lineHeight: 0.95 }}
          >
            The Receipts on Privacy
          </h1>
          <p className="font-sans text-muted text-base sm:text-lg max-w-3xl leading-relaxed">
            TrashTalk is built on senior engineering principles: local-first operation, verifiable receipts,
            and complete transparency. Here is our straightforward, developer-friendly policy on data collection,
            storage, and privacy.
          </p>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={`p-6 border-2 border-ink bg-canvas space-y-3 ${
                idx === sections.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border-2 border-ink bg-punch text-white flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-sans font-bold text-lg text-ink">{section.title}</h2>
                  <span className="font-mono text-xs text-muted">{section.summary}</span>
                </div>
              </div>
              <p className="font-sans text-sm text-ink/85 leading-relaxed pt-1">
                {section.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t-2 border-ink flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-muted">
          <span>Questions or takedown requests? Open an issue on GitHub.</span>
          <a
            href="https://github.com/vansh-tiwari/trashtalk/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-punch font-bold transition-colors uppercase inline-flex items-center gap-1"
          >
            <span>GitHub Issues</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
