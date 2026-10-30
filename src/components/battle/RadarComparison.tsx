"use client";

import React, { useState } from "react";
import type { RadarAxes } from "@/lib/battle/types";

export interface RadarComparisonProps {
  axes1: RadarAxes;
  axes2: RadarAxes;
  p1Handle: string;
  p2Handle: string;
  platform?: string;
  p1Score?: number;
  p2Score?: number;
}

export default function RadarComparison({
  axes1,
  axes2,
  p1Handle,
  p2Handle,
  platform,
  p1Score,
  p2Score,
}: RadarComparisonProps) {
  const [showTable, setShowTable] = useState(false);

  const isGithub = platform?.toLowerCase() === "github";
  const axisDefs = isGithub
    ? [
        { key: "algorithmicGrit" as const, label: "GRAVITY", fullLabel: "Star Gravity", weight: "30%" },
        { key: "contestPeak" as const, label: "CADENCE", fullLabel: "Shipping Cadence", weight: "25%" },
        { key: "solveVolume" as const, label: "REPOS", fullLabel: "Repo Depth", weight: "20%" },
        { key: "recentVelocity" as const, label: "COMMUNITY", fullLabel: "Community Reach", weight: "15%" },
        { key: "topicBreadth" as const, label: "STACK", fullLabel: "Tech Stack", weight: "10%" },
      ]
    : [
        { key: "algorithmicGrit" as const, label: "GRIT", fullLabel: "Algorithmic Grit", weight: "30%" },
        { key: "contestPeak" as const, label: "PEAK", fullLabel: "Contest Peak", weight: "25%" },
        { key: "solveVolume" as const, label: "VOLUME", fullLabel: "Solve Volume", weight: "20%" },
        { key: "recentVelocity" as const, label: "VELOCITY", fullLabel: "Recent Solves", weight: "15%" },
        { key: "topicBreadth" as const, label: "BREADTH", fullLabel: "Topic Breadth", weight: "10%" },
      ];

  const center = [160, 140];
  const radius = 90;
  const total = axisDefs.length;

  const getPoint = (i: number, val: number) => {
    const angle = ((i * (360 / total) - 90) * Math.PI) / 180;
    const r = (Math.min(100, Math.max(8, val)) / 100) * radius;
    return {
      x: Number((center[0] + Math.cos(angle) * r).toFixed(1)),
      y: Number((center[1] + Math.sin(angle) * r).toFixed(1)),
      raw: `${(center[0] + Math.cos(angle) * r).toFixed(1)},${(center[1] + Math.sin(angle) * r).toFixed(1)}`,
    };
  };

  const getLabelCoords = (i: number) => {
    const angle = ((i * (360 / total) - 90) * Math.PI) / 180;
    const labelDist = radius + 22;
    const x = center[0] + Math.cos(angle) * labelDist;
    const y = center[1] + Math.sin(angle) * labelDist;

    let textAnchor: "middle" | "start" | "end" = "middle";
    let dy = "0.35em";

    if (i === 1 || i === 2) {
      textAnchor = "start";
    } else if (i === 3 || i === 4) {
      textAnchor = "end";
    }

    if (i === 0) {
      dy = "-0.3em";
    } else if (i === 2 || i === 3) {
      dy = "0.75em";
    }

    return { x: x.toFixed(1), y: y.toFixed(1), textAnchor, dy };
  };

  const polyPoints = (scale: number) =>
    axisDefs.map((_, i) => getPoint(i, scale * 100).raw).join(" ");

  const p1Points = axisDefs.map((a, i) => getPoint(i, axes1[a.key] ?? 50));
  const p2Points = axisDefs.map((a, i) => getPoint(i, axes2[a.key] ?? 50));

  const p1Polygon = p1Points.map((p) => p.raw).join(" ");
  const p2Polygon = p2Points.map((p) => p.raw).join(" ");

  return (
    <div className="pn select-none" aria-label="Radar chart comparing five axes">
      <h3 className="sr-only">skill check.</h3>

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-rule pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-ink uppercase tracking-wide">
              SKILL RADAR
            </span>
            <span className="font-mono text-[10px] text-muted bg-[#EDEDEA] px-1.5 py-0.5 rounded">
              5 AXES (0–100)
            </span>
          </div>
          <p className="text-[11px] text-muted mt-0.5">
            {isGithub
              ? "Open-source footprint across 5 normalized dimensions"
              : "Competitive profile across 5 normalized dimensions"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="font-mono text-xs text-muted hover:text-ink underline decoration-dotted"
          aria-expanded={showTable}
        >
          {showTable ? "Show radar" : "Show table"}
        </button>
      </div>

      {!showTable ? (
        <>
          <svg
            viewBox="0 0 320 290"
            style={{ width: "100%", maxWidth: "380px", display: "block", margin: "0 auto" }}
            role="img"
            aria-label={`Radar chart comparing ${p1Handle} and ${p2Handle}`}
          >
            {/* Background Spoke Lines */}
            {axisDefs.map((_, i) => {
              const outer = getPoint(i, 100);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={center[0]}
                  y1={center[1]}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#DADAD6"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Concentric Pentagon Grid Rings */}
            <g fill="none" stroke="#C9C9C4" strokeWidth="1">
              <polygon points={polyPoints(1.0)} />
              <polygon points={polyPoints(0.6)} strokeDasharray="3 3" />
              <polygon points={polyPoints(0.3)} strokeDasharray="2 2" />
            </g>

            {/* Player 1 (Obsidian Black Polygon) */}
            <polygon
              className="rd"
              points={p1Polygon}
              fill="#111214"
              fillOpacity=".15"
              stroke="#111214"
              strokeWidth="2.5"
            />
            {p1Points.map((p, i) => (
              <circle
                key={`p1-dot-${i}`}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#111214"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            ))}

            {/* Player 2 (Punch Red Polygon) */}
            <polygon
              className="rd"
              style={{ animationDelay: ".2s" }}
              points={p2Polygon}
              fill="#D82A26"
              fillOpacity=".22"
              stroke="#D82A26"
              strokeWidth="2.5"
            />
            {p2Points.map((p, i) => (
              <circle
                key={`p2-dot-${i}`}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#D82A26"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            ))}

            {/* Dynamic Axis Labels with Trigonometric Coordinates */}
            <g fill="#5E6066" fontSize="11" fontFamily="'IBM Plex Mono', monospace" fontWeight="600">
              {axisDefs.map((axis, i) => {
                const { x, y, textAnchor, dy } = getLabelCoords(i);
                return (
                  <text
                    key={axis.key}
                    x={x}
                    y={y}
                    dy={dy}
                    textAnchor={textAnchor}
                  >
                    {axis.label}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Legend with Scores */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", marginTop: "14px" }}>
            <span className="who" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <i style={{ background: "var(--bl)", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" }} aria-hidden="true" />
              <span className="font-mono text-xs font-bold text-ink">@{p1Handle}</span>
              {p1Score !== undefined && (
                <span className="text-[10px] font-mono text-muted bg-[#EDEDEA] px-1 py-0.2 rounded">
                  {p1Score} pts
                </span>
              )}
            </span>
            <span className="who" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <i style={{ background: "var(--or)", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" }} aria-hidden="true" />
              <span className="font-mono text-xs font-bold text-punch">@{p2Handle}</span>
              {p2Score !== undefined && (
                <span className="text-[10px] font-mono text-punch bg-punch/10 px-1 py-0.2 rounded">
                  {p2Score} pts
                </span>
              )}
            </span>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto py-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule text-[11px] font-mono text-muted uppercase">
            <span>Dimension (Weight)</span>
            <div className="flex gap-8">
              <span className="w-16 text-center text-ink font-bold">@{p1Handle}</span>
              <span className="w-16 text-center text-punch font-bold">@{p2Handle}</span>
            </div>
          </div>
          <div className="space-y-2">
            {axisDefs.map((a) => {
              const val1 = axes1[a.key] ?? 0;
              const val2 = axes2[a.key] ?? 0;
              const diff = val1 - val2;
              return (
                <div key={a.key} className="flex items-center justify-between py-1.5 border-b border-rule/40 text-xs font-mono">
                  <div>
                    <span className="font-bold text-ink">{a.fullLabel}</span>
                    <span className="ml-2 text-[10px] text-muted">({a.weight})</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className={`w-16 text-center font-bold ${diff > 0 ? "text-ink" : "text-muted"}`}>
                      {val1}
                    </span>
                    <span className={`w-16 text-center font-bold ${diff < 0 ? "text-punch" : "text-muted"}`}>
                      {val2}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
