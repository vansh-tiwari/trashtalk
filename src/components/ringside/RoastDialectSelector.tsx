"use client";

import React from "react";
import { ROAST_DIALECT_OPTIONS } from "@/lib/ringside/context";
import type { GlobalRegionInfo } from "@/lib/ai/global-regions";

export interface RoastDialectSelectorProps {
  value: string;
  detectedRegion?: GlobalRegionInfo | null;
  onChange: (dialectCode: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  className?: string;
}

export default function RoastDialectSelector({
  value,
  detectedRegion,
  onChange,
  disabled = false,
  idPrefix = "",
  className = "",
}: RoastDialectSelectorProps) {
  const autoDetectedLabel = detectedRegion?.languageName
    ? `Auto · ${detectedRegion.languageName} (${detectedRegion.countryCode})`
    : "Auto · Regional IP";

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#15171B] text-[#F4F4F4] border-t-2 border-[#111214] text-xs select-none ${className}`}
      data-testid="roast-dialect-selector"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
        <span className="mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#A3A6AE] shrink-0">
          Roast flavor
        </span>
        <span className="hidden sm:inline text-white/30 shrink-0" aria-hidden="true">·</span>
        <span className="hidden sm:inline font-mono text-[11px] text-[#FF5A52] font-bold truncate">
          {value === "auto"
            ? autoDetectedLabel
            : ROAST_DIALECT_OPTIONS.find((o) => o.code === value)?.label || "English"}
        </span>
      </div>

      <div className="flex items-center shrink-0">
        <label htmlFor={`${idPrefix}roast-dialect-select`} className="sr-only">
          Select roast dialect
        </label>
        <select
          id={`${idPrefix}roast-dialect-select`}
          aria-label="Roast dialect"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#111214] text-[#F4F4F4] border border-white/25 px-2 py-1 sm:px-2.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#FF5A52] cursor-pointer max-w-[195px] sm:max-w-none truncate"
        >
          {ROAST_DIALECT_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.code === "auto"
                ? autoDetectedLabel
                : `${opt.label} (${opt.regionHint})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
