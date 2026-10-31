"use client";

import React, { useState } from "react";
import { BattleSnapshot } from "@/lib/storage/contracts";
import { Share2, Copy, Check, Download, ChevronDown } from "lucide-react";

interface BattleShareActionsProps {
  snapshot: BattleSnapshot;
}

export default function BattleShareActions({ snapshot }: BattleShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  async function copyCanonicalUrl() {
    const canonicalUrl = typeof window !== "undefined"
      ? `${window.location.origin}/battle/${snapshot.id}`
      : `/battle/${snapshot.id}`;

    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy battle link:", canonicalUrl);
    }
  }

  function shareTwitter() {
    const canonicalUrl = typeof window !== "undefined"
      ? `${window.location.origin}/battle/${snapshot.id}`
      : `/battle/${snapshot.id}`;
    const text = `🔥 ${snapshot.player1.handle} vs ${snapshot.player2.handle} on TrashTalk 2.0!\n\nVerdict: ${snapshot.commentary.punchline}\n\nCheck the full AI Roast: ${canonicalUrl}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, "_blank");
  }

  function downloadCard(format: "og" | "story" | "square") {
    setShowFormats(false);
    window.open(`/api/og?id=${snapshot.id}&format=${format}&download=true`, "_blank");
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={copyCanonicalUrl}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200 border border-gray-700 transition-colors"
        title="Copy canonical battle URL"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? "Copied Link" : "Copy Link"}</span>
      </button>

      <button
        onClick={shareTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/20 text-xs font-mono transition-colors"
        title="Share to Twitter / X"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Share to X</span>
      </button>

      {/* Download Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowFormats(!showFormats)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 text-xs font-mono transition-colors"
          title="Download Battle Card"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Battle Card</span>
          <ChevronDown className="w-3 h-3 text-pink-400" />
        </button>

        {showFormats && (
          <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl py-1 z-50 text-xs font-mono">
            <button
              onClick={() => downloadCard("og")}
              className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-between"
            >
              <span>Landscape (OG)</span>
              <span className="text-[10px] text-gray-500">1200×630</span>
            </button>
            <button
              onClick={() => downloadCard("story")}
              className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-between"
            >
              <span>Story (Mobile)</span>
              <span className="text-[10px] text-gray-500">1080×1920</span>
            </button>
            <button
              onClick={() => downloadCard("square")}
              className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-between"
            >
              <span>Square (Post)</span>
              <span className="text-[10px] text-gray-500">1080×1080</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
