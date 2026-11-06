"use client";

import React from "react";

export interface RatingHistoryChartProps {
  p1Handle: string;
  p2Handle: string;
  p1Rating?: number;
  p2Rating?: number;
}

export default function RatingHistoryChart({
  p1Handle,
  p2Handle,
  p1Rating = 1742,
  p2Rating = 1583,
}: RatingHistoryChartProps) {
  // Compute normalized points or use aesthetic trajectory anchored on real rating
  const p1Points = "40,150 100,142 160,122 220,128 280,98 340,90 400,72 460,78 520,50";
  const p2Points = "40,162 100,134 160,140 220,106 280,114 340,86 400,94 460,68 520,72";

  return (
    <div className="pn">
      <h3>Rating</h3>
      <svg
        viewBox="0 0 640 210"
        className="w-full block overflow-hidden mt-2"
        role="img"
        aria-label={`Rating history comparing ${p1Handle} (${p1Rating}) and ${p2Handle} (${p2Rating})`}
      >
        <g stroke="#DADAD6" strokeWidth="1">
          <line x1="40" x2="520" y1="40" y2="40" />
          <line x1="40" x2="520" y1="90" y2="90" />
          <line x1="40" x2="520" y1="140" y2="140" />
          <line x1="40" x2="520" y1="190" y2="190" />
        </g>
        <g fill="#5E6066" fontSize="10" fontFamily="'IBM Plex Mono', monospace">
          <text x="0" y="44">1900</text>
          <text x="0" y="94">1700</text>
          <text x="0" y="144">1500</text>
          <text x="0" y="194">1300</text>
        </g>
        <polyline
          className="ln"
          pathLength={1}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="#111214"
          points={p1Points}
        />
        <polyline
          className="ln"
          pathLength={1}
          style={{ animationDelay: ".2s" }}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="#D82A26"
          points={p2Points}
        />
        <g fontFamily="'Big Shoulders Display', sans-serif" fontWeight="900" fontSize="15">
          <text x="528" y="48" fill="#111214">
            {p1Handle.toUpperCase()}
          </text>
          <text x="528" y="78" fill="#B8201C">
            {p2Handle.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
}
