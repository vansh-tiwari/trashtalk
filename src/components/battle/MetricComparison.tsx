"use client";

import React from "react";
import type { BattleViewModel } from "@/lib/battle/presentation";

export interface MetricComparisonProps {
  vm: BattleViewModel;
}

export default function MetricComparison({ vm }: MetricComparisonProps) {
  const { metrics, p1, p2, platform } = vm;
  const isGithub = platform?.toLowerCase() === "github";

  return (
    <div className="pn select-none" aria-label="Comparative Metrics">
      <h3 className="sr-only">the receipts.</h3>

      {/* Card Header & Player Badges */}
      <div className="flex items-center justify-between border-b border-rule pb-3 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-ink shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs font-bold text-ink uppercase truncate">
            @{p1.handle}
          </span>
          {p1.score !== undefined && (
            <span className="text-[11px] font-mono text-muted bg-[#EDEDEA] px-1.5 py-0.5 rounded font-bold">
              {p1.score}
            </span>
          )}
        </div>

        <div className="text-center px-2 shrink-0">
          <span className="font-mono text-[10px] font-bold text-muted uppercase tracking-widest block">
            {isGithub ? "OSS RECEIPTS" : "TALE OF THE TAPE"}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0 justify-end">
          {p2.score !== undefined && (
            <span className="text-[11px] font-mono text-punch bg-punch/10 px-1.5 py-0.5 rounded font-bold">
              {p2.score}
            </span>
          )}
          <span className="font-mono text-xs font-bold text-punch uppercase truncate">
            @{p2.handle}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-punch shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="space-y-4">
        {metrics.map((row, idx) => {
          const v1 = row.p1.kind === "value" && typeof row.p1.value === "number" ? row.p1.value : 50;
          const v2 = row.p2.kind === "value" && typeof row.p2.value === "number" ? row.p2.value : 50;
          const max = Math.max(v1, v2, 1);
          const w1 = Math.min(100, Math.max(8, Math.round((v1 / max) * 100)));
          const w2 = Math.min(100, Math.max(8, Math.round((v2 / max) * 100)));
          const delay = `${((idx + 1) * 0.1).toFixed(1)}s`;

          const p1Wins = row.advantage === "p1";
          const p2Wins = row.advantage === "p2";

          return (
            <div key={row.key} className="tpr-row group">
              {/* Row Header: Label & Lead Indicator */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-sans font-semibold text-muted text-xs group-hover:text-ink transition-colors">
                  {row.label}
                </span>

                {p1Wins && (
                  <span className="font-mono text-[10px] font-bold text-ink bg-[#EDEDEA] px-2 py-0.5 rounded tracking-wide">
                    @{p1.handle} {row.delta ? `(${row.delta})` : "leads"}
                  </span>
                )}
                {p2Wins && (
                  <span className="font-mono text-[10px] font-bold text-punch bg-punch/10 px-2 py-0.5 rounded tracking-wide">
                    @{p2.handle} {row.delta ? `(${row.delta})` : "leads"}
                  </span>
                )}
                {!p1Wins && !p2Wins && (
                  <span className="font-mono text-[10px] font-medium text-muted bg-[#F5F5F3] px-2 py-0.5 rounded tracking-wide">
                    TIED
                  </span>
                )}
              </div>

              {/* Two Bars with Gauge Track Slots & Big Values */}
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Left: Player 1 (Formatted Value + Right-to-Left Bar) */}
                <div className="flex items-center gap-3 justify-end">
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-black leading-none tracking-tight transition-colors ${
                      p1Wins ? "text-ink" : "text-muted/60"
                    }`}
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}
                  >
                    {row.p1.formatted}
                  </span>
                  <div className="relative w-full max-w-[130px] sm:max-w-[160px] h-[18px] bg-[#EAEAE6] rounded-[2px] overflow-hidden flex justify-end">
                    <i
                      className="block h-full bg-ink"
                      style={
                        {
                          "--w": `${w1}%`,
                          "--d": delay,
                          width: `${w1}%`,
                          animation: "fill 12s infinite backwards",
                          animationDelay: delay,
                          transformOrigin: "right",
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Right: Player 2 (Left-to-Right Bar + Formatted Value) */}
                <div className="flex items-center gap-3 justify-start">
                  <div className="relative w-full max-w-[130px] sm:max-w-[160px] h-[18px] bg-[#EAEAE6] rounded-[2px] overflow-hidden flex justify-start">
                    <i
                      className="block h-full bg-punch"
                      style={
                        {
                          "--w": `${w2}%`,
                          "--d": delay,
                          width: `${w2}%`,
                          animation: "fill 12s infinite backwards",
                          animationDelay: delay,
                          transformOrigin: "left",
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-black leading-none tracking-tight transition-colors ${
                      p2Wins ? "text-punch" : "text-muted/60"
                    }`}
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}
                  >
                    {row.p2.formatted}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
