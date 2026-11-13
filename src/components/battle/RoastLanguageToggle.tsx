"use client";

import React from "react";
import { ROAST_DIALECT_OPTIONS } from "@/lib/ringside/context";

export interface RoastLanguageToggleProps {
  languageMode: "regional" | "english";
  onToggle: (mode: "regional" | "english") => void;
  regionalLabel: string;
  selectedDialect?: string;
  onDialectChange?: (dialectCode: string) => void;
  className?: string;
}

export default function RoastLanguageToggle({
  languageMode,
  onToggle,
  regionalLabel,
  selectedDialect,
  onDialectChange,
  className = "",
}: RoastLanguageToggleProps) {
  const regionalOptions = ROAST_DIALECT_OPTIONS.filter(
    (opt) => opt.code !== "auto" && opt.code !== "en"
  );

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 select-none ${className}`}>
      <div
        role="group"
        aria-label="Toggle roast language"
        className="inline-flex items-center rounded-md border-2 border-ink bg-[#15171B] p-0.5 shadow-[2px_2px_0px_#111214]"
      >
        <button
          type="button"
          onClick={() => onToggle("regional")}
          aria-pressed={languageMode === "regional"}
          className={`px-3 py-1 text-xs font-mono font-bold tracking-wider rounded transition-all whitespace-nowrap ${
            languageMode === "regional"
              ? "bg-[#D82A26] text-white shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
        >
          {regionalLabel}
        </button>
        <button
          type="button"
          onClick={() => onToggle("english")}
          aria-pressed={languageMode === "english"}
          className={`px-3 py-1 text-xs font-mono font-bold tracking-wider rounded transition-all whitespace-nowrap ${
            languageMode === "english"
              ? "bg-white text-[#111214] shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
        >
          ENGLISH
        </button>
      </div>

      {onDialectChange && (
        <label className="inline-flex items-center">
          <span className="sr-only">Switch regional roast dialect</span>
          <select
            aria-label="Switch regional roast dialect"
            value={selectedDialect || "hi"}
            onChange={(e) => {
              onDialectChange(e.target.value);
              onToggle("regional");
            }}
            className="rounded-md border-2 border-ink bg-[#F2F2F0] text-[#111214] px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#111214] focus:outline-none cursor-pointer"
          >
            {regionalOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.shortLabel} ({opt.regionHint})
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
