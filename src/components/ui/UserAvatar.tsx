"use client";

import React, { useState } from "react";

export interface UserAvatarProps {
  handle: string;
  avatarUrl?: string;
  side?: "p1" | "p2" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function normalizeAvatarUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return trimmed;
}

export function getAvatarInitials(handle: string): string {
  const clean = handle.replace(/^@+/, "").trim();
  if (!clean) return "??";
  return clean.slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  handle,
  avatarUrl,
  side = "neutral",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const normalizedUrl = normalizeAvatarUrl(avatarUrl);
  const initials = getAvatarInitials(handle);
  const identityKey = `${handle}:${normalizedUrl ?? ""}`;

  // Reset error state whenever the handle or image URL changes
  const [lastIdentity, setLastIdentity] = useState(identityKey);
  const [hasError, setHasError] = useState(false);

  if (identityKey !== lastIdentity) {
    setLastIdentity(identityKey);
    setHasError(false);
  }

  // Size mappings
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl",
  }[size];

  // Side color tokens
  const sideBorder = {
    p1: "border-player1/40",
    p2: "border-player2/40",
    neutral: "border-rule",
  }[side];

  const sideBg = {
    p1: "bg-player1/20 text-ink",
    p2: "bg-player2/20 text-ink",
    neutral: "bg-surface text-ink",
  }[side];

  // If URL exists and no error has occurred, attempt to render the image
  if (normalizedUrl && !hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-surface overflow-hidden border border-rule/80 bg-surface relative shrink-0 ${className}`}
      >
        <img
          src={normalizedUrl}
          alt={`@${handle}`}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful Monogram Initials Fallback
  return (
    <div
      className={`${sizeClasses} rounded-surface border ${sideBorder} ${sideBg} flex items-center justify-center font-sans font-bold shrink-0 select-none ${className}`}
      aria-label={`@${handle}`}
      title={`@${handle}`}
    >
      {initials}
    </div>
  );
}
