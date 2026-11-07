"use client";

import React from "react";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import { GitFork, MapPin, Building, Calendar, Code } from "lucide-react";
import { formatNum } from "@/lib/battle/formatters";

export interface GithubStackSummaryProps {
  snapshot: BattleSnapshot;
}

export default function GithubStackSummary({ snapshot }: GithubStackSummaryProps) {
  const p1Meta = snapshot.githubMetadata?.player1;
  const p2Meta = snapshot.githubMetadata?.player2;
  const p1Handle = snapshot.player1.handle;
  const p2Handle = snapshot.player2.handle;

  const p1JoinedYear = p1Meta?.createdAt ? new Date(p1Meta.createdAt).getFullYear() : undefined;
  const p2JoinedYear = p2Meta?.createdAt ? new Date(p2Meta.createdAt).getFullYear() : undefined;

  const p1Languages = p1Meta?.languages?.slice(0, 5) ?? [];
  const p2Languages = p2Meta?.languages?.slice(0, 5) ?? [];

  const p1TotalLangRepos = p1Languages.reduce((acc, l) => acc + l.repoCount, 0) || 1;
  const p2TotalLangRepos = p2Languages.reduce((acc, l) => acc + l.repoCount, 0) || 1;

  return (
    <div className="pn select-none" aria-label="GitHub Developer Dossier & Language Stack">
      <h3>Stack & Dossier</h3>

      {/* Player 1 Dossier */}
      <div className="mt-3 pb-3 border-b border-rule">
        <div className="flex items-center justify-between">
          <span className="mono font-bold text-ink">@{p1Handle}</span>
          {p1JoinedYear && (
            <span className="text-[11px] font-mono text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {p1JoinedYear}
            </span>
          )}
        </div>

        {p1Meta?.bio && (
          <p className="text-xs text-muted italic my-1.5 line-clamp-2">
            &ldquo;{p1Meta.bio}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted mt-1.5">
          {p1Meta?.company && (
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" /> {p1Meta.company}
            </span>
          )}
          {p1Meta?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {p1Meta.location}
            </span>
          )}
          {p1Meta?.totalForks !== undefined && p1Meta.totalForks > 0 && (
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" /> {formatNum(p1Meta.totalForks)} forks
            </span>
          )}
        </div>

        {/* Player 1 Languages Bar */}
        {p1Languages.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-mono uppercase text-muted mb-1 flex items-center gap-1">
              <Code className="w-3 h-3" /> Core Languages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p1Languages.map((lang) => {
                const pct = Math.round((lang.repoCount / p1TotalLangRepos) * 100);
                return (
                  <span
                    key={lang.name}
                    className="px-2 py-0.5 bg-canvas border border-rule text-[11px] font-mono text-ink"
                  >
                    {lang.name} <span className="text-muted text-[10px]">({pct}%)</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Player 2 Dossier */}
      <div className="mt-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="mono font-bold text-punch">@{p2Handle}</span>
          {p2JoinedYear && (
            <span className="text-[11px] font-mono text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {p2JoinedYear}
            </span>
          )}
        </div>

        {p2Meta?.bio && (
          <p className="text-xs text-muted italic my-1.5 line-clamp-2">
            &ldquo;{p2Meta.bio}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted mt-1.5">
          {p2Meta?.company && (
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" /> {p2Meta.company}
            </span>
          )}
          {p2Meta?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {p2Meta.location}
            </span>
          )}
          {p2Meta?.totalForks !== undefined && p2Meta.totalForks > 0 && (
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" /> {formatNum(p2Meta.totalForks)} forks
            </span>
          )}
        </div>

        {/* Player 2 Languages Bar */}
        {p2Languages.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-mono uppercase text-muted mb-1 flex items-center gap-1">
              <Code className="w-3 h-3" /> Core Languages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p2Languages.map((lang) => {
                const pct = Math.round((lang.repoCount / p2TotalLangRepos) * 100);
                return (
                  <span
                    key={lang.name}
                    className="px-2 py-0.5 bg-canvas border border-rule text-[11px] font-mono text-ink"
                  >
                    {lang.name} <span className="text-muted text-[10px]">({pct}%)</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
