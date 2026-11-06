"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ reset }: ErrorProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-surface bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h1 className="font-sans font-semibold text-xl sm:text-2xl text-ink tracking-tight">
          something went wrong.
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          we couldn’t complete this request. The arena remains open.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#FF5A2A] hover:bg-[#F04C1D] text-[#111214] text-xs font-extrabold border-2 border-ink shadow-[2px_2px_0px_#111214] transition-all min-h-[44px]"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>try again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border-2 border-ink hover:bg-[#F4F4F6] text-xs font-bold text-ink transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
          <span>arena</span>
        </Link>
      </div>
    </div>
  );
}
