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
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center select-none max-w-xl mx-auto my-8">
      <div className="w-full p-8 sm:p-10 border-4 border-ink bg-surface shadow-[8px_8px_0px_#111214] space-y-6 text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-punch" />

        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-ink text-dk-text font-mono text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-punch" aria-hidden="true" />
              <span>500 · FOUL</span>
            </span>
            <span className="font-mono text-xs text-muted uppercase">technical timeout in the ring</span>
          </div>
          <span className="font-mono text-xs text-punch font-bold uppercase">STANDBY</span>
        </div>

        <div className="space-y-2">
          <h1
            className="big text-ink uppercase"
            style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 0.95 }}
          >
            something went wrong.
          </h1>
          <p className="font-sans text-sm sm:text-base text-muted leading-relaxed">
            we couldn’t complete this request. The arena remains open—retry the round or head back to the main stage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="fb o inline-flex items-center gap-2"
            style={{ minHeight: "48px", padding: "0 22px", fontSize: "17px" }}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>try again</span>
          </button>

          <Link
            href="/"
            className="fb inline-flex items-center gap-2"
            style={{
              backgroundColor: "#FFFFFF",
              color: "var(--ink)",
              borderColor: "var(--ink)",
              minHeight: "48px",
              padding: "0 20px",
              fontSize: "17px",
            }}
          >
            <ArrowLeft className="w-4 h-4 text-punch" aria-hidden="true" />
            <span>arena</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
