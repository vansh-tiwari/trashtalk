"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { useMotionPolicy } from "./MotionProvider";
import { MOTION_PRESETS } from "@/lib/motion/presets";

const EASE_OUT_CUBIC: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export type RevealKind =
  | "headline"
  | "panelLeft"
  | "panelRight"
  | "roast"
  | "share"
  | "vsSlab"
  | "winnerStamp";

export interface RevealProps {
  children: React.ReactNode;
  sceneKey?: string;
  kind: RevealKind;
  delayMs?: number;
  className?: string;
}

export function Reveal({
  children,
  sceneKey,
  kind,
  delayMs,
  className = "",
}: RevealProps) {
  const { mode, isHydrated } = useMotionPolicy();
  const [mounted, setMounted] = useState(false);
  const lastKeyRef = useRef<string | undefined>(sceneKey);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = isHydrated && mounted && mode === "full";

  // Storyboard variants
  const getVariants = (): { initial: any; animate: any; transition: Transition } => {
    switch (kind) {
      case "headline":
        return {
          initial: { opacity: 0.65, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: MOTION_PRESETS.headline.durationSec,
            delay: (delayMs ?? MOTION_PRESETS.headline.delayMs ?? 0) / 1000,
            ease: EASE_OUT_CUBIC,
          },
        };
      case "panelLeft":
        return {
          initial: { opacity: 0.8, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: {
            duration: MOTION_PRESETS.panelSlide.durationSec,
            delay: (delayMs ?? MOTION_PRESETS.panelSlide.delayMs ?? 150) / 1000,
            ease: EASE_OUT_CUBIC,
          },
        };
      case "panelRight":
        return {
          initial: { opacity: 0.8, x: 20 },
          animate: { opacity: 1, x: 0 },
          transition: {
            duration: MOTION_PRESETS.panelSlide.durationSec,
            delay: (delayMs ?? MOTION_PRESETS.panelSlide.delayMs ?? 150) / 1000,
            ease: EASE_OUT_CUBIC,
          },
        };
      case "vsSlab":
        return {
          initial: { scaleX: 0.3, opacity: 0.7 },
          animate: { scaleX: 1, opacity: 1 },
          transition: {
            duration: MOTION_PRESETS.vsSlab.durationSec,
            delay: (delayMs ?? MOTION_PRESETS.vsSlab.delayMs ?? 450) / 1000,
            ease: EASE_OUT_CUBIC,
          },
        };
      case "winnerStamp":
        return {
          initial: { scale: 1.15, rotate: -8, opacity: 0.8 },
          animate: { scale: 1, rotate: -3, opacity: 1 },
          transition: {
            duration: MOTION_PRESETS.winnerStamp.durationSec,
            delay: (delayMs ?? MOTION_PRESETS.winnerStamp.delayMs ?? 650) / 1000,
            ease: EASE_OUT_BACK,
          },
        };
      case "roast":
        return {
          initial: { opacity: 0.75, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: MOTION_PRESETS.roast.durationSec,
            delay: (delayMs ?? MOTION_PRESETS.roast.delayMs ?? 600) / 1000,
            ease: EASE_OUT_CUBIC,
          },
        };
      case "share":
        return {
          initial: { opacity: 0.8, y: 12, rotate: 2 },
          animate: { opacity: 1, y: 0, rotate: 0 },
          transition: {
            duration: MOTION_PRESETS.sharePreview.durationSec,
            delay: (delayMs ?? 0) / 1000,
            ease: EASE_OUT_CUBIC,
          },
        };
    }
  };

  // If not mounted or in reduced/paused mode, render standard static markup
  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  const v = getVariants();

  return (
    <motion.div
      key={sceneKey}
      initial={v.initial}
      animate={v.animate}
      transition={v.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
