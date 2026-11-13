"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Swords, Flame, Sparkles, GitBranch } from "lucide-react";
import { MotionPauseToggle } from "@/components/motion/MotionProvider";
import BroadcastDateline from "@/components/ringside/BroadcastDateline";

export default function Navbar() {
  const pathname = usePathname();
  const isBattlePage = pathname?.startsWith("/battle/");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#15171B]/95 backdrop-blur-md text-[#F4F4F4] border-b border-white/10 select-none">
      <BroadcastDateline variant="navbar" />
      <div className="w">
        <div className="top" style={{ borderBottom: "none" }}>
          <Link
            href="/"
            className="lg text-[#F4F4F4] no-underline hover:opacity-90 transition-opacity"
          >
            TrashTalk<sup className="text-punch">2.0</sup>
          </Link>

          <div className="tl">
            <div className="hidden sm:block">
              <MotionPauseToggle />
            </div>
            {isBattlePage ? (
              <>
                <Link
                  href="/battle"
                  className="hidden sm:inline hover:text-punch transition-colors text-white/90 font-medium"
                >
                  New battle
                </Link>
                <a
                  href="#share-arena"
                  className="fb"
                  style={{
                    background: "#FFFFFF",
                    color: "#111214",
                    borderColor: "#FFFFFF",
                    minHeight: "40px",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Share
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/#how-it-works"
                  className="hidden sm:inline hover:text-punch transition-colors text-white/90 font-medium"
                >
                  How it works
                </Link>
                <Link
                  href="/roast"
                  className="hidden md:inline hover:text-punch transition-colors text-white/90 font-medium"
                >
                  Solo roast
                </Link>
                <Link
                  href="/evolution"
                  className="hidden sm:inline hover:text-punch transition-colors text-white/90 font-medium"
                >
                  The lore
                </Link>
                <Link
                  href="/battle"
                  className="fb"
                  style={{
                    background: "#FFFFFF",
                    color: "#111214",
                    borderColor: "#FFFFFF",
                    minHeight: "40px",
                    fontSize: "15px",
                    padding: "0 14px",
                  }}
                >
                  Start a battle
                </Link>
              </>
            )}

            {/* Mobile Hamburger Drawer Button (< 640px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="sm:hidden inline-flex items-center justify-center w-10 h-10 border-2 border-white/30 bg-[#111214] text-[#F4F4F4] hover:border-white transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Brutalist Slide-Down Mobile Menu Drawer (< 640px) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="sm:hidden border-t-2 border-[#D82A26] bg-[#111214] text-[#F4F4F4] shadow-[0_16px_32px_rgba(0,0,0,0.65)]"
        >
          <div className="w py-3 flex flex-col divide-y divide-white/10">
            <Link
              href="/battle"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between min-h-[48px] py-2.5 text-sm font-mono uppercase tracking-wider text-white hover:text-[#FF5A52] transition-colors"
            >
              <span className="inline-flex items-center gap-2.5 font-bold">
                <Swords className="w-4 h-4 text-[#D82A26]" aria-hidden="true" />
                Enter Battle Arena
              </span>
              <span className="text-[11px] text-white/50">2 HANDLES →</span>
            </Link>

            <Link
              href="/roast"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between min-h-[48px] py-2.5 text-sm font-mono uppercase tracking-wider text-white hover:text-[#FF5A52] transition-colors"
            >
              <span className="inline-flex items-center gap-2.5 font-bold">
                <Flame className="w-4 h-4 text-[#FF5A52]" aria-hidden="true" />
                Solo Profile Roaster
              </span>
              <span className="text-[11px] text-white/50">MIRROR MATCH →</span>
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between min-h-[48px] py-2.5 text-sm font-mono uppercase tracking-wider text-white/90 hover:text-[#FF5A52] transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-white/60" aria-hidden="true" />
                How It Works
              </span>
              <span className="text-[11px] text-white/50">3 STEPS →</span>
            </Link>

            <Link
              href="/evolution"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between min-h-[48px] py-2.5 text-sm font-mono uppercase tracking-wider text-white/90 hover:text-[#FF5A52] transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <GitBranch className="w-4 h-4 text-white/60" aria-hidden="true" />
                The Lore (2020 → 2026)
              </span>
              <span className="text-[11px] text-white/50">ARCHITECTURE →</span>
            </Link>

            <div className="pt-3 pb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                Arena Motion
              </span>
              <MotionPauseToggle />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

