"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Swords, Zap, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { RoastPersona } from "@/lib/ai/schemas";

const TICKER_ITEMS = [
  "🔥 @tourist: 4009 peak rating. Contest coordinators had to invent harder time limits.",
  "⚡ @Petr: Winning ACM-ICPC while modern competitors were still learning while-loops.",
  "🥊 @Errichto: 1000 YouTube tutorials and still choking on binary search boundary conditions.",
  "🎧 @Benq: 3800 rating and writing solutions faster than a git rebase script.",
  "🌶️ Verdict: Algorithmic grit beats wishful thinking every single contest.",
];

export default function ArcadeHero() {
  const router = useRouter();
  const [u1, setU1] = useState("");
  const [u2, setU2] = useState("");
  const [persona, setPersona] = useState<RoastPersona>("savage_dev");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartBattle(e: React.FormEvent) {
    e.preventDefault();
    if (!u1.trim() || !u2.trim()) {
      setError("Please enter both Codeforces handles.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          u1: u1.trim(),
          u2: u2.trim(),
          persona,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create battle.");
      }

      router.push(`/battle/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating battle.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Live Savage Roasts Ticker */}
      <div className="w-full overflow-hidden rounded-xl bg-gray-950/80 border border-gray-800/80 p-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[11px] font-bold whitespace-nowrap">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>ROAST TICKER</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee text-xs font-mono text-gray-300">
            {TICKER_ITEMS.join("   •   ")}
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <Swords className="w-3.5 h-3.5" />
          <span>Arcade Developer Battle Arena</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Where Code Profiles Go To Get{" "}
          <span className="text-gradient-fire">Roasted By AI.</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
          Settle the rivalry. Enter two Codeforces handles to get deterministic scoring, verified problem overlap ($P_1 \cap P_2$), and a savage AI roast.
        </p>

        {/* 1-Click Instant Matchup Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs font-mono text-gray-500">1-Click Instant Demos:</span>
          <Link
            href="/battle/cf-tourist-vs-petr-legendary"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <span>⚡ tourist vs Petr</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200">Instant</span>
          </Link>
          <button
            type="button"
            onClick={() => { setU1("Errichto"); setU2("ecnerwala"); }}
            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-mono transition-colors"
          >
            Errichto vs ecnerwala
          </button>
          <button
            type="button"
            onClick={() => { setU1("Um_nik"); setU2("Benq"); }}
            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-mono transition-colors"
          >
            Um_nik vs Benq
          </button>
        </div>
      </div>

      {/* Interactive Battleground Card Arena */}
      <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl relative">
        <form onSubmit={handleStartBattle} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Player 1 Input */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-mono text-cyan-400 font-bold block">
                PLAYER 1 (CORNER BLUE)
              </label>
              <input
                type="text"
                placeholder="Codeforces handle (e.g. tourist)"
                value={u1}
                onChange={(e) => setU1(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-cyan-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
            </div>

            {/* Pulsing VS Emblem */}
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white font-black text-sm font-mono shadow-xl shadow-pink-500/40 animate-pulse">
                VS
              </div>
            </div>

            {/* Player 2 Input */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-mono text-pink-400 font-bold block">
                PLAYER 2 (CORNER RED)
              </label>
              <input
                type="text"
                placeholder="Codeforces handle (e.g. Petr)"
                value={u2}
                onChange={(e) => setU2(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-pink-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-all font-mono"
              />
            </div>
          </div>

          {/* Persona Selection */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-800">
            <div className="w-full sm:w-auto space-y-1">
              <label className="text-xs font-mono text-gray-400 block">
                Select Roaster Persona:
              </label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as RoastPersona)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-pink-500"
              >
                <option value="savage_dev">🌶️ Savage Senior Dev (No Mercy)</option>
                <option value="silicon_valley_vc">👔 Silicon Valley VC (TAM & Moats)</option>
                <option value="ufc_announcer">🥊 Fight Announcer (High Energy)</option>
                <option value="hype_man">🎧 Wholesome Hype-Man (Banter & Love)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-pink-500/25 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 self-end"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Battle...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>START BATTLE</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
