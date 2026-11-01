"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMotionPolicy } from "./MotionProvider";
import { MOTION_PRESETS } from "@/lib/motion/presets";

export interface ScoreRevealProps {
  value: number;
  sceneKey?: string;
  accessibleLabel?: string;
  className?: string;
}

export function ScoreReveal({
  value,
  sceneKey,
  accessibleLabel,
  className = "",
}: ScoreRevealProps) {
  const { mode, isHydrated, paused } = useMotionPolicy();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const animFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // If not hydrated, or reduced motion, or paused: show final value immediately
    if (!isHydrated || mode !== "full") {
      setDisplayValue(value);
      return;
    }

    // Do not replay if sceneKey has not changed
    if (hasAnimatedRef.current === sceneKey) {
      setDisplayValue(value);
      return;
    }

    hasAnimatedRef.current = sceneKey;

    const delayMs = MOTION_PRESETS.scoreCount.delayMs ?? 250;
    const durationMs = MOTION_PRESETS.scoreCount.durationMs ?? 850;
    const startValue = Math.max(0, Math.floor(value * 0.3));

    let startTime: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    timerId = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      if (timerId) clearTimeout(timerId);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, sceneKey, mode, isHydrated]);

  // If paused mid-animation, immediately snap to final value
  useEffect(() => {
    if (paused) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setDisplayValue(value);
    }
  }, [paused, value]);

  const fallbackLabel = `${value} out of 100`;

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {/* Screen-reader accessible final value (never announces counting steps) */}
      <span className="sr-only">{accessibleLabel || fallbackLabel}</span>
      {/* Visible animated or settled digits */}
      <span aria-hidden="true" data-testid="scoreboard-score-digits">
        {displayValue}
      </span>
    </span>
  );
}
