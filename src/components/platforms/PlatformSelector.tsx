"use client";

import React from "react";
import type { Platform } from "@/lib/platforms/contracts";
import { PLATFORM_ORDER, getPlatformConfig } from "@/lib/platforms/registry";

export interface PlatformSelectorProps {
  value: Platform;
  onChange: (value: Platform) => void;
  className?: string;
}

export default function PlatformSelector({
  value,
  onChange,
  className = "",
}: PlatformSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Supported and upcoming platforms"
      className={`flex flex-wrap gap-2 items-center p-1.5 bg-surface border border-rule rounded-[14px] ${className}`}
    >
      {PLATFORM_ORDER.map((id) => {
        const config = getPlatformConfig(id);
        const isSelected = value === id;
        const isLive = config.status === "live";

        return (
          <button
            key={id}
            role="tab"
            aria-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => onChange(id)}
            type="button"
            className={`min-h-[44px] px-3.5 py-2 rounded-[10px] text-sm font-medium transition-all flex items-center gap-2 select-none focus:outline-none focus:ring-2 focus:ring-[#304BFF] focus:ring-offset-2 ${
              isSelected
                ? "bg-[#111214] text-white font-semibold shadow-sm"
                : "text-secondary hover:text-ink hover:bg-canvas border border-transparent"
            }`}
          >
            <span>{config.label}</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isLive
                  ? isSelected
                    ? "bg-[#D6FF45] text-[#111214]"
                    : "bg-[#304BFF] text-white"
                  : isSelected
                  ? "bg-white/20 text-white"
                  : "bg-canvas text-secondary border border-rule/50"
              }`}
            >
              {config.availabilityLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
