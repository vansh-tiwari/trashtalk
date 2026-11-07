import React from "react";
import { Swords } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="p-8 sm:p-12 border-2 border-ink bg-surface shadow-[6px_6px_0px_#111214] max-w-lg w-full space-y-6">
        {/* Swords Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-none border-2 border-ink bg-punch flex items-center justify-center shadow-[3px_3px_0px_#111214] animate-bounce">
          <Swords className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="sr-only">loading...</span>
          <div className="inline-block px-2.5 py-0.5 bg-ink text-dk-text text-[10px] font-mono font-bold uppercase tracking-widest">
            THE ARENA · STANDBY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-ink font-sans">
            TALLYING THE RECEIPTS
          </h2>
          <p className="text-xs sm:text-sm text-muted font-mono leading-relaxed">
            Loading &amp; parsing solves · computing 5-axis mathematical grit · prepping the roast...
          </p>
        </div>

        {/* Pulsing Brutalist Progress Bar */}
        <div className="w-full h-3 border-2 border-ink bg-white overflow-hidden p-0.5">
          <div className="h-full bg-punch animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
