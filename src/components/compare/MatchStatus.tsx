import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export type MatchStatusState = "idle" | "submitting" | "cooldown" | "busy" | "error";

interface MatchStatusProps {
  state: MatchStatusState;
  error?: string | null;
  cooldownSeconds?: number;
}

export default function MatchStatus({ state, error, cooldownSeconds }: MatchStatusProps) {
  if (state === "idle" || state === "submitting") return null;

  if (state === "busy" || state === "cooldown") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2.5 p-3.5 bg-surface border border-rule rounded-[14px] text-secondary text-sm font-sans"
      >
        <Loader2 className="w-4 h-4 animate-spin text-brand shrink-0" aria-hidden="true" />
        <span>
          Codeforces is busy. Try again shortly.
          {cooldownSeconds && cooldownSeconds > 0 ? ` (${cooldownSeconds}s)` : ""}
        </span>
      </div>
    );
  }

  if (state === "error" && error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex items-start gap-2.5 p-3.5 bg-[#F9ECEB] border border-[#E8B6B4] rounded-[14px] text-[#9D3232] text-sm font-sans"
      >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#9D3232]" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="font-semibold text-xs tracking-wide">Notice</p>
          <p className="text-xs text-[#9D3232]">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
