"use client";

import React from "react";
import { useRingsideContext } from "@/lib/ringside/client";
import { ROAST_DIALECT_OPTIONS } from "@/lib/ringside/context";

export interface BroadcastDatelineProps {
  variant?: "navbar" | "inline";
  className?: string;
}

export default function BroadcastDateline({
  variant = "navbar",
  className = "",
}: BroadcastDatelineProps) {
  const { geo, clockText, dialectPref } = useRingsideContext();

  const locationText = geo?.datelineLocation || "RINGSIDE ARENA";
  const selectedDialectOption = ROAST_DIALECT_OPTIONS.find((d) => d.code === dialectPref);
  const deskLabel =
    dialectPref === "auto"
      ? geo?.detectedRegion?.toggleLabel || "ENGLISH"
      : selectedDialectOption?.shortLabel || geo?.activeRegion?.toggleLabel || "ENGLISH";

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-white/75 tabular-nums flex-wrap ${className}`}
        data-testid="broadcast-dateline-inline"
      >
        <span className="font-bold text-[#FF5A52]">LIVE RINGSIDE</span>
        <span className="text-white/35" aria-hidden="true">·</span>
        <span>{locationText}</span>
        {clockText ? (
          <>
            <span className="text-white/35" aria-hidden="true">·</span>
            <span>{clockText}</span>
          </>
        ) : null}
        <span className="text-white/35" aria-hidden="true">·</span>
        <span>{deskLabel} DESK</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-[#111214] border-b border-white/10 text-[#A3A6AE] text-[10px] sm:text-[11px] font-mono tracking-wider uppercase select-none ${className}`}
      role="region"
      aria-label="Fight Night Broadcast Dateline"
      data-testid="broadcast-dateline-bar"
    >
      <div className="w flex items-center justify-between gap-2 sm:gap-4 py-1 sm:py-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate tabular-nums">
          <span className="font-bold text-[#FF5A52] shrink-0">
            <span className="sm:hidden">LIVE</span>
            <span className="hidden sm:inline">BROADCASTING LIVE</span>
          </span>
          <span className="text-white/30 shrink-0" aria-hidden="true">·</span>
          <span className="text-[#F4F4F4] font-semibold truncate">{locationText}</span>
          {clockText ? (
            <>
              <span className="text-white/30 shrink-0" aria-hidden="true">·</span>
              <span className="shrink-0">{clockText}</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0">
          <span className="text-[#F4F4F4]/90 sm:text-[#A3A6AE]">
            <span className="hidden sm:inline">ROAST DESK: </span>
            {deskLabel}
          </span>
          <span className="hidden md:inline text-white/30" aria-hidden="true">·</span>
          <span className="hidden md:inline">RINGSIDE ACCESS</span>
        </div>
      </div>
    </div>
  );
}

