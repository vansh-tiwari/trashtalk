"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionPauseToggle } from "@/components/motion/MotionProvider";

export default function Navbar() {
  const pathname = usePathname();
  const isBattlePage = pathname?.startsWith("/battle/");

  return (
    <header className="sticky top-0 z-50 w-full bg-[#15171B]/95 backdrop-blur-md text-[#F4F4F4] border-b border-white/10 select-none">
      <div className="w">
        <div className="top" style={{ borderBottom: "none" }}>
          <Link href="/" className="lg text-[#F4F4F4] no-underline hover:opacity-90 transition-opacity">
            TrashTalk<sup className="text-punch">2.0</sup>
          </Link>

          <div className="tl">
            <MotionPauseToggle />
            {isBattlePage ? (
              <>
                <Link href="/battle" className="hover:text-punch transition-colors text-white/90 font-medium">
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
                    padding: "0 18px",
                  }}
                >
                  Share
                </a>
              </>
            ) : (
              <>
                <Link href="/#how-it-works" className="hidden sm:inline hover:text-punch transition-colors text-white/90 font-medium">
                  How it works
                </Link>
                <Link href="/evolution" className="hidden sm:inline hover:text-punch transition-colors text-white/90 font-medium">
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
                    fontSize: "16px",
                    padding: "0 18px",
                  }}
                >
                  Start a battle
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
