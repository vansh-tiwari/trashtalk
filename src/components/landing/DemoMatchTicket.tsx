"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import { useMotionPolicy } from "@/components/motion/MotionProvider";
import { Reveal } from "@/components/motion/Reveal";

export interface DemoMatchTicketProps {
  snapshot: BattleSnapshot;
  className?: string;
}

export default function DemoMatchTicket({
  snapshot,
  className = "",
}: DemoMatchTicketProps) {
  const { mode } = useMotionPolicy();
  const shouldDrift = mode === "full";

  const p1 = snapshot.player1;
  const p2 = snapshot.player2;

  return (
    <div className={`relative w-full max-w-[420px] ${className}`}>
      {/* Decorative Orbits behind the ticket */}
      <div
        className="pointer-events-none absolute inset-0 sm:-inset-6 select-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full border border-rule/60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] sm:w-[540px] h-[460px] sm:h-[540px] rounded-full border border-rule/30" />
        <span className="absolute top-2 right-6 text-2xl text-brand font-serif">✳</span>
      </div>

      {/* The Ambient Drifting Interactive Ticket */}
      <motion.div
        animate={shouldDrift ? { y: [-4, 4, -4] } : { y: 0 }}
        transition={
          shouldDrift
            ? { repeat: Infinity, duration: 4.5, ease: "easeInOut" }
            : undefined
        }
      >
        <Link
          href={`/battle/${snapshot.id}`}
          aria-label="Open tourist versus Petr Codeforces demo"
          className="group relative block w-full bg-surface border-2 border-ink rounded-[20px] shadow-[6px_6px_0px_#111214] select-none cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#111214]"
        >
          {/* Ticket Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-ink bg-surface text-xs font-bold text-ink">
            <span className="uppercase tracking-wider">legendary matchup</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-ink text-white font-semibold text-[11px]">
              <span>demo</span>
              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>

          {/* Saturated Split-Color Matchup Cards */}
          <div className="grid grid-cols-2 relative border-b-2 border-ink">
            {/* Player 1: Saturated Cobalt */}
            <Reveal kind="panelLeft" sceneKey={snapshot.id}>
              <div className="p-5 bg-[#304BFF] text-white flex flex-col justify-between min-h-[160px] border-r-2 border-ink">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-[#304BFF] flex items-center justify-center font-bold text-sm uppercase">
                    {p1.handle[0]}
                  </div>
                  <h3 className="font-bold text-sm truncate text-white">
                    @{p1.handle}
                  </h3>
                </div>

                <div className="mt-4">
                  <div className="text-4xl sm:text-5xl font-extrabold font-tabular text-white tracking-tight leading-none">
                    {p1.score.total}
                    <span className="text-xs font-normal text-white/80 ml-1">/100</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Central VS Slab */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <Reveal kind="vsSlab" sceneKey={snapshot.id}>
                <div className="bg-[#111214] text-white font-black text-xs uppercase px-3 py-1 rounded-[6px] shadow-md border border-white/20 -rotate-12 tracking-widest">
                  VS
                </div>
              </Reveal>
            </div>

            {/* Player 2: Saturated Orange */}
            <Reveal kind="panelRight" sceneKey={snapshot.id}>
              <div className="p-5 bg-[#FF5A2A] text-[#111214] flex flex-col justify-between min-h-[160px]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#111214] text-white flex items-center justify-center font-bold text-sm uppercase">
                    {p2.handle[0]}
                  </div>
                  <h3 className="font-bold text-sm truncate text-[#111214]">
                    @{p2.handle}
                  </h3>
                </div>

                <div className="mt-4">
                  <div className="text-4xl sm:text-5xl font-extrabold font-tabular text-[#111214] tracking-tight leading-none">
                    {p2.score.total}
                    <span className="text-xs font-normal text-[#111214]/75 ml-1">/100</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Roast Section & Outcome Stamp */}
          <div className="p-5 bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary">
                the roast
              </span>

              {/* Lime Eligible Winner Stamp */}
              <Reveal kind="winnerStamp" sceneKey={snapshot.id}>
                <span className="inline-block px-2.5 py-0.5 bg-[#D6FF45] text-[#111214] font-black text-xs rounded border border-[#111214] shadow-xs uppercase tracking-tight -rotate-3">
                  tourist +7 ↗
                </span>
              </Reveal>
            </div>

            <Reveal kind="roast" sceneKey={snapshot.id}>
              <p className="text-base sm:text-lg font-bold text-ink leading-snug">
                Same legendary status.
                <br />
                Different tax brackets.
              </p>
            </Reveal>

            <div className="pt-2 border-t border-rule flex items-center justify-between text-xs text-secondary font-medium">
              <span>sample matchup</span>
              <span className="inline-flex items-center gap-1 text-ink group-hover:text-brand font-bold transition-colors">
                <span>open the receipts</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
