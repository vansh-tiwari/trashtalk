"use client";

import React, { useState } from "react";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import ShareDialog from "./ShareDialog";
import { Share2 } from "lucide-react";

export interface ShareMenuProps {
  snapshot: BattleSnapshot;
  triggerLabel?: string;
  className?: string;
  onOpen?: () => void;
}

export default function ShareMenu({
  snapshot,
  triggerLabel = "share this",
  className = "",
  onOpen,
}: ShareMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const handleClick = () => {
    if (onOpen) {
      onOpen();
    } else {
      setInternalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-rule hover:bg-canvas text-xs font-semibold text-ink transition-colors min-h-[44px] ${className}`}
        title={triggerLabel}
      >
        <Share2 className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {/* Render controlled/uncontrolled dialog */}
      {!onOpen && (
        <ShareDialog
          snapshot={snapshot}
          open={internalOpen}
          onClose={() => setInternalOpen(false)}
        />
      )}
    </>
  );
}
