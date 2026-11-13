"use client";

import React, { useState } from "react";
import { Instagram, MessageCircle, Share2, Check } from "lucide-react";
import { trackArenaEvent } from "@/lib/analytics/client";

export type SocialChannel = "x" | "whatsapp" | "instagram" | "copy";

export interface SocialShareStripProps {
  twitterUrl: string;
  whatsappUrl: string;
  onInstagramShare: () => void;
  onCopyLink: () => void;
  copied?: boolean;
  instaReady?: boolean;
  defaultActive?: SocialChannel;
  onChannelSelect?: (channel: SocialChannel) => void;
  theme?: "dark" | "light";
  className?: string;
}

export default function SocialShareStrip({
  twitterUrl,
  whatsappUrl,
  onInstagramShare,
  onCopyLink,
  copied = false,
  instaReady = false,
  defaultActive = "x",
  onChannelSelect,
  theme = "dark",
  className = "",
}: SocialShareStripProps) {
  const [activeChannel, setActiveChannel] = useState<SocialChannel>(defaultActive);

  const handleHover = (channel: SocialChannel) => {
    setActiveChannel(channel);
  };

  const isXActive = activeChannel === "x";
  const isWhatsappActive = activeChannel === "whatsapp";
  const isInstaActive = activeChannel === "instagram";
  const isCopyActive = activeChannel === "copy" || copied;

  return (
    <div
      className={`share-strip ${theme === "dark" ? "is-dark" : "is-light"} ${className}`}
      role="group"
      aria-label="Social share actions"
      onMouseLeave={() => handleHover(defaultActive)}
    >
      {/* 1. X (Twitter) — Shows "SHARE TO X" when active, or "𝕏" icon when collapsed */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => handleHover("x")}
        onFocus={() => handleHover("x")}
        onClick={() => {
          trackArenaEvent("share_clicked", { channel: "x" });
          onChannelSelect?.("x");
        }}
        className={`share-strip-cell ${isXActive ? "is-active" : "is-collapsed"}`}
        aria-label="Share to X"
        title="Share to X"
      >
        <span
          className={`share-strip-x-icon ${isXActive ? "is-hidden" : ""}`}
          aria-hidden="true"
        >
          𝕏
        </span>
        <span
          className={`share-strip-label ${isXActive ? "is-open-no-icon" : ""}`}
          aria-hidden={!isXActive}
        >
          SHARE TO X
        </span>
      </a>

      {/* 2. WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => handleHover("whatsapp")}
        onFocus={() => handleHover("whatsapp")}
        onClick={() => {
          trackArenaEvent("share_clicked", { channel: "whatsapp" });
          onChannelSelect?.("whatsapp");
        }}
        className={`share-strip-cell ${isWhatsappActive ? "is-active" : "is-collapsed"}`}
        aria-label="Share to WhatsApp"
        title="Share to WhatsApp"
      >
        <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span
          className={`share-strip-label ${isWhatsappActive ? "is-open" : ""}`}
          aria-hidden={!isWhatsappActive}
        >
          SHARE TO WHATSAPP
        </span>
      </a>

      {/* 3. Instagram Story */}
      <button
        type="button"
        onMouseEnter={() => handleHover("instagram")}
        onFocus={() => handleHover("instagram")}
        onClick={() => {
          trackArenaEvent("share_clicked", { channel: "instagram" });
          onChannelSelect?.("instagram");
          onInstagramShare();
        }}
        className={`share-strip-cell ${isInstaActive ? "is-active" : "is-collapsed"}`}
        aria-label="Share to Instagram Story"
        title="Share to Instagram Story"
      >
        <Instagram className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span
          className={`share-strip-label ${isInstaActive ? "is-open" : ""}`}
          aria-hidden={!isInstaActive}
        >
          {instaReady ? "STORY READY!" : "SHARE TO INSTAGRAM STORY"}
        </span>
      </button>

      {/* 4. Share Icon (Copy Link) */}
      <button
        type="button"
        onMouseEnter={() => handleHover("copy")}
        onFocus={() => handleHover("copy")}
        onClick={() => {
          trackArenaEvent("share_clicked", { channel: "copy" });
          onChannelSelect?.("copy");
          onCopyLink();
        }}
        className={`share-strip-cell ${
          copied ? "is-copied" : isCopyActive ? "is-active" : "is-collapsed"
        }`}
        aria-label={copied ? "Link copied" : "Share link"}
        title={copied ? "Link copied!" : "Share link"}
      >
        {copied ? (
          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : (
          <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
        <span
          className={`share-strip-label ${isCopyActive ? "is-open" : ""}`}
          aria-hidden={!isCopyActive}
        >
          {copied ? "LINK COPIED!" : "SHARE LINK"}
        </span>
      </button>
    </div>
  );
}
