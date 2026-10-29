"use client";

import React from "react";
import { RoastPersona } from "@/lib/ai/schemas";

export interface PersonaOption {
  value: RoastPersona;
  label: string;
}

export const PERSONA_OPTIONS: readonly PersonaOption[] = [
  { value: "savage_dev", label: "savage dev" },
  { value: "silicon_valley_vc", label: "VC energy" },
  { value: "ufc_announcer", label: "fight night" },
  { value: "hype_man", label: "hype friend" },
] as const;

interface PersonaSelectProps {
  value: RoastPersona;
  onChange: (val: RoastPersona) => void;
  disabled?: boolean;
  className?: string;
}

export default function PersonaSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: PersonaSelectProps) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm text-secondary font-medium cursor-pointer ${className}`}>
      <span>roast style</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RoastPersona)}
        disabled={disabled}
        aria-label="Roast style"
        className="h-9 px-2.5 py-1 bg-surface border border-rule text-ink text-sm rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#304BFF] focus:border-[#304BFF] transition-colors disabled:opacity-50 cursor-pointer font-sans font-medium"
      >
        {PERSONA_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
