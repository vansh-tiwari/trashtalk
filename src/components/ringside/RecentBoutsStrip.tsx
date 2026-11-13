"use client";

import React from "react";
import Link from "next/link";
import type { RecentBoutSummary } from "@/lib/ringside/context";

export interface RecentBoutsStripProps {
  bouts: RecentBoutSummary[];
  onClear: () => void;
  className?: string;
}

const PLATFORM_SHORT_LABELS: Record<string, string> = {
  codeforces: "CF",
  leetcode: "LC",
  codechef: "CC",
  github: "GH",
};

export default function RecentBoutsStrip({
  bouts,
  onClear,
  className = "",
}: RecentBoutsStripProps) {
  if (!bouts || bouts.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-3 pt-2.5 border-t border-current/15 flex flex-wrap items-center justify-between gap-2 text-xs ${className}`}
      role="region"
      aria-label="Recent bouts from your corner"
      data-testid="recent-bouts-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono text-[11px] font-bold uppercase tracking-wider opacity-75 whitespace-nowrap shrink-0">
          Your corner
        </span>
        {bouts.slice(0, 4).map((bout) => {
          const pTag = PLATFORM_SHORT_LABELS[bout.platform] || "CF";
          const outcomeTag = bout.winnerHandle
            ? `@${bout.winnerHandle} +${bout.margin}`
            : "Draw";
          return (
            <Link
              key={bout.id}
              href={`/battle/${bout.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-current/25 bg-black/15 hover:border-[#D82A26] hover:text-[#FF5A52] transition-colors font-mono text-[11px] whitespace-nowrap shrink-0 no-underline"
              title={`Open ${bout.u1} vs ${bout.u2} (${outcomeTag})`}
            >
              <span className="font-bold">
                {bout.u1} vs {bout.u2}
              </span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span className="opacity-85 tabular-nums">{outcomeTag}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span className="opacity-70">{pTag}</span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mono text-[11px] uppercase tracking-wider opacity-65 hover:opacity-100 hover:text-[#FF5A52] transition-opacity underline cursor-pointer bg-transparent border-0 p-1 whitespace-nowrap shrink-0"
        aria-label="Clear recent bouts history"
      >
        Clear history
      </button>
    </div>
  );
}
