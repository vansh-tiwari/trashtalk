"use client";

import React from "react";

export interface MarqueeItem {
  persona?: string;
  quote: string;
}

const DEFAULT_MARQUEE_ITEMS: MarqueeItem[] = [
  {
    persona: "Savage Senior Dev",
    quote: "Two hundred Two-Sum solves and not one unit test.",
  },
  {
    persona: "Silicon Valley VC",
    quote: "Strong traction, zero defensible moat, high churn risk.",
  },
  {
    persona: "UFC Ring Announcer",
    quote: "IT’S TIIIME! A brutal recursion knockout in round three!",
  },
  {
    persona: "Hype-Man",
    quote: "That streak is unreal! Now go touch some grass. Love you!",
  },
  {
    persona: "Savage Senior Dev",
    quote: "Your last commit message was ‘fix’. So were the three before it.",
  },
];

export interface MarqueeTickerProps {
  items?: MarqueeItem[];
  className?: string;
}

export default function MarqueeTicker({
  items = DEFAULT_MARQUEE_ITEMS,
  className = "",
}: MarqueeTickerProps) {
  // Duplicate array to enable seamless continuous scroll loop
  const displayItems = [...items, ...items, ...items];

  return (
    <div
      className={`tk select-none ${className}`}
      role="region"
      aria-label="Recent roasts ticker"
    >
      <div>
        {displayItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <span>
              {item.persona ? `${item.persona}: ` : ""}
              {item.quote}
            </span>
            <em aria-hidden="true">/</em>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
