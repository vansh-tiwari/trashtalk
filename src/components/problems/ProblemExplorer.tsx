"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import type { OverlapResult } from "@/lib/battle/types";
import type { SolvedProblem, Platform } from "@/lib/platforms/contracts";
import {
  isProblemSetAvailable,
  filterProblems,
  type ProblemSet,
  type RatingFilter,
  type ProblemSort,
} from "@/lib/problems/presentation";
import ProblemFilters from "./ProblemFilters";
import ProblemTable from "./ProblemTable";
import { ShieldAlert } from "lucide-react";

export interface ProblemExplorerProps {
  overlap: OverlapResult;
  p1Handle: string;
  p2Handle: string;
  platform?: Platform;
}

const TABS: ProblemSet[] = ["common", "p1", "p2"];

export default function ProblemExplorer({
  overlap,
  p1Handle,
  p2Handle,
  platform,
}: ProblemExplorerProps) {
  const [activeTab, setActiveTab] = useState<ProblemSet>("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [sortBy, setSortBy] = useState<ProblemSort>("rating-desc");
  const [displayCount, setDisplayCount] = useState(30);

  const tabRefs = useRef<Record<ProblemSet, HTMLButtonElement | null>>({
    common: null,
    p1: null,
    p2: null,
  });

  useEffect(() => {
    setDisplayCount(30);
  }, [activeTab, searchQuery, ratingFilter, sortBy]);

  const currentProblems: SolvedProblem[] = useMemo(() => {
    if (activeTab === "common") return overlap.common ?? [];
    if (activeTab === "p1") return overlap.player1Exclusive ?? [];
    return overlap.player2Exclusive ?? [];
  }, [activeTab, overlap]);

  const filteredProblems = useMemo(() => {
    return filterProblems(currentProblems, {
      query: searchQuery,
      rating: ratingFilter,
      sort: sortBy,
    });
  }, [currentProblems, searchQuery, ratingFilter, sortBy]);

  const isSetAvailable = isProblemSetAvailable(overlap, activeTab);

  const handleTabKeyDown = (e: React.KeyboardEvent, current: ProblemSet) => {
    const currentIndex = TABS.indexOf(current);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextTab = TABS[(currentIndex + 1) % TABS.length];
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length];
      setActiveTab(prevTab);
      tabRefs.current[prevTab]?.focus();
    }
  };

  const isLeetcode = platform === "leetcode";
  const p1ExclusiveCount = overlap.player1Exclusive?.length ?? 0;
  const commonCount = overlap.common?.length ?? 0;
  const p2ExclusiveCount = overlap.player2Exclusive?.length ?? 0;
  const isDefinitive = Boolean(overlap.isDefinitive && overlap.totalUnionCount > 0);

  const hasProblems =
    (overlap.totalUnionCount ?? 0) > 0 ||
    commonCount > 0 ||
    p1ExclusiveCount > 0 ||
    p2ExclusiveCount > 0;
  const shouldShowDnaBar = hasProblems;

  const p1Label =
    p1ExclusiveCount > 0
      ? `${p1ExclusiveCount} ONLY ${p1Handle}`
      : isDefinitive || isLeetcode
        ? `0 ONLY ${p1Handle}`
        : `ONLY ${p1Handle} (UNAVAILABLE)`;

  const p2Label =
    p2ExclusiveCount > 0
      ? `${p2ExclusiveCount} ONLY ${p2Handle}`
      : isDefinitive || isLeetcode
        ? `0 ONLY ${p2Handle}`
        : `ONLY ${p2Handle} (UNAVAILABLE)`;

  return (
    <section className="sec2 select-none" aria-label="Problem Overlap Breakdown" style={{ paddingTop: "48px" }}>
      {/* Section Header */}
      <div className="sh2">
        <div className="flex items-center gap-3 flex-wrap">
          <h2>same problems?</h2>
          {isLeetcode && (
            <span
              data-testid="leetcode-20-badge"
              className="mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-ink text-white"
            >
              LAST 20 SOLVES ANALYZED
            </span>
          )}
        </div>
        <span>
          {overlap.dnaPercentage !== null && overlap.dnaPercentage !== undefined
            ? `${overlap.dnaPercentage}% shared DNA`
            : isDefinitive && overlap.totalUnionCount > 0
              ? `${Math.round((commonCount / overlap.totalUnionCount) * 100)}% shared DNA`
              : "DNA unavailable"}
        </span>
      </div>

      <div className="pn space-y-4">
        {/* Unified DNA Tabs Bar */}
        {shouldShowDnaBar ? (
          <div
            data-testid="dna-bar"
            className="dna rounded-none overflow-hidden border-2 border-ink"
            role="tablist"
            aria-label={`DNA Overlap Tabs: ${p1ExclusiveCount} only ${p1Handle}, ${commonCount} shared, ${p2ExclusiveCount} only ${p2Handle}`}
          >
            {/* Segment 1: Only P1 */}
            <button
              id="tab-p1"
              ref={(el) => { tabRefs.current.p1 = el; }}
              type="button"
              role="tab"
              aria-selected={activeTab === "p1"}
              className={`dna-segment ${activeTab === "p1" ? "is-active" : ""}`}
              style={{
                flex: Math.max(1, p1ExclusiveCount),
                background: "var(--bl, #111214)",
                color: "#fff",
                boxShadow: activeTab === "p1" ? "inset 0 0 0 3px #fff" : "none",
                borderRight: "2px solid var(--ink, #111214)",
              }}
              onClick={() => setActiveTab("p1")}
              onKeyDown={(e) => handleTabKeyDown(e, "p1")}
              title={`Only ${p1Handle}: ${p1ExclusiveCount}`}
            >
              <span>{p1Label}</span>
            </button>

            {/* Segment 2: Both / Shared */}
            <button
              id="tab-common"
              ref={(el) => { tabRefs.current.common = el; }}
              type="button"
              role="tab"
              aria-selected={activeTab === "common"}
              className={`dna-segment ${activeTab === "common" ? "is-active" : ""}`}
              style={{
                flex: Math.max(1, commonCount),
                background: "#DADAD6",
                color: "#111214",
                boxShadow: activeTab === "common" ? "inset 0 0 0 3px var(--ink, #111214)" : "none",
              }}
              onClick={() => setActiveTab("common")}
              onKeyDown={(e) => handleTabKeyDown(e, "common")}
              title={`Shared solves: ${commonCount}`}
            >
              <span>
                {commonCount} SHARED <span className="sr-only">both</span>
              </span>
            </button>

            {/* Segment 3: Only P2 */}
            <button
              id="tab-p2"
              ref={(el) => { tabRefs.current.p2 = el; }}
              type="button"
              role="tab"
              aria-selected={activeTab === "p2"}
              className={`dna-segment ${activeTab === "p2" ? "is-active" : ""}`}
              style={{
                flex: Math.max(1, p2ExclusiveCount),
                background: "var(--or, #D82A26)",
                color: "#fff",
                boxShadow: activeTab === "p2" ? "inset 0 0 0 3px #fff" : "none",
                borderLeft: "2px solid var(--ink, #111214)",
              }}
              onClick={() => setActiveTab("p2")}
              onKeyDown={(e) => handleTabKeyDown(e, "p2")}
              title={`Only ${p2Handle}: ${p2ExclusiveCount}`}
            >
              <span>{p2Label}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-canvas border border-rule text-xs text-muted flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-punch" aria-hidden="true" />
            <span>Problem DNA is unavailable for this match due to partial submission coverage.</span>
          </div>
        )}

        {/* LeetCode Explanation Note */}
        {isLeetcode && (
          <div className="p-3 bg-canvas border border-rule text-xs text-muted flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-punch" aria-hidden="true" />
            <span>
              LeetCode public API returns up to 20 recent accepted solves per profile. Overlap and exclusive lists reflect these recent solves.
            </span>
          </div>
        )}

        {/* Partial Coverage Note for non-LeetCode */}
        {!isDefinitive && !isLeetcode && (p1ExclusiveCount === 0 || p2ExclusiveCount === 0) && (
          <div className="p-3 bg-canvas border border-rule text-xs text-muted flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-punch" aria-hidden="true" />
            <span>
              Historical submission coverage was partially sampled; problem lists reflect all verified fetched solves.
            </span>
          </div>
        )}

        {/* Problem Table Body */}
        <div className="pt-2">
          {isSetAvailable ? (
            <div className="space-y-4">
              {/* Show filter bar only when problems listed > 5 */}
              {currentProblems.length > 5 && (
                <ProblemFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  ratingFilter={ratingFilter}
                  onRatingFilterChange={setRatingFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalFiltered={filteredProblems.length}
                />
              )}
              <ProblemTable
                problems={filteredProblems}
                displayCount={displayCount}
                onShowMore={() => setDisplayCount((prev) => prev + 30)}
                emptyMessage="No problems match the current filter."
              />
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted">
              Exclusive problem list is unavailable for this match.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
