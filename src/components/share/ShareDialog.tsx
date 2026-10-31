"use client";

import React, { useState, useEffect, useRef } from "react";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import {
  type CardFormat,
  getCanonicalBattleUrl,
  getCardUrl,
  copyText,
  shareBattle,
} from "@/lib/share/client";
import { buildBattleCopy } from "@/lib/battle/copy";
import { Reveal } from "@/components/motion/Reveal";
import { X, Copy, Check, Share2, Download, RefreshCw, Image as ImageIcon } from "lucide-react";

export interface ShareDialogProps {
  snapshot: BattleSnapshot;
  open: boolean;
  onClose: () => void;
}

const FORMAT_CONFIG: Record<
  CardFormat,
  { label: string; dimensions: string; aspectRatio: string }
> = {
  og: {
    label: "Landscape (OG)",
    dimensions: "1200×630",
    aspectRatio: "aspect-[1200/630]",
  },
  square: {
    label: "Square (Post)",
    dimensions: "1080×1080",
    aspectRatio: "aspect-square",
  },
  story: {
    label: "Story (Mobile)",
    dimensions: "1080×1920",
    aspectRatio: "aspect-[1080/1920]",
  },
};

export default function ShareDialog({ snapshot, open, onClose }: ShareDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<CardFormat>("og");
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const [copyImageState, setCopyImageState] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const [shareError, setShareError] = useState<string | null>(null);
  const [canDeviceShare, setCanDeviceShare] = useState(false);

  // Check device share support on client mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanDeviceShare(true);
    }
  }, []);

  // Modal lifecycle, focus capture, focus restoration
  useEffect(() => {
    if (!open) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }

    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
      lastActiveElementRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonicalUrl = getCanonicalBattleUrl(origin, snapshot.id);
  const copy = buildBattleCopy(snapshot);

  const winner = snapshot.verdict.winnerHandle;
  const loser = snapshot.verdict.loserHandle;
  const margin = snapshot.verdict.margin;

  const tweetHeadline = winner && loser
    ? `@${winner} took @${loser} to task (+${margin} pts) on @TrashTalkArena!\n\n"${copy.roastText}"\n\n`
    : `@${snapshot.player1.handle} vs @${snapshot.player2.handle} on trashtalk.\n\n"${copy.roastText}"\n\n`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetHeadline + canonicalUrl)}`;
  const cardPreviewUrl = getCardUrl(snapshot.id, selectedFormat);
  const downloadUrl = getCardUrl(snapshot.id, selectedFormat, true);

  const handleFormatChange = (fmt: CardFormat) => {
    setSelectedFormat(fmt);
    setImageLoading(true);
    setImageError(false);
  };

  const handleImageRetry = () => {
    setImageLoading(true);
    setImageError(false);
    setImageKey((k) => k + 1);
  };

  const handleCopy = async () => {
    setCopyState("copying");
    setShareError(null);
    try {
      await copyText(canonicalUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
    }
  };

  const handleCopyImage = async () => {
    setCopyImageState("copying");
    setShareError(null);
    try {
      const res = await fetch(cardPreviewUrl);
      const blob = await res.blob();
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopyImageState("copied");
        setTimeout(() => setCopyImageState("idle"), 2500);
        return;
      }
      throw new Error("ClipboardItem not supported");
    } catch {
      setCopyImageState("error");
      setTimeout(() => setCopyImageState("idle"), 3000);
    }
  };

  const handleDeviceShare = async () => {
    setShareError(null);
    try {
      const outcome = await shareBattle({
        title: `@${snapshot.player1.handle} vs @${snapshot.player2.handle} · trashtalk`,
        text: tweetHeadline,
        url: canonicalUrl,
      });
      if (outcome === "unsupported") {
        setShareError("Device sharing is not supported by your browser.");
      }
    } catch {
      setShareError("Could not complete device share. Please copy the link instead.");
    }
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      open
      onClick={handleDialogClick}
      onCancel={handleCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      aria-labelledby="share-dialog-title"
      aria-modal="true"
      className="fixed inset-0 m-auto p-0 rounded-[20px] bg-white text-ink border-2 border-ink shadow-[8px_8px_0px_#111214] backdrop:bg-black/50 w-[calc(100%-2rem)] max-w-xl max-h-[90vh] overflow-y-auto z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-ink">
        <div>
          <h2 id="share-dialog-title" className="font-sans font-extrabold text-xl text-ink tracking-tight">
            share this matchup
          </h2>
          <p className="text-xs text-secondary font-medium mt-0.5">
            @{snapshot.player1.handle} vs @{snapshot.player2.handle}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="p-2 rounded-lg text-secondary hover:text-ink hover:bg-[#F4F4F6] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border-2 border-transparent hover:border-ink"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Savage Roast Callout */}
        <div className="bg-[#111214] text-white p-3.5 rounded-xl border-2 border-ink shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] font-bold text-[#FF5A52] uppercase tracking-wider">
              SAVAGE RECEIPT
            </span>
            <span className="font-mono text-[10px] text-[#DADAD6] font-bold uppercase">
              {copy.outcomeLine}
            </span>
          </div>
          <p className="text-xs font-semibold text-white/95 italic leading-relaxed">
            "{copy.roastText}"
          </p>
        </div>

        {/* Format Selector Tablist */}
        <div
          role="tablist"
          aria-label="Match card format"
          className="flex items-center gap-1 p-1 bg-[#F4F4F6] rounded-xl border-2 border-ink"
        >
          {(["og", "square", "story"] as CardFormat[]).map((fmt) => {
            const isSelected = selectedFormat === fmt;
            const cfg = FORMAT_CONFIG[fmt];
            return (
              <button
                key={fmt}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${fmt}`}
                id={`tab-${fmt}`}
                onClick={() => handleFormatChange(fmt)}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all min-h-[44px] flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-[#111214] text-white border border-[#111214] shadow-xs"
                    : "text-secondary hover:text-ink font-bold"
                }`}
              >
                <span>{cfg.label}</span>
                <span className={`text-[10px] font-tabular mt-0.5 ${isSelected ? "text-white/70 font-normal" : "text-secondary font-normal"}`}>
                  {cfg.dimensions}
                </span>
              </button>
            );
          })}
        </div>

        {/* Card Preview Container */}
        <div
          id={`panel-${selectedFormat}`}
          role="tabpanel"
          aria-labelledby={`tab-${selectedFormat}`}
          className="relative w-full min-h-[220px] max-h-[320px] sm:max-h-[360px] flex items-center justify-center p-3 bg-[#F4F4F6] rounded-xl border-2 border-ink overflow-hidden"
        >
          <Reveal kind="share" sceneKey={selectedFormat} className="flex items-center justify-center max-h-full max-w-full">
            <div
              className={`relative max-h-full max-w-full ${FORMAT_CONFIG[selectedFormat].aspectRatio} flex items-center justify-center`}
            >
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F4F4F6]/80 text-xs text-secondary font-medium">
                  rendering savage card preview...
                </div>
              )}
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-[#F4F4F6]">
                  <p className="text-xs text-secondary font-medium">failed to load card preview</p>
                  <button
                    type="button"
                    onClick={handleImageRetry}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A2A] hover:underline min-h-[44px] px-3 py-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>retry</span>
                  </button>
                </div>
              ) : (
                <img
                  key={`${selectedFormat}-${imageKey}`}
                  src={cardPreviewUrl}
                  alt={`Match card preview for ${snapshot.player1.handle} vs ${snapshot.player2.handle} (${selectedFormat})`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  className="max-h-[240px] sm:max-h-[300px] w-auto h-auto object-contain rounded-lg border-2 border-ink shadow-md"
                />
              )}
            </div>
          </Reveal>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border-2 border-ink hover:bg-[#F4F4F6] text-xs font-bold text-ink transition-colors min-h-[44px]"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-positive" aria-hidden="true" />
                  <span>link copied!</span>
                </>
              ) : copyState === "copying" ? (
                <span>copying...</span>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                  <span>copy link</span>
                </>
              )}
            </button>

            {/* Copy Image Button */}
            <button
              type="button"
              onClick={handleCopyImage}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border-2 border-ink hover:bg-[#F4F4F6] text-xs font-bold text-ink transition-colors min-h-[44px]"
            >
              {copyImageState === "copied" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-positive" aria-hidden="true" />
                  <span>image copied!</span>
                </>
              ) : copyImageState === "copying" ? (
                <span>copying...</span>
              ) : copyImageState === "error" ? (
                <span className="text-amber-700">use download</span>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                  <span>copy image</span>
                </>
              )}
            </button>

            {/* Share to X */}
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border-2 border-ink hover:bg-[#F4F4F6] text-xs font-bold text-ink transition-colors min-h-[44px]"
            >
              <Share2 className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
              <span>share to X</span>
            </a>

            {/* Download PNG for Selected Format */}
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5A2A] hover:bg-[#F04C1D] text-[#111214] text-xs font-extrabold border-2 border-ink shadow-[2px_2px_0px_#111214] transition-all min-h-[44px]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>download PNG</span>
            </a>
          </div>

          {/* Device Share Button (Native Web Share) */}
          {canDeviceShare && (
            <button
              type="button"
              onClick={handleDeviceShare}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F4F4F6] border-2 border-ink hover:bg-white text-xs font-bold text-ink transition-colors min-h-[44px]"
            >
              <Share2 className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
              <span>share via device sheet</span>
            </button>
          )}

          {/* Copy Error Fallback */}
          {copyState === "error" && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <p>could not access clipboard. Copy directly:</p>
              <input
                type="text"
                readOnly
                value={canonicalUrl}
                onFocus={(e) => e.target.select()}
                className="w-full text-xs px-2 py-1 rounded border border-rule bg-surface text-ink font-mono"
              />
            </div>
          )}

          {/* Share Error Feedback */}
          {shareError && (
            <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
              {shareError}
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
