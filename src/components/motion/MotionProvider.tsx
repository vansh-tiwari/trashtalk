"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type MotionMode, resolveMotionMode } from "@/lib/motion/presets";
import { Pause, Play } from "lucide-react";

interface MotionContextValue {
  mode: MotionMode;
  paused: boolean;
  togglePaused: () => void;
  isHydrated: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  mode: "full",
  paused: false,
  togglePaused: () => {},
  isHydrated: false,
});

export function useMotionPolicy(): MotionContextValue {
  return useContext(MotionContext);
}

export function MotionPauseToggle({ className = "" }: { className?: string }) {
  const { paused, togglePaused, mode, isHydrated } = useMotionPolicy();

  if (!isHydrated) {
    return null;
  }

  const isReduced = mode === "reduced";

  return (
    <button
      type="button"
      onClick={togglePaused}
      disabled={isReduced}
      aria-label={paused ? "Resume motion" : "Pause motion"}
      aria-pressed={paused}
      title={
        isReduced
          ? "Motion reduced by operating system preference"
          : paused
          ? "Resume animation"
          : "Pause animation"
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-rule transition-colors ${
        paused
          ? "bg-[#FF5A2A] text-ink border-[#FF5A2A]"
          : "bg-surface text-ink hover:bg-canvas"
      } ${isReduced ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {paused ? (
        <>
          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
          <span>Resume motion</span>
        </>
      ) : (
        <>
          <Pause className="w-3 h-3 fill-current" aria-hidden="true" />
          <span>Pause motion</span>
        </>
      )}
    </button>
  );
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    setIsHydrated(true);

    // Read initial OS preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }

    // Read tab-scoped preference from sessionStorage
    try {
      const stored = sessionStorage.getItem("trashtalk:motion-paused");
      if (stored === "true") {
        setPaused(true);
      }
    } catch {
      // Ignore private browsing / security errors
    }

    // Listen to document visibility changes
    const onVisibilityChange = () => {
      // document.hidden handled by consumers or pause state
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const togglePaused = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("trashtalk:motion-paused", String(next));
      } catch {
        // quiet
      }
      return next;
    });
  }, []);

  const mode = resolveMotionMode(prefersReduced, paused);

  return (
    <MotionContext.Provider value={{ mode, paused, togglePaused, isHydrated }}>
      {children}
    </MotionContext.Provider>
  );
}
