"use client";

import React, { useState } from "react";
import type { SolvedProblem } from "@/lib/platforms/contracts";
import { getProblemStatementUrl, getProblemTags } from "@/lib/problems/presentation";
import { ExternalLink } from "lucide-react";

export interface ProblemTableProps {
  problems: SolvedProblem[];
  emptyMessage?: string;
  displayCount?: number;
  onShowMore?: () => void;
}

export default function ProblemTable({
  problems,
  emptyMessage = "No problems match your current filter.",
  displayCount = 30,
  onShowMore,
}: ProblemTableProps) {
  function getRatingBadge(rating?: number) {
    if (rating === undefined || rating === null) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-canvas text-muted border border-rule">
          unrated
        </span>
      );
    }
    if (rating >= 2200) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-tabular font-bold bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]">
          ★ {rating}
        </span>
      );
    }
    if (rating >= 1600) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-tabular font-bold bg-[#FEF08A]/40 text-[#854D0E] border border-[#FDE047]">
          ★ {rating}
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-tabular font-medium bg-positive-surface text-positive border border-positive/30">
        ★ {rating}
      </span>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="py-10 px-4 text-center border border-rule border-dashed rounded-surface bg-canvas/30 text-muted text-sm">
        {emptyMessage}
      </div>
    );
  }

  const visibleProblems = problems.slice(0, displayCount);
  const hasMore = problems.length > displayCount;

  return (
    <div className="space-y-4">
      <div className="problem-scroll-container">
        <table className="w-full text-left border-collapse" aria-label="Problems table">
          <thead>
            <tr className="border-b-2 border-ink bg-[#15171B] text-[#F4F4F4] uppercase tracking-wider text-[11px] font-bold">
              <th scope="col" className="py-2.5 px-3 w-24 sm:w-28 sticky top-0 bg-[#15171B] text-[#F4F4F4] z-10">ID</th>
              <th scope="col" className="py-2.5 px-3 sticky top-0 bg-[#15171B] text-[#F4F4F4] z-10">Problem Name</th>
              <th scope="col" className="py-2.5 px-3 w-28 text-center sticky top-0 bg-[#15171B] text-[#F4F4F4] z-10">Rating</th>
              <th scope="col" className="py-2.5 px-3 hidden md:table-cell sticky top-0 bg-[#15171B] text-[#F4F4F4] z-10">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/70">
              {visibleProblems.map((prob) => {
                const url = getProblemStatementUrl(prob);
                const displayId = prob.id.startsWith("LC:")
                  ? `LC / ${prob.id.slice(3)}`
                  : prob.id.startsWith("CC:")
                  ? `CC / ${prob.id.slice(3)}`
                  : prob.id.replace(/^CF:/, "");
                const tags = getProblemTags(prob);

                return (
                  <tr key={prob.id} className="hover:bg-canvas/50 transition-colors">
                    {/* Problem ID */}
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-ink align-middle whitespace-nowrap">
                      {displayId}
                    </td>

                    {/* Problem Title + Safe External Link */}
                    <td className="py-2.5 px-3 align-middle break-words">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink hover:text-brand hover:underline transition-colors group"
                        >
                          <span>{prob.name}</span>
                          <ExternalLink className="w-3 h-3 text-muted group-hover:text-brand shrink-0" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-xs sm:text-sm font-medium text-ink" title="Statement URL unavailable">
                          {prob.name}
                        </span>
                      )}

                      {/* Mobile tags row */}
                      {tags.length > 0 && (
                        <div className="flex md:hidden flex-wrap gap-1 pt-1">
                          {tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-muted bg-canvas px-1.5 py-0.5 rounded border border-rule/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Rating Badge */}
                    <td className="py-2.5 px-3 text-center align-middle whitespace-nowrap">
                      {getRatingBadge(prob.rating)}
                    </td>

                    {/* Tags (Desktop) */}
                    <td className="py-2.5 px-3 hidden md:table-cell align-middle">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-muted bg-canvas px-1.5 py-0.5 rounded border border-rule/60"
                          >
                            {tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="text-[10px] text-muted" title={tags.slice(3).join(", ")}>
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      {/* Pagination / Show More */}
      {hasMore && onShowMore && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted font-tabular">
            Showing {visibleProblems.length} of {problems.length} problems
          </span>
          <button
            type="button"
            onClick={onShowMore}
            className="px-4 py-2 rounded-control border border-rule bg-canvas hover:bg-canvas/80 text-xs font-semibold text-ink min-h-[44px] transition-colors"
          >
            Show 30 More Problems
          </button>
        </div>
      )}
    </div>
  );
}
