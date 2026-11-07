import React from "react";
import Link from "next/link";
import { ArrowLeft, Swords, Trophy, ExternalLink } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none max-w-2xl mx-auto my-8">
      <div className="w-full p-8 sm:p-12 border-4 border-ink bg-surface shadow-[8px_8px_0px_#111214] space-y-8 text-left relative overflow-hidden">
        {/* Top Punch-Red Banner Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-punch" />

        {/* Header Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-ink text-dk-text font-mono text-xs font-bold uppercase tracking-widest">
              404 · TKO
            </span>
            <span className="font-mono text-xs text-muted uppercase">match not found · referee stoppage</span>
          </div>
          <span className="font-mono text-xs text-punch font-bold uppercase">OUT COLD</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1
            className="big text-ink uppercase"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95 }}
          >
            KNOCKED OUT OF THE RING
          </h1>
          <p className="font-sans text-muted text-sm sm:text-base leading-relaxed">
            The requested matchup doesn’t exist or hasn’t been fought yet in the arena.
            Drop fresh handles to calculate verified receipts or pick a legendary demo clash below.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-wrap gap-4 items-center">
          <Link
            href="/"
            className="fb o inline-flex items-center gap-2"
            style={{
              padding: "0 24px",
              minHeight: "52px",
              fontSize: "18px",
            }}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>back to the arena</span>
          </Link>

          <Link
            href="/battle"
            className="fb inline-flex items-center gap-2"
            style={{
              backgroundColor: "#FFFFFF",
              color: "var(--ink)",
              borderColor: "var(--ink)",
              padding: "0 20px",
              minHeight: "52px",
              fontSize: "17px",
            }}
          >
            <Swords className="w-4 h-4 text-punch" aria-hidden="true" />
            <span>new battle</span>
          </Link>
        </div>

        {/* Quick Demo Clash Links */}
        <div className="pt-6 border-t-2 border-ink space-y-3">
          <div className="font-mono text-xs uppercase text-muted tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-punch" aria-hidden="true" />
            <span>Legendary verified clashes you can watch right now:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <Link
              href="/battle/cf-tourist-vs-petr-legendary"
              className="p-3 border border-ink/40 bg-canvas hover:border-ink hover:bg-white transition-all text-ink flex items-center justify-between"
            >
              <span>tourist vs Petr</span>
              <ExternalLink className="w-3 h-3 text-muted" aria-hidden="true" />
            </Link>

            <Link
              href="/battle/lc-neetcode-vs-larryny-legendary"
              className="p-3 border border-ink/40 bg-canvas hover:border-ink hover:bg-white transition-all text-ink flex items-center justify-between"
            >
              <span>NeetCode vs LarryNY</span>
              <ExternalLink className="w-3 h-3 text-muted" aria-hidden="true" />
            </Link>

            <Link
              href="/battle/gh-torvalds-vs-antirez-legendary"
              className="p-3 border border-ink/40 bg-canvas hover:border-ink hover:bg-white transition-all text-ink flex items-center justify-between"
            >
              <span>Torvalds vs Antirez</span>
              <ExternalLink className="w-3 h-3 text-muted" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
