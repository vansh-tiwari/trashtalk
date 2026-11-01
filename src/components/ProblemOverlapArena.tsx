"use client";

import React, { useState } from "react";
import { OverlapResult } from "@/lib/battle/types";
import { ExternalLink, CheckCircle2, Lock, Zap, ShieldAlert } from "lucide-react";

interface ProblemOverlapArenaProps {
  overlap: OverlapResult;
  p1Handle: string;
  p2Handle: string;
}

export default function ProblemOverlapArena({
  overlap,
  p1Handle,
  p2Handle,
}: ProblemOverlapArenaProps) {
  const [activeTab, setActiveTab] = useState<"common" | "p1" | "p2">("common");

  const getDifficultyBadge = (rating?: number) => {
    if (!rating) {
      return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">Unrated</span>;
    }
    if (rating >= 2200) {
      return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">★ {rating} Master</span>;
    }
    if (rating >= 1600) {
      return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">★ {rating} Hard</span>;
    }
    return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">★ {rating} Easy</span>;
  };

  const currentList =
    activeTab === "common"
      ? overlap.common
      : activeTab === "p1"
      ? overlap.player1Exclusive
      : overlap.player2Exclusive;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
      {/* Top Header & DNA Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-extrabold text-white">
              Problem Overlap Arena
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Verified problem-by-problem intersection ($P_1 \cap P_2$) and exclusive flexes
          </p>
        </div>

        {/* DNA Similarity Index */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/80 border border-gray-800">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
              Algorithmic DNA
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {overlap.isDefinitive ? "Jaccard Index" : "Partial Coverage"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 flex items-center justify-center text-white font-mono font-black text-sm">
            {overlap.dnaPercentage !== null ? `${overlap.dnaPercentage}%` : "N/A"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("common")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === "common"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Common Solved ({overlap.common.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("p1")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === "p1"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>@{p1Handle}&apos;s Flex ({overlap.player1Exclusive.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("p2")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === "p2"
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>@{p2Handle}&apos;s Flex ({overlap.player2Exclusive.length})</span>
        </button>
      </div>

      {!overlap.isDefinitive && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>
            Notice: Submission history was partially fetched due to API limits. Exclusives represent observed samples rather than definitive historical absence.
          </span>
        </div>
      )}

      {/* Problem Grid */}
      {currentList.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-xs font-mono">
          No problems found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {currentList.map((prob) => (
            <a
              key={prob.id}
              href={prob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 hover:border-gray-700 transition-all group flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-gray-300 group-hover:text-cyan-400 transition-colors truncate">
                    {prob.id}
                  </span>
                  {getDifficultyBadge(prob.rating)}
                </div>
                <p className="text-xs text-gray-400 truncate group-hover:text-gray-200 transition-colors">
                  {prob.name}
                </p>
                {prob.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {prob.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[9px] font-mono text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
