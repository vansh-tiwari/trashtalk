import React from "react";
import { Swords } from "lucide-react";

export default function BattleLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="p-8 sm:p-12 border-2 border-[#111214] bg-[#F2F2F0] shadow-[6px_6px_0px_#111214] max-w-lg w-full space-y-6">
        {/* Animated Icon */}
        <div className="w-16 h-16 mx-auto rounded-none border-2 border-[#111214] bg-[#D82A26] flex items-center justify-center shadow-[3px_3px_0px_#111214] animate-bounce">
          <Swords className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        {/* Status Typography */}
        <div className="space-y-2">
          <div className="inline-block px-2.5 py-0.5 bg-[#15171B] text-[#F4F4F4] text-[10px] font-mono font-bold uppercase tracking-widest">
            THE ARENA · STANDBY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111214] font-sans">
            TALLYING THE RECEIPTS
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6066] font-mono leading-relaxed">
            Parsing solves · computing 5-axis mathematical grit · prepping the roast...
          </p>
        </div>

        {/* Brutalist Progress Bar Animation */}
        <div className="w-full h-3 border-2 border-[#111214] bg-white overflow-hidden p-0.5">
          <div className="h-full bg-[#D82A26] animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
