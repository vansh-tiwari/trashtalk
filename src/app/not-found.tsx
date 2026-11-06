import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-surface bg-canvas border border-rule flex items-center justify-center text-muted font-mono text-sm font-semibold">
        404
      </div>

      <div className="space-y-1">
        <h1 className="font-sans font-semibold text-xl sm:text-2xl text-ink tracking-tight">
          match not found.
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          the requested matchup doesn’t exist or hasn’t been fought yet.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF5A2A] hover:bg-[#F04C1D] text-[#111214] text-xs font-extrabold border-2 border-ink shadow-[2px_2px_0px_#111214] transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>back to the arena</span>
        </Link>
      </div>
    </div>
  );
}
