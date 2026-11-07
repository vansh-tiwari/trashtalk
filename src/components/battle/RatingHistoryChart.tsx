"use client";

import React from "react";
import { formatNum } from "@/lib/battle/formatters";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";

export interface RatingHistoryChartProps {
  p1Handle: string;
  p2Handle: string;
  p1Rating?: number;
  p2Rating?: number;
  p1PeakRating?: number;
  p2PeakRating?: number;
  p1Rank?: string;
  p2Rank?: string;
  p1Solves?: number;
  p2Solves?: number;
  platform?: string;
}

export default function RatingHistoryChart({
  p1Handle,
  p2Handle,
  p1Rating,
  p2Rating,
  p1PeakRating,
  p2PeakRating,
  p1Rank,
  p2Rank,
  p1Solves,
  p2Solves,
  platform,
}: RatingHistoryChartProps) {
  const isGithub = platform === "github";
  const rows = [
    {
      label: isGithub ? "Stars Earned" : "Active Rating",
      icon: TrendingUp,
      p1: p1Rating !== undefined && p1Rating > 0 ? formatNum(p1Rating) : "—",
      p2: p2Rating !== undefined && p2Rating > 0 ? formatNum(p2Rating) : "—",
      leader: (p1Rating ?? 0) > (p2Rating ?? 0) ? p1Handle : (p2Rating ?? 0) > (p1Rating ?? 0) ? p2Handle : null,
    },
    {
      label: isGithub ? "Top Repo Stars" : "All-Time Peak",
      icon: Trophy,
      p1: p1PeakRating !== undefined && p1PeakRating > 0 ? formatNum(p1PeakRating) : p1Rating ? formatNum(p1Rating) : "—",
      p2: p2PeakRating !== undefined && p2PeakRating > 0 ? formatNum(p2PeakRating) : p2Rating ? formatNum(p2Rating) : "—",
      leader: (p1PeakRating ?? p1Rating ?? 0) > (p2PeakRating ?? p2Rating ?? 0) ? p1Handle : (p2PeakRating ?? p2Rating ?? 0) > (p1PeakRating ?? p1Rating ?? 0) ? p2Handle : null,
    },
    {
      label: isGithub ? "Followers" : "Rank / Star Tier",
      icon: Target,
      p1: p1Rank || "—",
      p2: p2Rank || "—",
      leader: null,
    },
    {
      label: isGithub ? "Original Repos" : "Verified Solves",
      icon: Zap,
      p1: p1Solves !== undefined ? formatNum(p1Solves) : "—",
      p2: p2Solves !== undefined ? formatNum(p2Solves) : "—",
      leader: (p1Solves ?? 0) > (p2Solves ?? 0) ? p1Handle : (p2Solves ?? 0) > (p1Solves ?? 0) ? p2Handle : null,
    },
  ];

  return (
    <div className="pn border-2 border-ink bg-surface shadow-[4px_4px_0px_#111214] p-4 sm:p-5 select-none">
      <div className="flex items-center justify-between pb-3 border-b-2 border-ink mb-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-punch" aria-hidden="true" />
          Verified Tale of the Tape
        </h3>
        <span className="font-mono text-[10px] text-muted uppercase">100% Verified Receipts</span>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="p-2.5 bg-canvas border border-rule/80 flex items-center justify-between text-xs font-mono"
          >
            <div className={`font-bold ${row.leader === p1Handle ? "text-punch font-extrabold" : "text-ink"}`}>
              {row.p1}
            </div>

            <div className="flex items-center gap-1.5 text-muted text-[11px] uppercase tracking-wider">
              <row.icon className="w-3 h-3 text-muted/80" aria-hidden="true" />
              <span>{row.label}</span>
            </div>

            <div className={`font-bold ${row.leader === p2Handle ? "text-punch font-extrabold" : "text-ink"}`}>
              {row.p2}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
