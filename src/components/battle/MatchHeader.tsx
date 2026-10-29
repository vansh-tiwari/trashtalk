import React from "react";
import Link from "next/link";
import type { BattleViewModel } from "@/lib/battle/presentation";

export interface MatchHeaderProps {
  vm: BattleViewModel;
  actions?: React.ReactNode;
}

export default function MatchHeader({ vm, actions }: MatchHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
      {/* Compact breadcrumb / matchup context */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono flex-wrap">
        <Link
          href="/"
          className="text-[#A3A6AE] hover:text-white transition-colors font-bold uppercase tracking-wider"
        >
          the arena
        </Link>
        <span className="text-white/40 font-bold" aria-hidden="true">/</span>
        <span className="font-extrabold text-[#F4F4F4] tracking-wide">
          @{vm.p1.handle} vs @{vm.p2.handle}
        </span>
        {vm.isSample && (
          <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
            demo
          </span>
        )}
      </nav>

      {/* Share / Top Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
