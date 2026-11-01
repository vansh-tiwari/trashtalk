"use client";

import React from "react";

export interface OdometerValueProps {
  value: number | string;
  className?: string;
  ariaLabel?: string;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Tabular rolling odometer digit component matching the brutalist design spec.
 * Animates vertical digit strips via CSS keyframes with accessible aria-label and reduced-motion fallback.
 */
export default function OdometerValue({
  value,
  className = "",
  ariaLabel,
}: OdometerValueProps) {
  const str = String(value);
  const formattedAria = ariaLabel ?? str;

  return (
    <span className={`od ${className}`} aria-label={formattedAria} role="img">
      {Array.from(str).map((char, index) => {
        const digitNum = parseInt(char, 10);
        if (isNaN(digitNum)) {
          return (
            <span key={index} className="inline-block" aria-hidden="true">
              {char}
            </span>
          );
        }

        return (
          <span key={index} aria-hidden="true">
            <i style={{ "--d": digitNum } as React.CSSProperties}>
              {DIGITS.map((d) => (
                <b key={d}>{d}</b>
              ))}
            </i>
          </span>
        );
      })}
    </span>
  );
}
