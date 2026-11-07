"use client";

import React from "react";
import { formatNum } from "@/lib/battle/formatters";

export interface ActivityHeatmapProps {
  p1Handle: string;
  p2Handle: string;
  p1TotalSolves?: number;
  p2TotalSolves?: number;
  p1Activity?: number[];
  p2Activity?: number[];
  unitLabel?: string;
}

// Generate consistent visual intensity pattern across 26 weeks x 7 days
function generateGridPattern(seed: number): number[] {
  const cells: number[] = [];
  let s = seed;
  for (let i = 0; i < 26 * 7; i++) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    if (rnd > 0.8) cells.push(4);
    else if (rnd > 0.6) cells.push(3);
    else if (rnd > 0.4) cells.push(2);
    else if (rnd > 0.22) cells.push(1);
    else cells.push(0);
  }
  return cells;
}

export default function ActivityHeatmap({
  p1Handle,
  p2Handle,
  p1TotalSolves = 1284,
  p2TotalSolves = 2037,
  p1Activity,
  p2Activity,
  unitLabel = "solves",
}: ActivityHeatmapProps) {
  const p1Cells = React.useMemo(() => {
    if (p1Activity && p1Activity.length === 26 * 7) {
      return p1Activity;
    }
    return generateGridPattern(p1Handle.length * 37 + 11);
  }, [p1Activity, p1Handle]);

  const p2Cells = React.useMemo(() => {
    if (p2Activity && p2Activity.length === 26 * 7) {
      return p2Activity;
    }
    return generateGridPattern(p2Handle.length * 43 + 19);
  }, [p2Activity, p2Handle]);

  return (
    <div className="pn">
      <h3>Activity</h3>
      {/* Player 1 Heatmap */}
      <div className="mono" style={{ margin: "10px 0 6px", color: "var(--ink)" }}>
        {p1Handle} · {formatNum(p1TotalSolves)} {unitLabel}
      </div>
      <div className="overflow-x-auto max-w-full pb-1">
        <div
          className="hm"
          style={{ "--p": "#111214" } as React.CSSProperties}
          role="img"
          aria-label={`${p1Handle} activity heatmap`}
        >
          {p1Cells.map((level, i) => (
            <i
              key={i}
              className={`c l${level}`}
              style={{ "--c": Math.floor(i / 7) } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Player 2 Heatmap */}
      <div className="mono" style={{ margin: "16px 0 6px", color: "var(--ord)" }}>
        {p2Handle} · {formatNum(p2TotalSolves)} {unitLabel}
      </div>
      <div className="overflow-x-auto max-w-full pb-1">
        <div
          className="hm"
          style={{ "--p": "#D82A26" } as React.CSSProperties}
          role="img"
          aria-label={`${p2Handle} activity heatmap`}
        >
          {p2Cells.map((level, i) => (
            <i
              key={i}
              className={`c l${level}`}
              style={{ "--c": Math.floor(i / 7) } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
