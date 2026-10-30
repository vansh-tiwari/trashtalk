"use client";

import React from "react";
import { RadarAxes } from "@/lib/battle/types";

interface RadarChartProps {
  axes1: RadarAxes;
  axes2: RadarAxes;
  label1: string;
  label2: string;
  platform?: string;
}

export default function RadarChart({ axes1, axes2, label1, label2, platform }: RadarChartProps) {
  const isGithub = platform?.toLowerCase() === "github";
  const axes = isGithub
    ? ([
        { key: "algorithmicGrit", label: "Star Gravity" },
        { key: "contestPeak", label: "Cadence" },
        { key: "solveVolume", label: "Repo Depth" },
        { key: "recentVelocity", label: "Community" },
        { key: "topicBreadth", label: "Stack Breadth" },
      ] as const)
    : ([
        { key: "algorithmicGrit", label: "Grit" },
        { key: "contestPeak", label: "Contest Peak" },
        { key: "solveVolume", label: "Solve Volume" },
        { key: "recentVelocity", label: "Velocity" },
        { key: "topicBreadth", label: "Breadth" },
      ] as const);

  const size = 300;
  const center = size / 2;
  const radius = 95;
  const totalAxes = axes.length;

  function getCoordinates(value: number, index: number) {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, value)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  const p1Points = axes
    .map((axis, i) => {
      const val = axes1[axis.key] ?? 0;
      const coords = getCoordinates(val, i);
      return `${coords.x},${coords.y}`;
    })
    .join(" ");

  const p2Points = axes
    .map((axis, i) => {
      const val = axes2[axis.key] ?? 0;
      const coords = getCoordinates(val, i);
      return `${coords.x},${coords.y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Web Rings */}
        {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
          const points = axes
            .map((_, i) => {
              const coords = getCoordinates(level * 100, i);
              return `${coords.x},${coords.y}`;
            })
            .join(" ");
          return (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes Lines */}
        {axes.map((_, i) => {
          const coords = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={coords.x}
              y2={coords.y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Player 1 Polygon (Cyan) */}
        <polygon
          points={p1Points}
          fill="rgba(6, 182, 212, 0.25)"
          stroke="#06b6d4"
          strokeWidth="2"
        />

        {/* Player 2 Polygon (Pink) */}
        <polygon
          points={p2Points}
          fill="rgba(236, 72, 153, 0.25)"
          stroke="#ec4899"
          strokeWidth="2"
        />

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const coords = getCoordinates(120, i);
          return (
            <text
              key={i}
              x={coords.x}
              y={coords.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-mono fill-gray-400 font-semibold"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50" />
          <span className="text-gray-300 font-semibold">@{label1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-pink-500 inline-block shadow-sm shadow-pink-500/50" />
          <span className="text-gray-300 font-semibold">@{label2}</span>
        </div>
      </div>
    </div>
  );
}
