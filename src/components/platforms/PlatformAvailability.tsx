"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Platform } from "@/lib/platforms/contracts";
import { getPlatformConfig } from "@/lib/platforms/registry";

export interface PlatformAvailabilityProps {
  platform: Platform;
  onChooseCodeforces: () => void;
  className?: string;
}

export default function PlatformAvailability({
  platform,
  onChooseCodeforces,
  className = "",
}: PlatformAvailabilityProps) {
  const config = getPlatformConfig(platform);
  const isNext = config.status === "next";

  return (
    <div
      className={`bg-surface border border-rule rounded-[16px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[220px] ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-secondary font-medium pb-2">
        <span>platform availability</span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-semibold text-xs rounded-full"
          style={{
            backgroundColor: config.theme.player1Surface,
            color: config.theme.player1Ink,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.theme.accent }}
            aria-hidden="true"
          />
          {config.availabilityLabel}
        </span>
      </div>

      <div className="my-auto py-2 space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-ink">
          {config.label} is {isNext ? "up next." : "coming later."}
        </h3>
        <p className="text-sm text-secondary leading-relaxed">
          {config.emphasis.join(" · ").toLowerCase()}
        </p>
      </div>

      <div className="pt-4 border-t border-rule flex items-center justify-between">
        <span className="text-xs text-secondary">Looking to battle right now?</span>
        <button
          type="button"
          onClick={onChooseCodeforces}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5A2A] text-[#111214] hover:bg-[#F04C1D] font-bold text-sm rounded-[10px] transition-colors shadow-sm"
        >
          <span>try Codeforces</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
