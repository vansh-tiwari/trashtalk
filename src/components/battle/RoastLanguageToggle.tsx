"use client";

import React from "react";

export interface RoastLanguageToggleProps {
  languageMode: "regional" | "english";
  onToggle: (mode: "regional" | "english") => void;
  regionalLabel: string;
  className?: string;
}

export default function RoastLanguageToggle({
  languageMode,
  onToggle,
  regionalLabel,
  className = "",
}: RoastLanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label="Toggle roast language"
      className={`inline-flex items-center rounded-md border-2 border-ink bg-[#15171B] p-0.5 shadow-[2px_2px_0px_#111214] select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => onToggle("regional")}
        aria-pressed={languageMode === "regional"}
        className={`px-3 py-1 text-xs font-mono font-bold tracking-wider rounded transition-all ${
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
        className={`px-3 py-1 text-xs font-mono font-bold tracking-wider rounded transition-all ${
          languageMode === "english"
            ? "bg-white text-[#111214] shadow-sm"
            : "text-white/60 hover:text-white"
        }`}
      >
        ENGLISH
      </button>
    </div>
  );
}
