"use client";

import React, { useState } from "react";
import type { PlayerScore } from "@/lib/battle/types";
import { ChevronDown, ChevronUp, Scale, Zap } from "lucide-react";

export interface ScoreBreakdownProps {
  p1Score: PlayerScore;
  p2Score: PlayerScore;
  p1Handle: string;
  p2Handle: string;
  outcome: "win" | "draw" | "insufficient_data";
  winnerHandle: string | null;
  margin: number;
  platform?: string;
}

interface AxisConfig {
  key: keyof PlayerScore["axes"];
  label: string | ((platform?: string) => string);
  weightPct: number;
  weightDecimal: number;
  description: (platform?: string) => string;
  metricLabel: (score: PlayerScore, platform?: string) => string;
}

const AXIS_CONFIGS: AxisConfig[] = [
  {
    key: "algorithmicGrit",
    label: (platform) => (platform?.toLowerCase() === "github" ? "Star Gravity" : "Algorithmic Grit"),
    weightPct: 30,
    weightDecimal: 0.3,
    description: (platform) => {
      const p = platform?.toLowerCase();
      if (p === "github") return "Total and peak stars earned across original repositories (500+ stars = 100)";
      if (p === "leetcode") return "Hard & Medium problem depth + Hard density (75+ Hard = max depth)";
      if (p === "codechef") return "Star tier (1★–7★) & Division depth (Div 1: 5★–7★)";
      return "Difficulty of hardest 10% solves (3200+ = 100)";
    },
    metricLabel: (s, platform) => {
      if (platform?.toLowerCase() === "github") {
        return `${s.metrics?.rating?.toLocaleString() ?? 0} stars`;
      }
      return `Depth rated solves`;
    },
  },
  {
    key: "contestPeak",
    label: (platform) => (platform?.toLowerCase() === "github" ? "Shipping Cadence" : "Contest Peak"),
    weightPct: 25,
    weightDecimal: 0.25,
    description: (platform) => {
      const p = platform?.toLowerCase();
      if (p === "github") return "Recent public activity events and commit frequency (60 events = 100)";
      if (p === "leetcode") return "Peak contest rating (3,200 ceiling; unrated practice proxy capped at 40)";
      if (p === "codechef") return "All-time peak rating across modern & old eras (3,200 ceiling)";
      return "All-time peak rating (maxRating / 3500)";
    },
    metricLabel: (s, platform) => {
      if (platform?.toLowerCase() === "github") {
        return `${s.metrics?.recentAcceptedCount?.toLocaleString() ?? 0} events`;
      }
      return `Peak: ${s.metrics?.maxRating?.toLocaleString() ?? "—"}`;
    },
  },
  {
    key: "solveVolume",
    label: (platform) => (platform?.toLowerCase() === "github" ? "Repo Depth" : "Solve Volume"),
    weightPct: 20,
    weightDecimal: 0.2,
    description: (platform) => {
      const p = platform?.toLowerCase();
      if (p === "github") return "Total original non-fork repositories maintained (25 repos = 100)";
      if (p === "leetcode") return "Total unique problems solved across Easy/Med/Hard (1000 = 100)";
      if (p === "codechef") return "Total unique problems accepted from profile counter (1000 = 100)";
      return "Total unique problems accepted (1000 = 100)";
    },
    metricLabel: (s, platform) => {
      if (platform?.toLowerCase() === "github") {
        return `${s.metrics?.solvedCount?.toLocaleString() ?? 0} repos`;
      }
      return `${s.metrics?.solvedCount?.toLocaleString() ?? 0} solves`;
    },
  },
  {
    key: "recentVelocity",
    label: (platform) => (platform?.toLowerCase() === "github" ? "Community Footprint" : "Recent Velocity"),
    weightPct: 15,
    weightDecimal: 0.15,
    description: (platform) => {
      const p = platform?.toLowerCase();
      if (p === "github") return "Follower reach and developer influence (150 followers = 100)";
      if (p === "leetcode") return "Active coding days & submission cadence over last 180 days";
      if (p === "codechef") return "Solves and active contest appearances over last 180 days";
      return "Solves accepted in last 180 days (150 = 100)";
    },
    metricLabel: (s, platform) => {
      if (platform?.toLowerCase() === "github") {
        const followers = s.axes.recentVelocity >= 100 ? 150 : Math.round(s.axes.recentVelocity * 1.5);
        return `${followers.toLocaleString()} followers`;
      }
      return `${s.metrics?.recentAcceptedCount?.toLocaleString() ?? 0} recent`;
    },
  },
  {
    key: "topicBreadth",
    label: (platform) => (platform?.toLowerCase() === "github" ? "Tech Stack Breadth" : "Topic Breadth"),
    weightPct: 10,
    weightDecimal: 0.1,
    description: (platform) => {
      const p = platform?.toLowerCase();
      if (p === "github") return "Distinct programming languages actively authored (7 languages = 100)";
      if (p === "leetcode") return "Algorithmic tags with 3+ solves across Fundamental to Advanced (25 = 100)";
      if (p === "codechef") return "Contest experience & format breadth (40 contests = 100)";
      return "Distinct problem tags mastered (25+ = 100)";
    },
    metricLabel: (s, platform) => {
      if (platform?.toLowerCase() === "github") {
        return `${s.metrics?.distinctTagsCount ?? 0} languages`;
      }
      if (platform?.toLowerCase() === "codechef") {
        return `${s.axes.topicBreadth}% breadth`;
      }
      return `${s.metrics?.distinctTagsCount ?? 0} tags`;
    },
  },
];

export default function ScoreBreakdown({
  p1Score,
  p2Score,
  p1Handle,
  p2Handle,
  outcome,
  winnerHandle,
  margin,
  platform,
}: ScoreBreakdownProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isDraw = outcome === "draw";

  // Calculate unrounded totals
  let p1Sum = 0;
  let p2Sum = 0;
  const rows = AXIS_CONFIGS.map((cfg) => {
    const v1 = p1Score.axes[cfg.key] ?? 0;
    const v2 = p2Score.axes[cfg.key] ?? 0;
    const pts1 = Number((v1 * cfg.weightDecimal).toFixed(2));
    const pts2 = Number((v2 * cfg.weightDecimal).toFixed(2));
    p1Sum += pts1;
    p2Sum += pts2;
    const diff = Number((pts1 - pts2).toFixed(2));

    return {
      cfg,
      v1,
      v2,
      pts1,
      pts2,
      diff,
    };
  });

  // Identify decisive advantages
  const p1Advantages = rows.filter((r) => r.diff > 0.1);
  const p2Advantages = rows.filter((r) => r.diff < -0.1);

  return (
    <div
      className="pn select-none mt-4 border-2 border-ink bg-surface shadow-[4px_4px_0px_#111214]"
      aria-label="Score Formula and Weights Breakdown"
    >
      {/* Header with Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left border-b-2 border-ink bg-[#15171B] text-[#F4F4F4] transition-colors hover:bg-black"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-punch shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Score Formula &amp; Weight Breakdown
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 bg-canvas/20 text-[#A3A6AE] border border-white/20">
            5 weighted axes
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#A3A6AE]">
          <span>{isOpen ? "Collapse" : "Expand"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Formula formula callout */}
          <div className="p-3 bg-canvas border border-rule text-xs font-mono flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted">Formula:</span>
            <span className="font-bold text-ink">
              {platform?.toLowerCase() === "github"
                ? "30% Star Gravity + 25% Shipping Cadence + 20% Repo Depth + 15% Community Footprint + 10% Stack Breadth"
                : "30% Grit + 25% Contest Peak + 20% Volume + 15% Velocity + 10% Breadth"}
            </span>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-ink font-mono uppercase text-[11px] text-muted">
                  <th scope="col" className="py-2 px-2">Axis (Weight)</th>
                  <th scope="col" className="py-2 px-2 text-right">@{p1Handle}</th>
                  <th scope="col" className="py-2 px-2 text-center">Net Delta</th>
                  <th scope="col" className="py-2 px-2 text-left">@{p2Handle}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/70 font-mono">
                {rows.map(({ cfg, v1, v2, pts1, pts2, diff }) => (
                  <tr key={cfg.key} className="hover:bg-canvas/40 transition-colors">
                    {/* Axis and Description */}
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-ink flex items-center gap-1.5">
                        <span>{typeof cfg.label === "function" ? cfg.label(platform) : cfg.label}</span>
                        <span className="px-1.5 py-0.2 bg-canvas border border-rule text-[10px] text-muted font-normal">
                          {cfg.weightPct}%
                        </span>
                      </div>
                      <div className="text-[10px] text-muted hidden sm:block">
                        {cfg.description(platform)}
                      </div>
                    </td>

                    {/* P1 Score and Points */}
                    <td className="py-2.5 px-2 text-right">
                      <div className="font-bold text-ink">{v1} / 100</div>
                      <div className="text-[11px] text-muted font-bold">
                        +{pts1.toFixed(1)} pts
                      </div>
                      <div className="text-[10px] text-muted hidden sm:block">
                        {cfg.metricLabel(p1Score, platform)}
                      </div>
                    </td>

                    {/* Net Advantage */}
                    <td className="py-2.5 px-2 text-center align-middle whitespace-nowrap">
                      {Math.abs(diff) <= 0.1 ? (
                        <span className="inline-block px-2 py-0.5 bg-canvas border border-rule text-[10px] text-muted font-bold">
                          TIED
                        </span>
                      ) : diff > 0 ? (
                        <span className="inline-block px-2 py-0.5 bg-[#111214] text-[#FFFFFF] text-[10px] font-bold">
                          +{diff.toFixed(1)} {p1Handle}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-[#D82A26] text-[#FFFFFF] text-[10px] font-bold">
                          +{Math.abs(diff).toFixed(1)} {p2Handle}
                        </span>
                      )}
                    </td>

                    {/* P2 Score and Points */}
                    <td className="py-2.5 px-2 text-left">
                      <div className="font-bold text-ink">{v2} / 100</div>
                      <div className="text-[11px] text-muted font-bold">
                        +{pts2.toFixed(1)} pts
                      </div>
                      <div className="text-[10px] text-muted hidden sm:block">
                        {cfg.metricLabel(p2Score, platform)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals Footer Row */}
              <tfoot>
                <tr className="border-t-2 border-ink font-mono font-bold bg-canvas/30 text-ink">
                  <td className="py-3 px-2 uppercase">Calculated Total</td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-base text-ink">{p1Sum.toFixed(1)}</span>
                    <span className="text-xs text-muted block">({p1Score.total} final)</span>
                  </td>
                  <td className="py-3 px-2 text-center align-middle">
                    {isDraw ? (
                      <span className="inline-block px-2.5 py-1 bg-[#111214] text-white text-[11px] uppercase font-bold tracking-wider">
                        DRAW (0 margin)
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 bg-[#D82A26] text-white text-[11px] uppercase font-bold tracking-wider">
                        +{margin} pts margin
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-left">
                    <span className="text-base text-ink">{p2Sum.toFixed(1)}</span>
                    <span className="text-xs text-muted block">({p2Score.total} final)</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Contextual Narrative Card */}
          <div className="p-3.5 border border-ink bg-canvas flex items-start gap-3">
            <Zap className="w-4 h-4 text-punch shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-ink space-y-1">
              <span className="font-bold uppercase tracking-wide block">
                {isDraw ? "Why this ended in a tie:" : "Why this match was decided:"}
              </span>
              <p className="text-muted leading-relaxed">
                {isDraw ? (
                  <>
                    Both players achieved an identical composite score of{" "}
                    <strong>{p1Score.total}</strong>.{" "}
                    {p1Advantages.length > 0 && p2Advantages.length > 0 ? (
                      <>
                        @{p1Handle} held an advantage in{" "}
                        {p1Advantages.map((a) => a.cfg.label).join(", ")} (
                        {p1Advantages
                          .map((a) => `+${a.diff.toFixed(1)} pts`)
                          .join(", ")}
                        ), while @{p2Handle} countered with an advantage in{" "}
                        {p2Advantages.map((a) => a.cfg.label).join(", ")} (
                        {p2Advantages
                          .map((a) => `+${Math.abs(a.diff).toFixed(1)} pts`)
                          .join(", ")}
                        ). Their lifetime peak ratings and algorithmic grit were identical, producing a dead-even stalemate.
                      </>
                    ) : (
                      "Both players matched performance across all measured algorithmic axes."
                    )}
                  </>
                ) : (
                  <>
                    @{winnerHandle} won by +{margin} points. The decisive factor was{" "}
                    {winnerHandle === p1Handle
                      ? p1Advantages.map((a) => `${a.cfg.label} (+${a.diff.toFixed(1)} pts)`).join(" and ")
                      : p2Advantages.map((a) => `${a.cfg.label} (+${Math.abs(a.diff).toFixed(1)} pts)`).join(" and ")}
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
